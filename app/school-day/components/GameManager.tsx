'use client';
import { useEffect, useRef, useState } from 'react';
import { STAGE_META } from './stages/stageTypes';
import Stage01WakeUp      from './stages/Stage01WakeUp';
import Stage02Breakfast   from './stages/Stage02Breakfast';
import Stage03WalkSchool  from './stages/Stage03WalkSchool';
import Stage04SchoolGate  from './stages/Stage04SchoolGate';
import Stage05Shoes       from './stages/Stage05Shoes';
import Stage06Classroom   from './stages/Stage06Classroom';
import Stage07Greet       from './stages/Stage07Greet';
import Stage08Class       from './stages/Stage08Class';
import Stage09AfterSchool from './stages/Stage09AfterSchool';
import Stage10Pickup      from './stages/Stage10Pickup';
import Stage11VanDrive    from './stages/Stage11VanDrive';
import Stage12WalkHome    from './stages/Stage12WalkHome';

type Screen = 'hub' | 'intro' | 'playing' | 'result' | 'summary';

const STAGE_COMPONENTS = [
  Stage01WakeUp, Stage02Breakfast, Stage03WalkSchool, Stage04SchoolGate,
  Stage05Shoes, Stage06Classroom, Stage07Greet, Stage08Class,
  Stage09AfterSchool, Stage10Pickup, Stage11VanDrive, Stage12WalkHome,
];

const AUTO_ADVANCE = 3000;

function Stars({ score }: { score: number }) {
  const s = score >= 80 ? 3 : score >= 50 ? 2 : 1;
  return (
    <div className="flex gap-1">
      {[1,2,3].map(i => (
        <span key={i} className={`text-2xl transition-all ${i<=s?'opacity-100':'opacity-20'}`}>⭐</span>
      ))}
    </div>
  );
}

function ProgressBar({ current, total }: { current: number; total: number }) {
  return (
    <div className="w-full max-w-lg mx-auto px-4">
      <div className="flex justify-between text-xs text-white/60 mb-1">
        <span>진행도</span><span>{current}/{total} 단계</span>
      </div>
      <div className="w-full bg-white/10 rounded-full h-3 overflow-hidden">
        <div className="h-full bg-yellow-400 rounded-full transition-all duration-500"
          style={{ width: `${(current/total)*100}%` }} />
      </div>
      <div className="flex justify-between mt-1">
        {STAGE_META.map((s,i) => (
          <div key={i} className={`text-lg transition-all ${i<current?'opacity-100':i===current?'opacity-80 animate-pulse':'opacity-20'}`}
            title={s.title}>{s.emoji}</div>
        ))}
      </div>
    </div>
  );
}

export default function GameManager() {
  const [screen, setScreen]     = useState<Screen>('hub');
  const [stageIdx, setStageIdx] = useState(0);
  const [scores, setScores]     = useState<number[]>([]);
  const [lastScore, setLastScore] = useState(0);
  const [countdown, setCountdown] = useState(3);
  const countRef = useRef<ReturnType<typeof setInterval>|null>(null);
  const cdRef    = useRef(AUTO_ADVANCE);
  const cdTimerRef = useRef<ReturnType<typeof setInterval>|null>(null);

  const meta = STAGE_META[stageIdx];
  const totalScore = scores.reduce((a,b)=>a+b,0);
  const maxScore = STAGE_META.length * 100;

  const clearTimers = () => {
    if (countRef.current)  { clearInterval(countRef.current);  countRef.current=null; }
    if (cdTimerRef.current) { clearInterval(cdTimerRef.current); cdTimerRef.current=null; }
  };

  // Intro countdown 3→2→1→GO
  useEffect(() => {
    if (screen !== 'intro') return;
    setCountdown(3);
    countRef.current = setInterval(() => {
      setCountdown(c => {
        if (c <= 1) {
          clearInterval(countRef.current!);
          setScreen('playing');
          return 0;
        }
        return c - 1;
      });
    }, 800);
    return () => clearInterval(countRef.current!);
  }, [screen, stageIdx]);

  // Auto-advance after result
  useEffect(() => {
    if (screen !== 'result') return;
    let rem = AUTO_ADVANCE;
    cdTimerRef.current = setInterval(() => {
      rem -= 100;
      if (rem <= 0) {
        clearInterval(cdTimerRef.current!);
        advanceStage();
      }
    }, 100);
    return () => clearInterval(cdTimerRef.current!);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [screen]);

  const handleComplete = (score: number) => {
    const clamped = Math.max(0, Math.min(100, Math.round(score)));
    setLastScore(clamped);
    setScores(prev => [...prev, clamped]);
    setScreen('result');
  };

  const advanceStage = () => {
    clearTimers();
    const next = stageIdx + 1;
    if (next >= STAGE_META.length) { setScreen('summary'); }
    else { setStageIdx(next); setScreen('intro'); }
  };

  const restart = () => {
    clearTimers();
    setStageIdx(0); setScores([]); setLastScore(0); setScreen('hub');
  };

  const startGame = () => { setStageIdx(0); setScores([]); setScreen('intro'); };

  const ActiveStage = STAGE_COMPONENTS[stageIdx];
  const stars = lastScore >= 80 ? 3 : lastScore >= 50 ? 2 : 1;

  // ── Hub ──────────────────────────────────────────────────────────────────
  if (screen === 'hub') {
    return (
      <div className="flex flex-col items-center gap-6 w-full max-w-lg mx-auto px-4 py-8">
        <div className="text-center">
          <div className="text-7xl mb-3">🏫</div>
          <h1 className="text-3xl font-bold text-white mb-1">학교 하루 대작전!</h1>
          <p className="text-white/70 text-sm">12가지 미니게임으로 즐거운 하루를!</p>
        </div>
        <div className="grid grid-cols-3 gap-2 w-full">
          {STAGE_META.map((s,i)=>(
            <div key={i} className="flex flex-col items-center bg-white/10 rounded-xl p-2 text-center">
              <span className="text-2xl">{s.emoji}</span>
              <span className="text-white text-xs mt-1 font-bold">{s.title}</span>
            </div>
          ))}
        </div>
        <button onClick={startGame}
          className="w-full py-4 bg-yellow-400 hover:bg-yellow-300 text-black font-bold text-2xl rounded-2xl shadow-lg transition-colors">
          🎮 게임 시작!
        </button>
      </div>
    );
  }

  // ── Summary ───────────────────────────────────────────────────────────────
  if (screen === 'summary') {
    const finalStars = totalScore >= maxScore*0.8 ? 3 : totalScore >= maxScore*0.5 ? 2 : 1;
    return (
      <div className="flex flex-col items-center gap-4 w-full max-w-lg mx-auto px-4 py-6">
        <div className="text-center">
          <div className="text-6xl mb-2">🏆</div>
          <h2 className="text-3xl font-bold text-yellow-300">하루 완료!</h2>
          <p className="text-white/70 text-sm mt-1">모든 12단계를 마쳤어요!</p>
        </div>
        <div className="flex gap-1">{[1,2,3].map(i=><span key={i} className={`text-4xl ${i<=finalStars?'':'opacity-20'}`}>⭐</span>)}</div>
        <div className="text-4xl font-bold text-white">{totalScore}<span className="text-xl text-white/60">/{maxScore}점</span></div>

        <div className="w-full grid grid-cols-3 gap-2">
          {STAGE_META.map((s,i)=>{
            const sc=scores[i]??0;
            const st=sc>=80?3:sc>=50?2:1;
            return(
              <div key={i} className="bg-white/10 rounded-xl p-2 text-center">
                <div className="text-xl">{s.emoji}</div>
                <div className="text-white text-xs font-bold">{s.title}</div>
                <div className="text-yellow-300 text-sm">{sc}점</div>
                <div className="flex justify-center">{[1,2,3].map(x=><span key={x} className={`text-xs ${x<=st?'':'opacity-20'}`}>⭐</span>)}</div>
              </div>
            );
          })}
        </div>

        <button onClick={restart}
          className="w-full py-3 bg-green-500 hover:bg-green-400 text-white font-bold text-xl rounded-2xl transition-colors shadow-lg">
          🔄 처음부터!
        </button>
      </div>
    );
  }

  // ── Intro ─────────────────────────────────────────────────────────────────
  if (screen === 'intro') {
    return (
      <div className={`flex flex-col items-center justify-center gap-6 w-full max-w-lg mx-auto px-4 min-h-96 bg-gradient-to-b ${meta.bg} rounded-3xl`}>
        <ProgressBar current={stageIdx} total={STAGE_META.length} />
        <div className="text-center">
          <div className="text-8xl mb-4 animate-bounce">{meta.emoji}</div>
          <div className="text-white/60 text-sm font-bold mb-1">STAGE {stageIdx+1} / {STAGE_META.length}</div>
          <h2 className="text-3xl font-bold text-white mb-2">{meta.title}</h2>
          <p className="text-white/80 text-base">{meta.desc}</p>
        </div>
        <div className={`text-8xl font-black text-white transition-all ${countdown>0?'scale-110':'scale-150 text-green-300'}`}>
          {countdown > 0 ? countdown : 'GO!'}
        </div>
      </div>
    );
  }

  // ── Result ────────────────────────────────────────────────────────────────
  if (screen === 'result') {
    const nextMeta = stageIdx + 1 < STAGE_META.length ? STAGE_META[stageIdx+1] : null;
    return (
      <div className="flex flex-col items-center gap-4 w-full max-w-lg mx-auto px-4 py-6">
        <ProgressBar current={stageIdx+1} total={STAGE_META.length} />

        <div className={`w-full rounded-3xl p-6 text-center bg-gradient-to-b ${meta.bg} border-4 ${lastScore>=80?'border-yellow-400':lastScore>=50?'border-blue-400':'border-red-400'}`}>
          <div className="text-5xl mb-2">{meta.emoji}</div>
          <h3 className="text-2xl font-bold text-white mb-1">{meta.title}</h3>
          <Stars score={lastScore} />
          <div className="text-5xl font-black text-white mt-2">{lastScore}<span className="text-xl text-white/60">점</span></div>
          <div className="text-white/70 text-sm mt-1">총 {totalScore}점 획득중</div>
        </div>

        {nextMeta && (
          <div className="text-center">
            <div className="text-white/60 text-sm mb-1">다음 →</div>
            <div className="flex items-center gap-2 bg-white/10 rounded-xl px-4 py-2">
              <span className="text-2xl">{nextMeta.emoji}</span>
              <span className="text-white font-bold">{nextMeta.title}</span>
            </div>
          </div>
        )}

        <div className="flex gap-3 w-full">
          <button onClick={advanceStage}
            className="flex-1 py-3 bg-blue-500 hover:bg-blue-400 text-white font-bold text-lg rounded-xl transition-colors">
            {nextMeta ? '다음 ▶' : '결과 보기 🏆'}
          </button>
          <button onClick={restart}
            className="px-5 py-3 bg-white/20 hover:bg-white/30 text-white font-bold rounded-xl transition-colors">
            처음부터
          </button>
        </div>
      </div>
    );
  }

  // ── Playing ───────────────────────────────────────────────────────────────
  return (
    <div className="flex flex-col gap-3 w-full max-w-lg mx-auto px-2">
      {/* Stage header */}
      <div className="flex items-center gap-2 px-2">
        <span className="text-2xl">{meta.emoji}</span>
        <div className="flex-1">
          <div className="text-white font-bold">{meta.title}</div>
          <div className="text-white/60 text-xs">{meta.desc}</div>
        </div>
        <div className="text-right">
          <div className="text-yellow-300 font-bold text-sm">STAGE {stageIdx+1}/12</div>
          <div className="text-white/60 text-xs">총 {totalScore}점</div>
        </div>
      </div>

      {/* Active stage */}
      <div className="w-full">
        <ActiveStage onComplete={handleComplete} />
      </div>
    </div>
  );
}
