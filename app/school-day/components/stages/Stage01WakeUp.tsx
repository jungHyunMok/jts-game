'use client';
import { useEffect, useRef, useState } from 'react';
import { StageProps } from './stageTypes';

const REQUIRED_CLICKS = 20;
const TIME_LIMIT = 6; // seconds

export default function Stage01WakeUp({ onComplete }: StageProps) {
  const [clicks, setClicks] = useState(0);
  const [timeLeft, setTimeLeft] = useState(TIME_LIMIT);
  const [done, setDone] = useState(false);
  const [shake, setShake] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const startedRef = useRef(false);
  const doneRef = useRef(false);

  useEffect(() => {
    intervalRef.current = setInterval(() => {
      setTimeLeft(t => {
        if (t <= 1) {
          clearInterval(intervalRef.current!);
          if (!doneRef.current) {
            doneRef.current = true;
            setDone(true);
          }
          return 0;
        }
        return t - 1;
      });
    }, 1000);

    // alarm shake every 0.4s
    const alarmInterval = setInterval(() => {
      if (!doneRef.current) setShake(s => !s);
    }, 400);

    return () => {
      clearInterval(intervalRef.current!);
      clearInterval(alarmInterval);
    };
  }, []);

  useEffect(() => {
    if (done && !startedRef.current) {
      startedRef.current = true;
      const score = Math.round((clicks / REQUIRED_CLICKS) * 100);
      setTimeout(() => onComplete(Math.min(100, score)), 800);
    }
  }, [done, clicks, onComplete]);

  const handleClick = () => {
    if (done) return;
    const next = clicks + 1;
    setClicks(next);
    if (next >= REQUIRED_CLICKS && !doneRef.current) {
      doneRef.current = true;
      clearInterval(intervalRef.current!);
      setDone(true);
    }
  };

  const progress = Math.min(100, (clicks / REQUIRED_CLICKS) * 100);
  const success = clicks >= REQUIRED_CLICKS;

  return (
    <div className="flex flex-col items-center gap-4 p-4 select-none">
      {/* Bedroom scene */}
      <div className="relative w-full max-w-xs bg-indigo-950 rounded-2xl p-6 flex flex-col items-center gap-3 border-2 border-indigo-700">
        {/* Moon / Stars */}
        <div className="absolute top-2 right-4 text-2xl">🌙</div>
        <div className="absolute top-2 left-4 text-xs text-yellow-300">✦ ✦ ✦</div>

        {/* Sleeping character */}
        <div className="text-5xl">{success ? '🙆' : '😴'}</div>
        <div className="text-white/60 text-xs">{success ? '일어났다!' : '쿨쿨...'}</div>

        {/* Alarm clock */}
        <button
          onClick={handleClick}
          disabled={done}
          className={`text-6xl transition-transform active:scale-90 cursor-pointer disabled:cursor-default
            ${shake && !done ? 'rotate-6' : '-rotate-6'}
            ${success ? 'grayscale' : ''}`}
          style={{ transition: 'transform 0.1s' }}
        >
          ⏰
        </button>

        <p className="text-white font-bold text-sm">
          {done ? (success ? '✅ 기상 완료!' : '⏰ 시간 초과!') : '알람을 눌러 깨워라!'}
        </p>
      </div>

      {/* Wakeup progress */}
      <div className="w-full max-w-xs">
        <div className="flex justify-between text-xs text-white/70 mb-1">
          <span>😴 잠 {clicks}/{REQUIRED_CLICKS}번 클릭</span>
          <span className={timeLeft <= 2 ? 'text-red-400 font-bold' : 'text-white/70'}>⏱ {timeLeft}s</span>
        </div>
        <div className="w-full bg-indigo-900 rounded-full h-5 overflow-hidden border border-indigo-700">
          <div
            className="h-full rounded-full transition-all duration-100"
            style={{
              width: `${progress}%`,
              background: progress >= 100 ? '#22c55e' : 'linear-gradient(90deg,#6366f1,#a855f7)',
            }}
          />
        </div>
      </div>

      {/* Instruction */}
      {!done && (
        <p className="text-yellow-300 font-bold text-lg animate-bounce">
          👆 알람을 빠르게 눌러라!
        </p>
      )}
    </div>
  );
}
