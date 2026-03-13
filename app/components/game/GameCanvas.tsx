'use client';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { drawCar } from './drawCars';
import { drawMap, drawOverpass } from './drawMap';
import { drawPlayer } from './drawPlayer';
import { useGameLogic } from './useGameLogic';
import { CANVAS_HEIGHT, CANVAS_WIDTH, INITIAL_LIVES } from './constants';
import { ActiveEffect } from './types';

const DIFFICULTY_LABELS: Record<number, { label: string; color: string }> = {
  1:  { label: '1단계',  color: 'bg-green-400' },
  2:  { label: '2단계',  color: 'bg-green-500' },
  3:  { label: '3단계',  color: 'bg-lime-500' },
  4:  { label: '4단계',  color: 'bg-yellow-400' },
  5:  { label: '5단계',  color: 'bg-yellow-500' },
  6:  { label: '6단계',  color: 'bg-orange-400' },
  7:  { label: '7단계',  color: 'bg-orange-500' },
  8:  { label: '8단계',  color: 'bg-red-400' },
  9:  { label: '9단계',  color: 'bg-red-500' },
  10: { label: '10단계', color: 'bg-red-700' },
};

const AUTO_NEXT_DELAY = 3;

const EFFECT_INFO: Record<string, { icon: string; label: string; color: string }> = {
  invincible:   { icon: '🛡️', label: '무적!',     color: 'bg-yellow-400 text-black' },
  overpass:     { icon: '🌉', label: '육교!',     color: 'bg-blue-400 text-white' },
  carSpeedUp:   { icon: '⚡', label: '차량 가속!', color: 'bg-red-500 text-white' },
  carSpeedDown: { icon: '🐢', label: '차량 감속!', color: 'bg-green-400 text-black' },
};

// ─── Mobile D-Pad overlay ─────────────────────────────────────────────────────
function DPadBtn({
  dir,
  label,
  onPress,
  onRelease,
}: {
  dir: string;
  label: string;
  onPress: (k: string) => void;
  onRelease: (k: string) => void;
}) {
  return (
    <button
      className="flex items-center justify-center w-12 h-12 rounded-xl bg-black/50 active:bg-black/70 border-2 border-white/50 text-white text-lg font-bold select-none touch-none"
      onTouchStart={e => {
        e.preventDefault();
        onPress(dir);
      }}
      onTouchEnd={e => {
        e.preventDefault();
        onRelease(dir);
      }}
      onTouchCancel={e => {
        e.preventDefault();
        onRelease(dir);
      }}
      onMouseDown={() => onPress(dir)}
      onMouseUp={() => onRelease(dir)}
      onMouseLeave={() => onRelease(dir)}
    >
      {label}
    </button>
  );
}

function DifficultySelector({
  value,
  onChange,
  disabled,
}: {
  value: number;
  onChange: (v: number) => void;
  disabled?: boolean;
}) {
  return (
    <div className="flex flex-col items-center gap-1 w-full">
      <div className="flex items-center gap-2 w-full">
        <span className="text-white/70 text-xs whitespace-nowrap">난이도</span>
        <input
          type="range"
          min={1}
          max={10}
          value={value}
          disabled={disabled}
          onChange={e => onChange(Number(e.target.value))}
          className="flex-1 accent-yellow-400 cursor-pointer disabled:opacity-50"
        />
        <span
          className={`text-xs font-bold text-white rounded px-2 py-0.5 min-w-[52px] text-center ${DIFFICULTY_LABELS[value].color}`}
        >
          {DIFFICULTY_LABELS[value].label}
        </span>
      </div>
      <div className="flex justify-between w-full px-1">
        <span className="text-green-300 text-xs">쉬움 🐢</span>
        <span className="text-red-300 text-xs">어려움 🔥</span>
      </div>
    </div>
  );
}

function LivesBar({ lives }: { lives: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {Array.from({ length: INITIAL_LIVES }).map((_, i) => (
        <span key={i} className={`text-base ${i < lives ? 'opacity-100' : 'opacity-25'}`}>
          ❤️
        </span>
      ))}
    </div>
  );
}

function EffectBadge({ effect, now }: { effect: ActiveEffect; now: number }) {
  const info = EFFECT_INFO[effect.type];
  if (!info) return null;
  const remaining = Math.max(0, Math.ceil((effect.endTime - now) / 1000));
  return (
    <div className={`flex items-center gap-1 text-xs font-bold rounded-full px-2 py-0.5 ${info.color}`}>
      <span>{info.icon}</span>
      <span>{info.label}</span>
      <span className="opacity-70">{remaining}s</span>
    </div>
  );
}

export default function GameCanvas() {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [difficulty, setDifficulty] = useState(1);
  const [countdown, setCountdown] = useState(AUTO_NEXT_DELAY);
  const [now, setNow] = useState(Date.now());
  const countdownTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const clockRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const {
    gameState,
    playerRef,
    carsRef,
    crosswalksRef,
    itemsRef,
    activeEffectsRef,
    tickRef,
    startGame,
    continueGame,
    pressKey,
    releaseKey,
    update,
  } = useGameLogic(CANVAS_WIDTH, difficulty);

  const { status, elapsedTime, score, lives, activeEffects } = gameState;
  const isPlaying = status === 'playing';
  const isFinalLevel = difficulty === 10;

  // Clock for effect countdowns
  useEffect(() => {
    clockRef.current = setInterval(() => setNow(Date.now()), 500);
    return () => {
      if (clockRef.current) clearInterval(clockRef.current);
    };
  }, []);

  // Auto-advance after win
  useEffect(() => {
    if (status !== 'win') {
      if (countdownTimerRef.current) {
        clearInterval(countdownTimerRef.current);
        countdownTimerRef.current = null;
      }
      return;
    }
    if (isFinalLevel) return;

    setCountdown(AUTO_NEXT_DELAY);
    countdownTimerRef.current = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) {
          clearInterval(countdownTimerRef.current!);
          countdownTimerRef.current = null;
          setDifficulty(d => d + 1);
          return AUTO_NEXT_DELAY;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (countdownTimerRef.current) clearInterval(countdownTimerRef.current);
    };
  }, [status, isFinalLevel]);

  // Auto-start when difficulty advances
  const prevDifficultyRef = useRef(difficulty);
  useEffect(() => {
    if (difficulty > prevDifficultyRef.current) {
      startGame();
    }
    prevDifficultyRef.current = difficulty;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [difficulty]);

  const render = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

    const t = Date.now();
    const overpassEffect = activeEffectsRef.current.find(
      e => e.type === 'overpass' && e.endTime > t
    );

    drawMap(ctx, CANVAS_WIDTH, crosswalksRef.current, itemsRef.current, tickRef.current);
    carsRef.current.forEach(car => drawCar(ctx, car));

    // Draw overpass on top of cars
    if (overpassEffect && overpassEffect.roadIndex !== undefined) {
      drawOverpass(ctx, CANVAS_WIDTH, overpassEffect.roadIndex, overpassEffect.endTime);
    }

    drawPlayer(ctx, playerRef.current);
  }, [carsRef, crosswalksRef, itemsRef, playerRef, activeEffectsRef, tickRef]);

  useEffect(() => {
    let raf: number;
    const loop = () => {
      update();
      render();
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, [update, render]);

  // Responsive scaling
  useEffect(() => {
    const resize = () => {
      if (!containerRef.current || !canvasRef.current) return;
      const containerW = containerRef.current.clientWidth;
      const scale = Math.min(1, containerW / CANVAS_WIDTH);
      canvasRef.current.style.width = `${CANVAS_WIDTH * scale}px`;
      canvasRef.current.style.height = `${CANVAS_HEIGHT * scale}px`;
    };
    resize();
    window.addEventListener('resize', resize);
    return () => window.removeEventListener('resize', resize);
  }, []);

  const handleRestart = () => {
    if (countdownTimerRef.current) {
      clearInterval(countdownTimerRef.current);
      countdownTimerRef.current = null;
    }
    setDifficulty(1);
    startGame();
  };

  const handleNextNow = () => {
    if (countdownTimerRef.current) {
      clearInterval(countdownTimerRef.current);
      countdownTimerRef.current = null;
    }
    setDifficulty(d => d + 1);
  };

  return (
    <div className="flex flex-col items-center w-full max-w-lg mx-auto px-2">
      {/* HUD top bar */}
      <div className="flex items-center justify-between w-full mb-2 px-1 gap-2">
        <div className="text-sm font-bold text-white bg-black/40 rounded px-2 py-1 shrink-0">
          ⏱ {elapsedTime}s
        </div>
        <LivesBar lives={lives} />
        {status === 'win' ? (
          <div className="text-sm font-bold text-yellow-300 bg-black/40 rounded px-2 py-1 shrink-0">
            🏆 {score}점
          </div>
        ) : (
          <div
            className={`text-xs font-bold rounded px-2 py-1 shrink-0 ${DIFFICULTY_LABELS[difficulty].color} text-white`}
          >
            {DIFFICULTY_LABELS[difficulty].label}
          </div>
        )}
        <button
          onClick={handleRestart}
          className="text-sm font-bold bg-green-500 hover:bg-green-400 active:bg-green-600 text-white rounded px-3 py-1 transition-colors shrink-0"
        >
          {status === 'idle' ? '▶ 시작' : '↺ 처음부터'}
        </button>
      </div>

      {/* Active effects bar */}
      {activeEffects.length > 0 && (
        <div className="flex gap-1 flex-wrap justify-center w-full mb-2">
          {activeEffects.map((e, i) => (
            <EffectBadge key={i} effect={e} now={now} />
          ))}
        </div>
      )}

      {/* Difficulty slider */}
      <div className="w-full mb-2 px-1">
        <DifficultySelector
          value={difficulty}
          onChange={v => setDifficulty(v)}
          disabled={isPlaying}
        />
      </div>

      {/* Canvas container */}
      <div
        ref={containerRef}
        className="relative w-full rounded-xl overflow-hidden shadow-2xl border-4 border-white/30"
      >
        <canvas
          ref={canvasRef}
          width={CANVAS_WIDTH}
          height={CANVAS_HEIGHT}
          className="block"
          style={{ imageRendering: 'pixelated' }}
        />

        {/* ─── Mobile D-Pad overlay (inside canvas, bottom area) ─── */}
        {isPlaying && (
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1 z-10 md:hidden">
            <DPadBtn dir="up" label="▲" onPress={pressKey} onRelease={releaseKey} />
            <div className="flex gap-1">
              <DPadBtn dir="left" label="◀" onPress={pressKey} onRelease={releaseKey} />
              <div className="w-12 h-12" />
              <DPadBtn dir="right" label="▶" onPress={pressKey} onRelease={releaseKey} />
            </div>
            <DPadBtn dir="down" label="▼" onPress={pressKey} onRelease={releaseKey} />
          </div>
        )}

        {/* ─── Idle overlay ─── */}
        {status === 'idle' && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/50 backdrop-blur-sm px-4">
            <h2 className="text-3xl font-bold text-white mb-2">🏃 등교 대작전!</h2>
            <p className="text-white/80 mb-1 text-sm">힐스테이트 부평 → 인천백운초등학교</p>
            <p className="text-white/70 text-xs mb-2">횡단보도로만 차도를 건너세요!</p>
            <div className="flex gap-3 text-xs text-white/60 mb-4 flex-wrap justify-center">
              <span>🛡️ 무적 상자</span>
              <span>🌉 육교 상자</span>
              <span>⚡ 가속 상자</span>
              <span>🐢 감속 상자</span>
            </div>
            <div className="w-full max-w-xs mb-5 bg-black/30 rounded-xl p-3">
              <DifficultySelector value={difficulty} onChange={setDifficulty} />
            </div>
            <button
              onClick={startGame}
              className="px-8 py-3 bg-green-500 hover:bg-green-400 text-white font-bold rounded-xl text-lg transition-colors shadow-lg"
            >
              게임 시작
            </button>
            <p className="text-white/50 text-xs mt-4">방향키 또는 화면 버튼으로 조작</p>
          </div>
        )}

        {/* ─── Win overlay ─── */}
        {status === 'win' && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/60 backdrop-blur-sm px-4">
            {isFinalLevel ? (
              <>
                <div className="text-5xl mb-2">🏆</div>
                <h2 className="text-3xl font-bold text-yellow-300 mb-1">전체 클리어!</h2>
                <p className="text-white/80 text-sm mb-3">모든 10단계를 완주했습니다!</p>
                <p className="text-white mb-1">
                  시간: <span className="font-bold text-green-300">{elapsedTime}초</span>
                </p>
                <p className="text-white mb-5">
                  점수:{' '}
                  <span className="font-bold text-yellow-300 text-2xl">{score}점</span>
                </p>
                <button
                  onClick={handleRestart}
                  className="px-8 py-3 bg-green-500 hover:bg-green-400 text-white font-bold rounded-xl text-lg transition-colors shadow-lg"
                >
                  1단계부터 다시!
                </button>
              </>
            ) : (
              <>
                <div className="text-4xl mb-2">🎉</div>
                <h2 className="text-2xl font-bold text-yellow-300 mb-1">
                  {DIFFICULTY_LABELS[difficulty].label} 클리어!
                </h2>
                <p className="text-white mb-1">
                  시간: <span className="font-bold text-green-300">{elapsedTime}초</span>
                  &nbsp;·&nbsp;점수:{' '}
                  <span className="font-bold text-yellow-300">{score}점</span>
                </p>

                <div className="flex items-center gap-2 mt-3 mb-4">
                  <span className="text-white/70 text-sm">다음 단계 →</span>
                  <span
                    className={`text-sm font-bold text-white rounded px-3 py-1 ${DIFFICULTY_LABELS[difficulty + 1].color}`}
                  >
                    {DIFFICULTY_LABELS[difficulty + 1].label}
                  </span>
                </div>

                <div className="relative flex items-center justify-center w-16 h-16 mb-4">
                  <svg className="absolute inset-0 w-full h-full -rotate-90" viewBox="0 0 64 64">
                    <circle
                      cx="32"
                      cy="32"
                      r="28"
                      fill="none"
                      stroke="white"
                      strokeOpacity="0.2"
                      strokeWidth="5"
                    />
                    <circle
                      cx="32"
                      cy="32"
                      r="28"
                      fill="none"
                      stroke="#FCD34D"
                      strokeWidth="5"
                      strokeDasharray={`${2 * Math.PI * 28}`}
                      strokeDashoffset={`${2 * Math.PI * 28 * (1 - countdown / AUTO_NEXT_DELAY)}`}
                      strokeLinecap="round"
                      style={{ transition: 'stroke-dashoffset 0.9s linear' }}
                    />
                  </svg>
                  <span className="text-2xl font-bold text-yellow-300">{countdown}</span>
                </div>
                <p className="text-white/60 text-xs mb-4">
                  {countdown}초 후 자동으로 다음 단계 시작
                </p>

                <div className="flex gap-3">
                  <button
                    onClick={handleNextNow}
                    className="px-6 py-2 bg-blue-500 hover:bg-blue-400 text-white font-bold rounded-xl transition-colors shadow-lg"
                  >
                    지금 시작 ▶
                  </button>
                  <button
                    onClick={handleRestart}
                    className="px-6 py-2 bg-white/20 hover:bg-white/30 text-white font-bold rounded-xl transition-colors"
                  >
                    1단계로
                  </button>
                </div>
              </>
            )}
          </div>
        )}

        {/* ─── Game Over overlay ─── */}
        {status === 'gameover' && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/75 backdrop-blur-sm px-4">
            <div className="text-5xl mb-3">💀</div>
            <h2 className="text-3xl font-bold text-red-400 mb-2">게임 오버!</h2>
            <p className="text-white/80 text-sm mb-1">목숨을 모두 잃었습니다</p>
            <p className="text-white/60 text-xs mb-6">
              ❤️ × {INITIAL_LIVES} 충전하거나 처음으로 돌아가세요
            </p>

            <div className="flex flex-col gap-3 w-full max-w-xs">
              <button
                onClick={continueGame}
                className="px-6 py-3 bg-green-500 hover:bg-green-400 active:bg-green-600 text-white font-bold rounded-xl text-base transition-colors shadow-lg"
              >
                ❤️ 이어서 하기 (목숨 {INITIAL_LIVES}개 충전)
              </button>
              <a
                href="/"
                className="block text-center px-6 py-3 bg-white/20 hover:bg-white/30 text-white font-bold rounded-xl text-base transition-colors"
              >
                🏠 메인으로 돌아가기
              </a>
            </div>
          </div>
        )}
      </div>

      {/* Desktop keyboard hint */}
      <p className="text-white/50 text-xs mt-3 text-center hidden md:block">
        ↑↓←→ 방향키로 이동 | 횡단보도로만 도로를 건너세요!
      </p>
    </div>
  );
}
