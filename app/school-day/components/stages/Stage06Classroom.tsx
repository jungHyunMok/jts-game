'use client';
import { useRef, useState } from 'react';
import { StageProps } from './stageTypes';

const FLOORS = 4;
const ROOMS_PER_FLOOR = 4; // 반 per floor (1~4반)
// target: random floor(1~4), random room(1~4)
function makeTarget() {
  return { floor: 1 + Math.floor(Math.random() * FLOORS), room: 1 + Math.floor(Math.random() * ROOMS_PER_FLOOR) };
}

export default function Stage06Classroom({ onComplete }: StageProps) {
  const target = useRef(makeTarget());
  const [currentFloor, setCurrentFloor] = useState(1);
  const [selectedRoom, setSelectedRoom] = useState<number | null>(null);
  const [done, setDone] = useState(false);
  const [tries, setTries] = useState(0);
  const startRef = useRef(Date.now());
  const doneRef = useRef(false);

  const goUp   = () => { if (!done) setCurrentFloor(f => Math.min(FLOORS, f+1)); };
  const goDown = () => { if (!done) setCurrentFloor(f => Math.max(1, f-1)); };

  const handleRoom = (room: number) => {
    if (doneRef.current) return;
    setSelectedRoom(room);
    setTries(t => t + 1);
    if (currentFloor === target.current.floor && room === target.current.room) {
      doneRef.current = true; setDone(true);
      const elapsed = (Date.now() - startRef.current) / 1000;
      const timeBonus = Math.max(0, Math.round(50 - elapsed * 3));
      const tryPenalty = tries * 10;
      const score = Math.max(10, 100 - tryPenalty - Math.max(0, timeBonus < 0 ? 0 : 0));
      const finalScore = Math.min(100, Math.max(10, 100 - tries * 10 + (timeBonus > 30 ? 20 : 0)));
      setTimeout(() => onComplete(finalScore), 900);
    }
  };

  const { floor: tf, room: tr } = target.current;

  return (
    <div className="flex flex-col items-center gap-4 p-4 select-none">
      {/* Target */}
      <div className="bg-yellow-400 text-black font-bold rounded-xl px-6 py-3 text-center shadow-lg">
        <div className="text-xs mb-1">내 교실을 찾아라!</div>
        <div className="text-2xl">{tf}학년 {tr}반</div>
        <div className="text-xs mt-1">({tf}층 {tr}번 교실)</div>
      </div>

      {/* Building */}
      <div className="w-full max-w-xs bg-blue-950 rounded-2xl border-2 border-blue-700 overflow-hidden">
        {/* Floor indicator */}
        <div className="bg-blue-800 px-4 py-2 flex items-center justify-between">
          <button onClick={goDown} disabled={currentFloor <= 1 || done}
            className="w-10 h-10 rounded-xl bg-white/20 hover:bg-white/40 disabled:opacity-30 text-white font-bold text-xl">▼</button>
          <div className="text-center">
            <div className="text-white font-bold text-lg">{currentFloor}층</div>
            <div className="text-white/60 text-xs">{FLOORS - currentFloor === 0 ? '최상층' : `${FLOORS - currentFloor}층 위`}</div>
          </div>
          <button onClick={goUp} disabled={currentFloor >= FLOORS || done}
            className="w-10 h-10 rounded-xl bg-white/20 hover:bg-white/40 disabled:opacity-30 text-white font-bold text-xl">▲</button>
        </div>

        {/* Rooms on this floor */}
        <div className="p-4 grid grid-cols-2 gap-3">
          {Array.from({ length: ROOMS_PER_FLOOR }, (_, i) => i + 1).map(room => {
            const isTarget = currentFloor === tf && room === tr;
            const isSelected = selectedRoom === room && currentFloor === tf;
            let cls = 'bg-white/10 border-white/20 hover:bg-white/20';
            if (done && isTarget) cls = 'bg-green-500 border-green-300 animate-bounce';
            else if (isSelected && !done) cls = 'bg-red-500/50 border-red-300';
            return (
              <button key={room} onClick={() => handleRoom(room)} disabled={done}
                className={`flex flex-col items-center justify-center p-4 rounded-xl border-2 transition-all ${cls}`}>
                <span className="text-2xl">🚪</span>
                <span className="text-white font-bold">{currentFloor}학년 {room}반</span>
              </button>
            );
          })}
        </div>

        {/* Stairwell visual */}
        <div className="bg-blue-900/50 px-4 py-2 flex items-center gap-2">
          <span className="text-white/50 text-xs">계단</span>
          {Array.from({ length: FLOORS }, (_, i) => i+1).map(f => (
            <div key={f} className={`w-7 h-7 rounded-lg text-xs font-bold flex items-center justify-center
              ${f === currentFloor ? 'bg-yellow-400 text-black' : 'bg-white/10 text-white/50'}`}>{f}F</div>
          ))}
        </div>
      </div>

      {tries > 0 && !done && (
        <p className="text-red-400 text-sm font-bold">❌ 틀렸어요! 힌트: {currentFloor > tf ? '아래층으로!' : currentFloor < tf ? '위층으로!' : '이 층이 맞아요!'}</p>
      )}
      {done && <p className="text-green-400 font-bold text-lg">✅ 교실 찾기 성공!</p>}
    </div>
  );
}
