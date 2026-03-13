import GameCanvas from '../components/game/GameCanvas';
import Link from 'next/link';

export default function CrossingPage() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-sky-500 to-green-600 flex flex-col items-center justify-start py-6 px-2">
      <div className="flex items-center gap-3 mb-1">
        <Link href="/" className="text-white/70 hover:text-white text-sm">← 메뉴</Link>
        <h1 className="text-2xl md:text-3xl font-bold text-white drop-shadow">🎒 등교 대작전</h1>
      </div>
      <p className="text-white/70 text-xs mb-4">School Crossing Adventure</p>
      <GameCanvas />
    </main>
  );
}
