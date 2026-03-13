export interface StageProps {
  onComplete: (score: number) => void;
}

export const STAGE_META = [
  { id: 1,  title: '기상!',       emoji: '⏰', desc: '알람이 울린다! 빨리 꺼라!',            bg: 'from-indigo-900 to-purple-800' },
  { id: 2,  title: '아침밥',      emoji: '🍳', desc: '균형 잡힌 아침식사를 골라라!',         bg: 'from-orange-700 to-yellow-600' },
  { id: 3,  title: '등굣길',      emoji: '🚸', desc: '차를 피해 학교까지 건너가자!',          bg: 'from-sky-700 to-green-700'    },
  { id: 4,  title: '교문 통과',   emoji: '🏫', desc: '교문이 닫히기 전에 달려가!',            bg: 'from-blue-800 to-blue-600'    },
  { id: 5,  title: '신발장 찾기', emoji: '👟', desc: '내 번호 신발장을 찾아라!',             bg: 'from-teal-700 to-cyan-600'    },
  { id: 6,  title: '교실 찾기',   emoji: '🗺️', desc: '내 교실은 몇 층 몇 반?',              bg: 'from-green-800 to-emerald-600'},
  { id: 7,  title: '선생님 인사', emoji: '🙏', desc: '딱 맞는 타이밍에 인사해라!',           bg: 'from-yellow-700 to-amber-500' },
  { id: 8,  title: '수업 시간',   emoji: '📚', desc: '오늘의 퀴즈를 풀어라!',               bg: 'from-blue-700 to-indigo-600'  },
  { id: 9,  title: '방과후 교실', emoji: '🔍', desc: '돌봄교실 문을 찾아라!',               bg: 'from-purple-700 to-pink-600'  },
  { id: 10, title: '태권도 픽업', emoji: '🥋', desc: '진짜 사범님을 찾아라! 낯선 사람 조심!', bg: 'from-red-800 to-orange-700'   },
  { id: 11, title: '태권도 차량', emoji: '🚐', desc: '장애물을 피해 안전하게!',              bg: 'from-slate-800 to-slate-600'  },
  { id: 12, title: '집으로!',     emoji: '🏠', desc: '불량식품 유혹을 뿌리쳐라!',            bg: 'from-pink-700 to-rose-600'    },
] as const;
