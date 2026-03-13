'use client';
import { useRef, useState } from 'react';
import { StageProps } from './stageTypes';

// ── Math questions ──────────────────────────────────────────────────────────
const MATH_QS = [
  { q:'7 × 8 = ?',  a:56, choices:[48,56,63,54] },
  { q:'36 ÷ 4 = ?', a:9,  choices:[8,9,12,7]   },
  { q:'15 + 28 = ?',a:43, choices:[41,43,44,42] },
  { q:'64 - 27 = ?',a:37, choices:[37,36,38,39] },
  { q:'9 × 6 = ?',  a:54, choices:[54,48,56,63] },
];
// ── Korean questions ─────────────────────────────────────────────────────────
const KOREAN_QS = [
  { q:'다음 중 높임말은?', a:'드시다', choices:['먹다','드시다','먹어요','밥먹다'] },
  { q:'"기쁘다"의 반대말은?', a:'슬프다', choices:['즐겁다','슬프다','행복하다','신나다'] },
  { q:'받침이 없는 글자는?', a:'나', choices:['닭','곰','나','밥'] },
  { q:'"꽃"을 바르게 쓴 것은?', a:'꽃', choices:['꼿','꽃','꽁','꽂'] },
];
// ── English questions ────────────────────────────────────────────────────────
const ENGLISH_QS = [
  { q:'🍎 의 영어는?', a:'apple',  choices:['banana','apple','grape','peach'] },
  { q:'🐶 의 영어는?', a:'dog',    choices:['cat','bird','dog','fish']        },
  { q:'"학교"의 영어는?', a:'school',choices:['house','school','park','store'] },
  { q:'"Monday"는 무슨 요일?', a:'월요일', choices:['화요일','수요일','월요일','목요일'] },
  { q:'"apple"의 뜻은?', a:'사과', choices:['바나나','사과','포도','딸기'] },
];
// ── PE questions (soccer) ────────────────────────────────────────────────────
const PE_QS = [
  { q:'⚽ 공을 찰 때 사용하는 발의 부분은?', a:'발등', choices:['발등','발뒤꿈치','발가락','무릎'] },
  { q:'축구에서 골키퍼만 할 수 있는 것은?', a:'손으로 공 잡기', choices:['손으로 공 잡기','헤딩','패스','드리블'] },
  { q:'축구 경기 한 팀의 선수는?', a:'11명', choices:['9명','10명','11명','12명'] },
];

type Subject = '수학' | '국어' | '영어' | '체육';
const SUBJECTS: Subject[] = ['수학', '국어', '영어', '체육'];
const SUBJECT_EMOJI: Record<Subject, string> = { '수학':'🔢', '국어':'📖', '영어':'🔤', '체육':'⚽' };
const SUBJECT_BG: Record<Subject, string> = { '수학':'bg-blue-700', '국어':'bg-green-700', '영어':'bg-purple-700', '체육':'bg-orange-700' };

function pickQ(subject: Subject) {
  const pool = subject === '수학' ? MATH_QS : subject === '국어' ? KOREAN_QS : subject === '영어' ? ENGLISH_QS : PE_QS;
  return pool[Math.floor(Math.random() * pool.length)];
}

export default function Stage08Class({ onComplete }: StageProps) {
  const subject = useRef<Subject>(SUBJECTS[Math.floor(Math.random() * SUBJECTS.length)]);
  const q = useRef(pickQ(subject.current));
  const [chosen, setChosen] = useState<string | null>(null);
  const [done, setDone] = useState(false);
  const startRef = useRef(Date.now());

  const handleAnswer = (choice: string) => {
    if (done) return;
    setChosen(String(choice));
    setDone(true);
    const correct = String(choice) === String(q.current.a);
    const elapsed = (Date.now() - startRef.current) / 1000;
    const speed = Math.max(0, Math.round(40 - elapsed * 4));
    const score = correct ? 60 + speed : 0;
    setTimeout(() => onComplete(Math.min(100, score)), 900);
  };

  const subj = subject.current;
  const question = q.current;

  return (
    <div className="flex flex-col items-center gap-4 p-4 select-none">
      {/* Subject badge */}
      <div className={`flex items-center gap-2 px-5 py-2 rounded-full ${SUBJECT_BG[subj]} text-white font-bold text-lg`}>
        <span>{SUBJECT_EMOJI[subj]}</span>
        <span>{subj} 시간</span>
      </div>

      {/* Question */}
      <div className="w-full max-w-xs bg-white/10 border-2 border-white/20 rounded-2xl p-5 text-center">
        <div className="text-white font-bold text-xl leading-relaxed">{question.q}</div>
      </div>

      {/* Choices */}
      <div className="grid grid-cols-2 gap-3 w-full max-w-xs">
        {question.choices.map((c, i) => {
          const cStr = String(c);
          const isCorrect = cStr === String(question.a);
          const isChosen = chosen === cStr;
          let cls = 'bg-white/10 border-white/30 text-white hover:bg-white/20';
          if (done) {
            if (isCorrect) cls = 'bg-green-500 border-green-300 text-white';
            else if (isChosen) cls = 'bg-red-500 border-red-300 text-white';
            else cls = 'bg-white/5 border-white/10 text-white/40';
          }
          return (
            <button key={i} onClick={() => handleAnswer(cStr)} disabled={done}
              className={`p-3 rounded-xl border-2 font-bold transition-all text-center ${cls}`}>
              {c}
            </button>
          );
        })}
      </div>

      {done && (
        <div className={`text-lg font-bold ${chosen === String(question.a) ? 'text-green-400' : 'text-red-400'}`}>
          {chosen === String(question.a) ? '🎉 정답!' : `❌ 정답: ${question.a}`}
        </div>
      )}
    </div>
  );
}
