'use client';
import { useRef, useState } from 'react';
import { StageProps } from './stageTypes';

const ROOMS = [
  '1학년 교실', '2학년 교실', '3학년 교실',
  '도서관',     '돌봄교실',   '음악실',
  '미술실',     '과학실',     '체육관',
];
const TARGET = '돌봄교실';
const GRID = 3;

export default function Stage09AfterSchool({ onComplete }: StageProps) {
  // shuffle rooms
  const shuffled = useRef([...ROOMS].sort(() => Math.random() - 0.5));
  const [revealed, setRevealed] = useState<boolean[]>(Array(9).fill(false));
  const [done, setDone] = useState(false);
  const [tries, setTries] = useState(0);
  const [found, setFound] = useState<number | null>(null);
  const startRef = useRef(Date.now());
  const doneRef = useRef(false);

  const handleFlip = (idx: number) => {
    if (doneRef.current || revealed[idx]) return;
    const newRevealed = [...revealed];
    newRevealed[idx] = true;
    setRevealed(newRevealed);
    const thisTry = tries + 1;
    setTries(thisTry);

    if (shuffled.current[idx] === TARGET) {
      doneRef.current = true; setDone(true); setFound(idx);
      const elapsed = (Date.now() - startRef.current) / 1000;
      const tryPenalty = (thisTry - 1) * 8;
      const timePenalty = Math.floor(elapsed * 2);
      const score = Math.max(10, 100 - tryPenalty - timePenalty);
      setTimeout(() => onComplete(score), 900);
    }
  };

  return (
    <div className="flex flex-col items-center gap-4 p-4 select-none">
      <div className="bg-purple-500 text-white font-bold rounded-xl px-6 py-3 text-center shadow-lg">
        <div className="text-xs mb-1">어느 방이 돌봄교실일까?</div>
        <div className="text-xl">🔍 돌봄교실을 찾아라!</div>
      </div>

      <p className="text-white/70 text-sm">문을 클릭해서 방을 확인해요! ({tries}번 시도)</p>

      {/* Door grid */}
      <div className="grid grid-cols-3 gap-2 w-full max-w-xs">
        {shuffled.current.map((room, idx) => {
          const isFound = found === idx;
          const isRevealed = revealed[idx];
          return (
            <button
              key={idx}
              onClick={() => handleFlip(idx)}
              disabled={done || isRevealed}
              className={`h-20 rounded-xl border-2 font-bold text-sm transition-all flex flex-col items-center justify-center gap-1
                ${!isRevealed
                  ? 'bg-purple-800 border-purple-600 hover:bg-purple-700 text-white cursor-pointer'
                  : isFound
                    ? 'bg-green-500 border-green-300 text-white animate-bounce'
                    : 'bg-red-900/50 border-red-700/50 text-red-300'
                }`}
            >
              {!isRevealed ? (
                <>
                  <span className="text-2xl">🚪</span>
                  <span className="text-white/60 text-xs">?</span>
                </>
              ) : (
                <>
                  <span className="text-lg">{isFound ? '🎯' : '❌'}</span>
                  <span className="text-xs text-center leading-tight px-1">{room}</span>
                </>
              )}
            </button>
          );
        })}
      </div>

      {done && (
        <p className="text-green-400 font-bold text-lg">✅ 돌봄교실 발견! ({tries}번 만에 찾음)</p>
      )}
      {!done && tries >= 5 && (
        <p className="text-yellow-400 text-sm">💡 힌트: 아직 {9 - tries}개 문이 남았어요!</p>
      )}
    </div>
  );
}
