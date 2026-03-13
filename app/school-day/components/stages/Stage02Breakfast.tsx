'use client';
import { useState } from 'react';
import { StageProps } from './stageTypes';

const FOODS = [
  { id: 1, emoji: '🍚', name: '밥',    healthy: true,  nutrient: '탄수화물' },
  { id: 2, emoji: '🥚', name: '계란',  healthy: true,  nutrient: '단백질' },
  { id: 3, emoji: '🥛', name: '우유',  healthy: true,  nutrient: '칼슘' },
  { id: 4, emoji: '🥦', name: '야채',  healthy: true,  nutrient: '비타민' },
  { id: 5, emoji: '🍎', name: '사과',  healthy: true,  nutrient: '식이섬유' },
  { id: 6, emoji: '🐟', name: '생선',  healthy: true,  nutrient: '오메가3' },
  { id: 7, emoji: '🍫', name: '초콜릿',healthy: false, nutrient: '설탕' },
  { id: 8, emoji: '🥤', name: '콜라',  healthy: false, nutrient: '카페인' },
  { id: 9, emoji: '🍟', name: '감자튀김', healthy: false, nutrient: '지방' },
  { id: 10, emoji: '🍭', name: '사탕',  healthy: false, nutrient: '설탕' },
];

const PLATE_SIZE = 4;

export default function Stage02Breakfast({ onComplete }: StageProps) {
  const [plate, setPlate] = useState<typeof FOODS[0][]>([]);
  const [done, setDone] = useState(false);
  const [feedback, setFeedback] = useState('');

  const toggleFood = (food: typeof FOODS[0]) => {
    if (done) return;
    if (plate.find(f => f.id === food.id)) {
      setPlate(p => p.filter(f => f.id !== food.id));
      setFeedback('');
      return;
    }
    if (plate.length >= PLATE_SIZE) {
      setFeedback('접시가 가득 찼어요! 다른 음식을 빼고 담으세요.');
      return;
    }
    setPlate(p => [...p, food]);
    setFeedback(food.healthy ? `✅ ${food.name}: ${food.nutrient}이 풍부해요!` : `⚠️ ${food.name}은 건강에 좋지 않아요!`);
  };

  const handleSubmit = () => {
    if (plate.length < PLATE_SIZE) {
      setFeedback(`음식을 ${PLATE_SIZE}가지 골라주세요!`);
      return;
    }
    const healthyCount = plate.filter(f => f.healthy).length;
    const score = Math.round((healthyCount / PLATE_SIZE) * 100);
    setDone(true);
    setTimeout(() => onComplete(score), 1000);
  };

  const healthyCount = plate.filter(f => f.healthy).length;

  return (
    <div className="flex flex-col items-center gap-3 p-3 select-none">
      <p className="text-white font-bold text-sm">건강한 음식 {PLATE_SIZE}가지를 골라 접시에 담아요!</p>

      {/* Plate */}
      <div className="relative w-48 h-48 rounded-full border-4 border-yellow-400 bg-amber-50 flex flex-wrap items-center justify-center gap-1 p-3">
        <div className="absolute -top-6 text-xs text-yellow-300 font-bold">🍽️ 접시 ({plate.length}/{PLATE_SIZE})</div>
        {plate.length === 0 && <span className="text-gray-400 text-xs">여기에 담겨요</span>}
        {plate.map(f => (
          <button key={f.id} onClick={() => toggleFood(f)}
            className="text-3xl hover:scale-110 transition-transform" title="클릭하면 빼기">
            {f.emoji}
          </button>
        ))}
      </div>

      {/* Feedback */}
      <div className="h-6 text-xs font-bold text-yellow-300 text-center">{feedback}</div>

      {/* Food grid */}
      <div className="grid grid-cols-5 gap-2 w-full max-w-xs">
        {FOODS.map(food => {
          const selected = !!plate.find(f => f.id === food.id);
          return (
            <button
              key={food.id}
              onClick={() => toggleFood(food)}
              disabled={done}
              className={`flex flex-col items-center p-1 rounded-xl border-2 transition-all
                ${selected
                  ? food.healthy ? 'border-green-400 bg-green-900/50' : 'border-red-400 bg-red-900/50'
                  : 'border-white/20 bg-white/10 hover:bg-white/20'
                }`}
            >
              <span className="text-2xl">{food.emoji}</span>
              <span className="text-white/80 text-xs">{food.name}</span>
            </button>
          );
        })}
      </div>

      {/* Score preview */}
      {plate.length === PLATE_SIZE && (
        <div className="text-sm font-bold text-center">
          <span className={healthyCount === 4 ? 'text-green-400' : healthyCount >= 2 ? 'text-yellow-400' : 'text-red-400'}>
            건강 점수: {healthyCount}/{PLATE_SIZE} ({Math.round(healthyCount/PLATE_SIZE*100)}점)
          </span>
        </div>
      )}

      <button
        onClick={handleSubmit}
        disabled={done || plate.length < PLATE_SIZE}
        className="px-8 py-3 bg-green-500 hover:bg-green-400 disabled:bg-gray-600 text-white font-bold rounded-xl text-lg transition-colors"
      >
        {done ? '완료! 🎉' : '식사 시작!'}
      </button>
    </div>
  );
}
