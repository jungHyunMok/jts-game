'use client';
import { useEffect, useRef, useState } from 'react';
import { StageProps } from './stageTypes';

const GATE_CLOSE_TIME = 7; // seconds until gate closes
const TARGET_PROGRESS = 100;

export default function Stage04SchoolGate({ onComplete }: StageProps) {
  const [progress, setProgress] = useState(0);
  const [gateOpen, setGateOpen] = useState(100); // 0=closed, 100=open (percent)
  const [timeLeft, setTimeLeft] = useState(GATE_CLOSE_TIME);
  const [done, setDone] = useState(false);
  const [result, setResult] = useState<'win'|'fail'|null>(null);
  const doneRef = useRef(false);
  const startRef = useRef(Date.now());

  useEffect(() => {
    const tick = setInterval(() => {
      if (doneRef.current) return;
      const elapsed = (Date.now() - startRef.current) / 1000;
      const remaining = Math.max(0, GATE_CLOSE_TIME - elapsed);
      setTimeLeft(Math.ceil(remaining));
      const openPct = Math.max(0, (remaining / GATE_CLOSE_TIME) * 100);
      setGateOpen(openPct);
      if (remaining <= 0 && !doneRef.current) {
        doneRef.current = true;
        setDone(true); setResult('fail');
        setTimeout(() => onComplete(0), 900);
      }
    }, 100);
    return () => clearInterval(tick);
  }, [onComplete]);

  const handleTap = () => {
    if (doneRef.current) return;
    setProgress(p => {
      const next = Math.min(TARGET_PROGRESS, p + 6);
      if (next >= TARGET_PROGRESS && !doneRef.current) {
        doneRef.current = true;
        setDone(true); setResult('win');
        const elapsed = (Date.now() - startRef.current) / 1000;
        const score = Math.round(Math.max(20, (timeLeft / GATE_CLOSE_TIME) * 100));
        setTimeout(() => onComplete(Math.min(100, score)), 900);
      }
      return next;
    });
  };

  const gateColor = gateOpen > 60 ? '#22c55e' : gateOpen > 30 ? '#eab308' : '#ef4444';

  return (
    <div className="flex flex-col items-center gap-4 p-4 select-none">
      {/* Gate visual */}
      <div className="relative w-full max-w-xs h-48 bg-blue-950 rounded-2xl overflow-hidden border-2 border-blue-700 flex items-end justify-center">
        {/* Sky */}
        <div className="absolute inset-0 bg-gradient-to-b from-sky-400 to-sky-200" />
        {/* School building */}
        <div className="absolute bottom-12 left-1/2 -translate-x-1/2 w-32 h-20 bg-yellow-400 rounded-t-lg" />
        <div className="absolute bottom-24 left-1/2 -translate-x-1/2 w-0 h-0 border-l-[40px] border-r-[40px] border-b-[24px] border-l-transparent border-r-transparent border-b-red-500" />
        {/* Ground */}
        <div className="absolute bottom-0 w-full h-12 bg-gray-300" />
        {/* Gate posts */}
        <div className="absolute bottom-12 left-[30%] w-5 h-20 bg-gray-700 rounded" />
        <div className="absolute bottom-12 right-[30%] w-5 h-20 bg-gray-700 rounded" />
        {/* Gate doors (sliding) */}
        <div className="absolute bottom-12 transition-all duration-300"
          style={{ left: `calc(30% + 4px)`, width: `${(100-gateOpen) * 0.18}%`, height: 72, background: gateColor, opacity: 0.85, borderRadius: 4 }} />
        <div className="absolute bottom-12 transition-all duration-300"
          style={{ right: `calc(30% + 4px)`, width: `${(100-gateOpen) * 0.18}%`, height: 72, background: gateColor, opacity: 0.85, borderRadius: 4 }} />

        {/* Running character */}
        <div className="absolute bottom-12 transition-all duration-300 text-3xl"
          style={{ left: `${10 + (progress / TARGET_PROGRESS) * 55}%` }}>
          {result === 'win' ? '🎉' : result === 'fail' ? '😢' : '🏃'}
        </div>

        {/* Time badge */}
        <div className={`absolute top-2 right-2 px-2 py-1 rounded-lg font-bold text-sm text-white
          ${timeLeft <= 2 ? 'bg-red-500 animate-pulse' : 'bg-black/50'}`}>
          ⏱ {timeLeft}s
        </div>
        {/* Gate status */}
        <div className="absolute top-2 left-2 px-2 py-1 rounded-lg text-xs font-bold text-white bg-black/50">
          교문 {Math.round(gateOpen)}% 열림
        </div>
      </div>

      {/* Progress bar */}
      <div className="w-full max-w-xs">
        <div className="flex justify-between text-xs text-white/70 mb-1">
          <span>🏃 달리기</span><span>{Math.round(progress)}%</span>
        </div>
        <div className="w-full bg-white/10 rounded-full h-4 overflow-hidden">
          <div className="h-full bg-green-500 rounded-full transition-all duration-100"
            style={{ width: `${progress}%` }} />
        </div>
      </div>

      {/* Tap button */}
      <button
        onClick={handleTap}
        disabled={done}
        className="w-48 h-20 rounded-2xl bg-green-500 hover:bg-green-400 active:scale-95 disabled:bg-gray-600 text-white font-bold text-2xl transition-all shadow-lg select-none"
      >
        {result === 'win' ? '🎉 통과!' : result === 'fail' ? '😢 닫힘!' : '🏃 달려!'}
      </button>
      {!done && <p className="text-yellow-300 text-sm font-bold animate-bounce">빠르게 눌러서 달려가라!</p>}
    </div>
  );
}
