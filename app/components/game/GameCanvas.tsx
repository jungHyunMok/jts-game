'use client';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { drawCar } from './drawCars';
import { drawMap } from './drawMap';
import { drawPlayer } from './drawPlayer';
import { useGameLogic } from './useGameLogic';
import MobileControls from './MobileControls';
import { CANVAS_HEIGHT, CANVAS_WIDTH } from './constants';

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

const AUTO_NEXT_DELAY = 3; // 자동 다음 단계까지 카운트다운 (초)

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

export default function GameCanvas() {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [difficulty, setDifficulty] = useState(1);
  const [countdown, setCountdown] = useState(AUTO_NEXT_DELAY);
  const countdownTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const { gameState, playerRef, carsRef, crosswalksRef, startGame, pressKey, releaseKey, update } =
    useGameLogic(CANVAS_WIDTH, difficulty);

  const { status, elapsedTime, score } = gameState;
  const isPlaying = status === 'playing';
  const isFinalLevel = difficulty === 10;

  // 등교 성공 시 카운트다운 후 자동으로 다음 단계 시작
  useEffect(() => {
    if (status !== 'win') {
      if (countdownTimerRef.current) {
        clearInterval(countdownTimerRef.current);
        countdownTimerRef.current = null;
      }
      return;
    }
    if (isFinalLevel) return; // 10단계 클리어는 자동 진행 없음

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

  // difficulty가 증가(자동 진행)할 때 게임 즉시 시작
  const prevDifficultyRef = useRef(difficulty);
  useEffect(() => {
    if (difficulty > prevDifficultyRef.current) {
      // 다음 단계로 자동 진행된 경우
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
    drawMap(ctx, CANVAS_WIDTH, crosswalksRef.current);
    carsRef.current.forEach(car => drawCar(ctx, car));
    drawPlayer(ctx, playerRef.current);
  }, [carsRef, crosswalksRef, playerRef]);

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
      {/* HUD */}
      <div className="flex items-center justify-between w-full mb-2 px-1 gap-2">
        <div className="text-sm font-bold text-white bg-black/40 rounded px-2 py-1 shrink-0">
          ⏱ {elapsedTime}s
        </div>
        {status === 'win' ? (
          <div className="text-sm font-bold text-yellow-300 bg-black/40 rounded px-2 py-1 shrink-0">
            🏆 {score}점
          </div>
        ) : (
          <div className={`text-xs font-bold rounded px-2 py-1 shrink-0 ${DIFFICULTY_LABELS[difficulty].color} text-white`}>
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

      {/* Difficulty slider (disabled while playing) */}
      <div className="w-full mb-2 px-1">
        <DifficultySelector
          value={difficulty}
          onChange={v => { setDifficulty(v); }}
          disabled={isPlaying}
        />
      </div>

      {/* Canvas container */}
      <div ref={containerRef} className="relative w-full rounded-xl overflow-hidden shadow-2xl border-4 border-white/30">
        <canvas
          ref={canvasRef}
          width={CANVAS_WIDTH}
          height={CANVAS_HEIGHT}
          className="block"
          style={{ imageRendering: 'pixelated' }}
        />

        {/* Idle overlay */}
        {status === 'idle' && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/50 backdrop-blur-sm px-4">
            <h2 className="text-3xl font-bold text-white mb-2">🏃 등교 대작전!</h2>
            <p className="text-white/80 mb-1 text-sm">힐스테이트 부평 → 인천백운초등학교</p>
            <p className="text-white/70 text-xs mb-5">차를 피해 학교까지 안전하게 건너세요</p>
            <div className="w-full max-w-xs mb-5 bg-black/30 rounded-xl p-3">
              <DifficultySelector value={difficulty} onChange={setDifficulty} />
            </div>
            <button
              onClick={startGame}
              className="px-8 py-3 bg-green-500 hover:bg-green-400 text-white font-bold rounded-xl text-lg transition-colors shadow-lg"
            >
              게임 시작
            </button>
            <p className="text-white/50 text-xs mt-4">방향키 또는 아래 버튼으로 조작</p>
          </div>
        )}

        {/* Win overlay */}
        {status === 'win' && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/60 backdrop-blur-sm px-4">
            {isFinalLevel ? (
              // 10단계 전체 클리어
              <>
                <div className="text-5xl mb-2">🏆</div>
                <h2 className="text-3xl font-bold text-yellow-300 mb-1">전체 클리어!</h2>
                <p className="text-white/80 text-sm mb-3">모든 10단계를 완주했습니다!</p>
                <p className="text-white mb-1">
                  시간: <span className="font-bold text-green-300">{elapsedTime}초</span>
                </p>
                <p className="text-white mb-5">
                  점수: <span className="font-bold text-yellow-300 text-2xl">{score}점</span>
                </p>
                <button
                  onClick={handleRestart}
                  className="px-8 py-3 bg-green-500 hover:bg-green-400 text-white font-bold rounded-xl text-lg transition-colors shadow-lg"
                >
                  1단계부터 다시!
                </button>
              </>
            ) : (
              // 일반 단계 클리어
              <>
                <div className="text-4xl mb-2">🎉</div>
                <h2 className="text-2xl font-bold text-yellow-300 mb-1">
                  {DIFFICULTY_LABELS[difficulty].label} 클리어!
                </h2>
                <p className="text-white mb-1">
                  시간: <span className="font-bold text-green-300">{elapsedTime}초</span>
                  &nbsp;·&nbsp;점수: <span className="font-bold text-yellow-300">{score}점</span>
                </p>

                {/* 다음 단계 미리보기 */}
                <div className="flex items-center gap-2 mt-3 mb-4">
                  <span className="text-white/70 text-sm">다음 단계 →</span>
                  <span className={`text-sm font-bold text-white rounded px-3 py-1 ${DIFFICULTY_LABELS[difficulty + 1].color}`}>
                    {DIFFICULTY_LABELS[difficulty + 1].label}
                  </span>
                </div>

                {/* 카운트다운 원형 */}
                <div className="relative flex items-center justify-center w-16 h-16 mb-4">
                  <svg className="absolute inset-0 w-full h-full -rotate-90" viewBox="0 0 64 64">
                    <circle cx="32" cy="32" r="28" fill="none" stroke="white" strokeOpacity="0.2" strokeWidth="5" />
                    <circle
                      cx="32" cy="32" r="28"
                      fill="none" stroke="#FCD34D" strokeWidth="5"
                      strokeDasharray={`${2 * Math.PI * 28}`}
                      strokeDashoffset={`${2 * Math.PI * 28 * (1 - countdown / AUTO_NEXT_DELAY)}`}
                      strokeLinecap="round"
                      style={{ transition: 'stroke-dashoffset 0.9s linear' }}
                    />
                  </svg>
                  <span className="text-2xl font-bold text-yellow-300">{countdown}</span>
                </div>
                <p className="text-white/60 text-xs mb-4">{countdown}초 후 자동으로 다음 단계 시작</p>

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
      </div>

      {/* Mobile controls */}
      <MobileControls onPressKey={pressKey} onReleaseKey={releaseKey} />

      <p className="text-white/50 text-xs mt-3 text-center hidden md:block">
        ↑↓←→ 방향키로 이동 | 횡단보도로 안전하게 건너세요!
      </p>
    </div>
  );
}
