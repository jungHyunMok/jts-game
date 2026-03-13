import GameManager from './components/GameManager';
import Link from 'next/link';

export const metadata = {
  title: '학교 하루 대작전 - School Day Adventure',
  description: '12가지 미니게임으로 즐거운 학교 하루를 경험해요!',
};

export default function SchoolDayPage() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-indigo-600 via-purple-600 to-pink-600 flex flex-col items-center py-4 px-2">
      <div className="flex items-center gap-3 mb-4 w-full max-w-lg">
        <Link href="/" className="text-white/70 hover:text-white text-sm bg-white/10 rounded-lg px-3 py-1 transition-colors">
          ← 메뉴
        </Link>
        <h1 className="text-lg font-bold text-white">🏫 학교 하루 대작전</h1>
      </div>
      <GameManager />
    </main>
  );
}
