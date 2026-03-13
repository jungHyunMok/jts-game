'use client';
import { useRef, useState } from 'react';
import { StageProps } from './stageTypes';

const INSTRUCTORS = [
  {
    emoji: '🥋',
    name: '김태권 사범님',
    speech: '안녕! 나는 김태권 사범님이야. 도복 입었지? 이거 신분증! 어머니가 오늘 못 오신다고 연락 주셨어.',
    clues: ['✅ 태권도 도복 착용', '✅ 신분증 제시', '✅ 부모님과 사전 연락'],
    real: true,
  },
  {
    emoji: '🧑',
    name: '모르는 아저씨',
    speech: '얘야, 사탕 줄게~ 같이 가자. 엄마가 보냈어. 빨리 와!',
    clues: ['❌ 신분증 없음', '❌ 사탕으로 유혹', '❌ 사전 연락 없음'],
    real: false,
  },
  {
    emoji: '🧔',
    name: '모르는 사람',
    speech: '내가 선생님 대신 왔어. 차 탈래? 걱정 마, 집에 데려다 줄게.',
    clues: ['❌ 도복 없음', '❌ 신분증 없음', '❌ 부모님 확인 불가'],
    real: false,
  },
];

export default function Stage10Pickup({ onComplete }: StageProps) {
  // Shuffle order
  const order = useRef([...INSTRUCTORS].sort(() => Math.random() - 0.5));
  const [chosen, setChosen] = useState<number | null>(null);
  const [showDetail, setShowDetail] = useState<number | null>(null);
  const [done, setDone] = useState(false);
  const doneRef = useRef(false);

  const handleChoose = (idx: number) => {
    if (doneRef.current) return;
    doneRef.current = true; setDone(true); setChosen(idx);
    const correct = order.current[idx].real;
    setTimeout(() => onComplete(correct ? 100 : 0), 1200);
  };

  return (
    <div className="flex flex-col items-center gap-3 p-3 select-none">
      <div className="bg-red-700 text-white font-bold rounded-xl px-5 py-2 text-center">
        <div className="text-sm">🥋 태권도 픽업 시간</div>
        <div className="text-lg">진짜 사범님은 누구일까?</div>
      </div>

      <p className="text-white/70 text-xs text-center">💡 낯선 사람을 조심해요! 신분증을 확인하고 부모님께 연락해요!</p>

      <div className="flex flex-col gap-3 w-full max-w-xs">
        {order.current.map((person, idx) => {
          const isChosen = chosen === idx;
          const isReal   = person.real;
          let borderCls  = 'border-white/20';
          if (done) borderCls = isReal ? 'border-green-400' : isChosen ? 'border-red-400' : 'border-white/10';

          return (
            <div key={idx} className={`bg-white/10 border-2 rounded-2xl overflow-hidden transition-all ${borderCls}`}>
              {/* Person header */}
              <button
                onClick={() => setShowDetail(showDetail === idx ? null : idx)}
                className="w-full flex items-center gap-3 p-3 hover:bg-white/5"
              >
                <span className="text-4xl">{person.emoji}</span>
                <div className="text-left flex-1">
                  <div className="text-white font-bold">{person.name}</div>
                  <div className="text-white/60 text-xs line-clamp-1">"{person.speech.substring(0,30)}..."</div>
                </div>
                <span className="text-white/50 text-sm">{showDetail === idx ? '▲' : '▼'}</span>
              </button>

              {/* Detail panel */}
              {showDetail === idx && (
                <div className="px-4 pb-3 flex flex-col gap-1">
                  <div className="bg-black/20 rounded-lg p-2 text-white/80 text-sm italic">"{person.speech}"</div>
                  <div className="flex flex-col gap-0.5 mt-1">
                    {person.clues.map((c, ci) => (
                      <div key={ci} className={`text-xs ${c.startsWith('✅') ? 'text-green-400' : 'text-red-400'}`}>{c}</div>
                    ))}
                  </div>
                </div>
              )}

              {/* Choose button */}
              {!done && (
                <div className="px-3 pb-3">
                  <button onClick={() => handleChoose(idx)}
                    className="w-full py-2 rounded-xl bg-blue-500 hover:bg-blue-400 text-white font-bold text-sm transition-colors">
                    이 사람이 사범님!
                  </button>
                </div>
              )}

              {/* Result badge */}
              {done && (
                <div className={`mx-3 mb-3 py-1 rounded-xl text-center font-bold text-sm
                  ${isReal ? 'bg-green-500 text-white' : 'bg-red-900/50 text-red-300'}`}>
                  {isReal ? '✅ 진짜 사범님!' : '❌ 모르는 사람!'}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {done && (
        <div className={`text-center p-3 rounded-xl ${order.current[chosen!]?.real ? 'bg-green-800' : 'bg-red-900'} w-full max-w-xs`}>
          {order.current[chosen!]?.real
            ? <p className="text-green-300 font-bold">🎉 맞아요! 신분증 확인이 중요해요!</p>
            : <p className="text-red-300 font-bold">⚠️ 조심해요! 모르는 사람은 따라가면 안 돼요!<br/><span className="text-xs">항상 부모님께 먼저 연락하세요.</span></p>
          }
        </div>
      )}
    </div>
  );
}
