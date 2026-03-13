import Link from 'next/link';

export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-sky-500 via-blue-600 to-indigo-700 flex flex-col items-center justify-center px-4 py-8">
      <div className="text-center mb-10">
        <div className="text-7xl mb-4">🎮</div>
        <h1 className="text-3xl font-bold text-white mb-2 drop-shadow">등교 게임 모음</h1>
        <p className="text-white/70 text-sm">어린이를 위한 교육 게임</p>
      </div>

      <div className="flex flex-col gap-5 w-full max-w-sm">
        <Link href="/crossing"
          className="flex items-center gap-5 bg-white/15 hover:bg-white/25 border-2 border-white/30 rounded-3xl p-5 transition-all hover:scale-105 shadow-lg">
          <span className="text-5xl">🚸</span>
          <div>
            <div className="text-white font-bold text-xl">등교 대작전</div>
            <div className="text-white/70 text-sm">차를 피해 학교까지!</div>
            <div className="flex gap-1 mt-1">
              {['1단계','~','10단계'].map((t,i)=>(
                <span key={i} className="text-xs bg-green-500/30 text-green-300 rounded px-1">{t}</span>
              ))}
            </div>
          </div>
        </Link>

        <Link href="/school-day"
          className="flex items-center gap-5 bg-white/15 hover:bg-white/25 border-2 border-yellow-400/40 rounded-3xl p-5 transition-all hover:scale-105 shadow-lg">
          <span className="text-5xl">🏫</span>
          <div>
            <div className="text-white font-bold text-xl">학교 하루 대작전</div>
            <div className="text-white/70 text-sm">12가지 미니게임!</div>
            <div className="flex flex-wrap gap-1 mt-1">
              {['기상','아침밥','등교','수업','태권도','귀가'].map(t=>(
                <span key={t} className="text-xs bg-yellow-500/30 text-yellow-300 rounded px-1">{t}</span>
              ))}
            </div>
          </div>
        </Link>
      </div>

      <p className="text-white/40 text-xs mt-10">어린이 교육용 게임 · Incheon Bupyeong</p>
    </main>
  );
}
