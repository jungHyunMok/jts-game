'use client';
import { useEffect, useRef, useState } from 'react';
import { StageProps } from './stageTypes';

const TOTAL = 20;
const TIME_LIMIT = 10;

export default function Stage05Shoes({ onComplete }: StageProps) {
  const myNumber = useRef(1 + Math.floor(Math.random() * TOTAL));
  const [selected, setSelected] = useState<number | null>(null);
  const [timeLeft, setTimeLeft] = useState(TIME_LIMIT);
  const [done, setDone] = useState(false);
  const doneRef = useRef(false);
  const startRef = useRef(Date.now());

  useEffect(() => {
    const tick = setInterval(() => {
      if (doneRef.current) return;
      const elapsed = (Date.now() - startRef.current) / 1000;
      const rem = Math.max(0, TIME_LIMIT - elapsed);
      setTimeLeft(Math.ceil(rem));
      if (rem <= 0 && !doneRef.current) {
        doneRef.current = true; setDone(true);
        setTimeout(() => onComplete(0), 800);
      }
    }, 200);
    return () => clearInterval(tick);
  }, [onComplete]);

  const handlePick = (n: number) => {
    if (doneRef.current) return;
    doneRef.current = true;
    setSelected(n); setDone(true);
    const correct = n === myNumber.current;
    const elapsed = (Date.now() - startRef.current) / 1000;
    const timeBonus = Math.round((Math.max(0, TIME_LIMIT - elapsed) / TIME_LIMIT) * 50);
    const score = correct ? 50 + timeBonus : 0;
    setTimeout(() => onComplete(score), 800);
  };

  const numbers = Array.from({ length: TOTAL }, (_, i) => i + 1);
  const rows = [numbers.slice(0, 5), numbers.slice(5, 10), numbers.slice(10, 15), numbers.slice(15, 20)];

  return (
    <div className="flex flex-col items-center gap-4 p-4 select-none">
      {/* My number tag */}
      <div className="flex items-center gap-3">
        <div className="bg-yellow-400 text-black font-bold rounded-xl px-6 py-3 text-3xl shadow-lg">
          내 번호: {myNumber.current}번
        </div>
        <span className={`font-bold text-lg ${timeLeft <= 3 ? 'text-red-400 animate-pulse' : 'text-white'}`}>⏱ {timeLeft}s</span>
      </div>

      <p className="text-white/80 text-sm">내 번호의 신발장을 눌러라!</p>

      {/* Locker grid */}
      <div className="flex flex-col gap-1 w-full max-w-xs">
        {rows.map((row, ri) => (
          <div key={ri} className="flex gap-1 justify-center">
            {row.map(n => {
              const isCorrect = n === myNumber.current;
              const isSelected = selected === n;
              let style = 'bg-amber-800 border-amber-600 text-amber-100 hover:bg-amber-700';
              if (done) {
                if (isCorrect) style = 'bg-green-500 border-green-300 text-white animate-bounce';
                else if (isSelected && !isCorrect) style = 'bg-red-500 border-red-300 text-white';
                else style = 'bg-amber-900 border-amber-700 text-amber-300 opacity-50';
              }
              return (
                <button
                  key={n}
                  onClick={() => handlePick(n)}
                  disabled={done}
                  className={`w-12 h-14 rounded-lg border-2 font-bold text-sm transition-all flex flex-col items-center justify-center gap-0.5 ${style}`}
                >
                  <span className="text-lg">👟</span>
                  <span>{n}</span>
                </button>
              );
            })}
          </div>
        ))}
      </div>

      {done && (
        <p className={`font-bold text-lg ${selected === myNumber.current ? 'text-green-400' : 'text-red-400'}`}>
          {selected === myNumber.current ? '✅ 맞았어요!' : `❌ 내 번호는 ${myNumber.current}번이에요!`}
        </p>
      )}
    </div>
  );
}
