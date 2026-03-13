'use client';
import { useEffect, useRef, useState } from 'react';
import { StageProps } from './stageTypes';

const SWEET_SPOT_START = 35; // % of bar
const SWEET_SPOT_END = 65;
const SPEED = 1.2; // bar speed

export default function Stage07Greet({ onComplete }: StageProps) {
  const [barPos, setBarPos] = useState(0); // 0-100
  const [direction, setDirection] = useState(1);
  const [attempts, setAttempts] = useState(0);
  const [results, setResults] = useState<('perfect'|'good'|'miss')[]>([]);
  const [done, setDone] = useState(false);
  const [teacherState, setTeacherState] = useState<'entering'|'waiting'|'happy'|'disappointed'>('entering');
  const posRef = useRef(0);
  const dirRef = useRef(1);
  const doneRef = useRef(false);
  const MAX_ATTEMPTS = 3;

  useEffect(() => {
    setTeacherState('waiting');
  }, []);

  useEffect(() => {
    if (doneRef.current) return;
    let raf: number;
    const loop = () => {
      posRef.current += SPEED * dirRef.current;
      if (posRef.current >= 100) { posRef.current = 100; dirRef.current = -1; }
      if (posRef.current <= 0)   { posRef.current = 0;   dirRef.current = 1;  }
      setBarPos(Math.round(posRef.current));
      setDirection(dirRef.current);
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, [done]);

  const handleBow = () => {
    if (doneRef.current) return;
    const pos = posRef.current;
    const isPerfect = pos >= SWEET_SPOT_START + 5 && pos <= SWEET_SPOT_END - 5;
    const isGood = pos >= SWEET_SPOT_START && pos <= SWEET_SPOT_END;
    const result: 'perfect'|'good'|'miss' = isPerfect ? 'perfect' : isGood ? 'good' : 'miss';
    const newResults = [...results, result];
    setResults(newResults);
    setAttempts(a => a + 1);
    setTeacherState(result === 'miss' ? 'disappointed' : 'happy');
    setTimeout(() => setTeacherState('waiting'), 700);

    if (newResults.length >= MAX_ATTEMPTS) {
      doneRef.current = true; setDone(true);
      const perfects = newResults.filter(r => r === 'perfect').length;
      const goods    = newResults.filter(r => r === 'good').length;
      const score = Math.round((perfects * 100 + goods * 60) / MAX_ATTEMPTS);
      setTimeout(() => onComplete(Math.min(100, score)), 900);
    }
  };

  const getTeacherEmoji = () => {
    switch (teacherState) {
      case 'entering': return '🚶';
      case 'waiting':  return '🧑‍🏫';
      case 'happy':    return '😊';
      case 'disappointed': return '😕';
    }
  };

  return (
    <div className="flex flex-col items-center gap-4 p-4 select-none">
      {/* Teacher */}
      <div className="bg-amber-900/40 border-2 border-amber-600 rounded-2xl p-4 w-full max-w-xs flex flex-col items-center gap-2">
        <div className="text-6xl transition-all">{getTeacherEmoji()}</div>
        <div className="text-white/80 text-sm font-bold">
          {teacherState === 'happy' ? '잘했어요! 👍' : teacherState === 'disappointed' ? '인사 타이밍이 맞지 않아요 😕' : '선생님이 오셨어요!'}
        </div>
        {/* Attempt dots */}
        <div className="flex gap-2 mt-1">
          {Array.from({ length: MAX_ATTEMPTS }, (_, i) => {
            const r = results[i];
            return (
              <div key={i} className={`w-8 h-8 rounded-full border-2 flex items-center justify-center text-sm
                ${!r ? 'border-white/30 bg-white/10' : r==='perfect' ? 'border-yellow-400 bg-yellow-400 text-black' : r==='good' ? 'border-green-400 bg-green-500 text-white' : 'border-red-400 bg-red-500 text-white'}`}>
                {r === 'perfect' ? '⭐' : r === 'good' ? '✓' : r === 'miss' ? '✗' : i+1}
              </div>
            );
          })}
        </div>
      </div>

      {/* Timing bar */}
      <div className="w-full max-w-xs">
        <div className="text-white/70 text-xs text-center mb-2">초록 구간에서 인사해라!</div>
        <div className="relative w-full h-8 bg-white/10 rounded-full overflow-hidden border border-white/20">
          {/* Sweet spot */}
          <div className="absolute top-0 h-full bg-green-500/60 rounded"
            style={{ left: `${SWEET_SPOT_START}%`, width: `${SWEET_SPOT_END - SWEET_SPOT_START}%` }} />
          {/* Perfect zone */}
          <div className="absolute top-0 h-full bg-yellow-400/70 rounded"
            style={{ left: `${SWEET_SPOT_START+5}%`, width: `${(SWEET_SPOT_END-5)-(SWEET_SPOT_START+5)}%` }} />
          {/* Indicator */}
          <div className="absolute top-1 w-6 h-6 bg-white rounded-full shadow-lg transition-none border-2 border-blue-400"
            style={{ left: `calc(${barPos}% - 12px)` }} />
          {/* Labels */}
          <div className="absolute top-1/2 -translate-y-1/2 text-xs font-bold text-white/40" style={{ left: '38%' }}>Good</div>
          <div className="absolute top-1/2 -translate-y-1/2 text-xs font-bold text-yellow-300" style={{ left: '47%' }}>⭐</div>
        </div>
      </div>

      {/* Bow button */}
      <button
        onClick={handleBow}
        disabled={done}
        className="w-48 h-20 rounded-2xl bg-blue-500 hover:bg-blue-400 active:scale-95 disabled:bg-gray-600 text-white font-bold text-2xl transition-all shadow-lg"
      >
        {done ? '완료!' : '🙇 인사!'}
      </button>
      {!done && <p className="text-yellow-300 text-sm animate-pulse">인사 버튼을 눌러라!</p>}
    </div>
  );
}
