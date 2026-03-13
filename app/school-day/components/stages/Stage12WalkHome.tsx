'use client';
import { useCallback, useEffect, useRef, useState } from 'react';
import { StageProps } from './stageTypes';

const W = 480, H = 300;
const PLAYER_X = 80, GROUND_Y = H - 60;
const PW = 28, PH = 36;
const DURATION = 25;
const GRAVITY = 0.55, JUMP_POWER = -11;

interface JunkFood { id: number; x: number; y: number; type: number; speed: number; }

const JUNK_EMOJIS = ['🍫','🍟','🥤','🍭','🍬','🍩','🍪'];
const BONUS_EMOJIS = ['⭐','🎵','💎'];

function drawBackground(ctx: CanvasRenderingContext2D, frame: number) {
  // Sky
  ctx.fillStyle = '#87CEEB'; ctx.fillRect(0,0,W,H);
  // Buildings (slow parallax)
  ctx.fillStyle = '#AAB7C4';
  const bOffset = (frame * 0.5) % 120;
  for(let i=-1;i<5;i++){
    const bx = i*120-bOffset;
    ctx.fillRect(bx+5,GROUND_Y-60,40,60); ctx.fillRect(bx+55,GROUND_Y-45,30,45); ctx.fillRect(bx+90,GROUND_Y-80,45,80);
  }
  // Ground
  ctx.fillStyle = '#5D8A3C'; ctx.fillRect(0,GROUND_Y,W,H-GROUND_Y);
  ctx.fillStyle = '#90EE90'; ctx.fillRect(0,GROUND_Y,W,8);
  // Road
  ctx.fillStyle = '#888'; ctx.fillRect(0,GROUND_Y+8,W,H-GROUND_Y-8);
  ctx.strokeStyle = '#FFD700'; ctx.lineWidth=2; ctx.setLineDash([20,14]);
  ctx.beginPath(); ctx.moveTo(0,GROUND_Y+18); ctx.lineTo(W,GROUND_Y+18); ctx.stroke();
  ctx.setLineDash([]);
}

function drawRunner(ctx: CanvasRenderingContext2D, py: number, animFrame: number, isJumping: boolean) {
  const x = PLAYER_X, y = py;
  const cx = x + PW/2;
  const legSwing = isJumping ? 0 : Math.sin((animFrame/4)*Math.PI*2)*4;
  // Shadow
  ctx.fillStyle='rgba(0,0,0,0.15)'; ctx.ellipse(cx,GROUND_Y+2,PW/2,5,0,0,Math.PI*2); ctx.fill();
  // Body
  ctx.fillStyle='#1A237E'; ctx.fillRect(x+5,y+14,PW-10,PH-20);
  // Head
  ctx.fillStyle='#FFCC80'; ctx.beginPath(); ctx.arc(cx,y+9,9,0,Math.PI*2); ctx.fill();
  ctx.fillStyle='#4E342E'; ctx.fillRect(cx-9,y+1,18,7);
  ctx.beginPath(); ctx.arc(cx,y+9,9,Math.PI,Math.PI*2); ctx.fill();
  ctx.fillStyle='#212121'; ctx.fillRect(cx-4,y+7,3,3); ctx.fillRect(cx+1,y+7,3,3);
  // Bag
  ctx.fillStyle='#F44336'; ctx.fillRect(x+PW-9,y+14,7,14);
  // Legs
  ctx.fillStyle='#0D47A1';
  ctx.fillRect(x+5,y+PH-14,7,10+legSwing);
  ctx.fillRect(x+PW-12,y+PH-14,7,10-legSwing);
  ctx.fillStyle='#212121';
  ctx.fillRect(x+4,y+PH-6,9,5); ctx.fillRect(x+PW-13,y+PH-6,9,5);
}

export default function Stage12WalkHome({ onComplete }: StageProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const pyRef   = useRef(GROUND_Y - PH);
  const vyRef   = useRef(0);
  const grndRef = useRef(true);
  const animRef = useRef(0);
  const foodRef = useRef<JunkFood[]>([]);
  const hpRef   = useRef(100);
  const doneRef = useRef(false);
  const startRef = useRef(Date.now());
  const idRef    = useRef(0);
  const jumpRef  = useRef(false);
  const frameRef = useRef(0);
  const [hp, setHp]     = useState(100);
  const [timeLeft, setTimeLeft] = useState(DURATION);
  const [status, setStatus] = useState<'playing'|'win'|'fail'>('playing');
  const [score, setScore] = useState(0);

  const doJump = useCallback(() => {
    if (grndRef.current) { vyRef.current = JUMP_POWER; grndRef.current = false; }
  }, []);

  const finish = useCallback((win: boolean) => {
    if (doneRef.current) return;
    doneRef.current = true;
    setStatus(win ? 'win' : 'fail');
    const sc = win ? Math.max(10, hpRef.current) : 0;
    setScore(sc);
    setTimeout(() => onComplete(sc), 800);
  }, [onComplete]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.key==='ArrowUp'||e.key===' ')&&e.type==='keydown') { e.preventDefault(); doJump(); }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [doJump]);

  useEffect(() => {
    const resize=()=>{
      if(!containerRef.current||!canvasRef.current) return;
      const s=Math.min(1,containerRef.current.clientWidth/W);
      canvasRef.current.style.width=`${W*s}px`; canvasRef.current.style.height=`${H*s}px`;
    };
    resize(); window.addEventListener('resize',resize); return()=>window.removeEventListener('resize',resize);
  },[]);

  useEffect(() => {
    let raf: number; let spawnTimer=0;
    const loop = () => {
      if (doneRef.current) return;
      const frame = ++frameRef.current;
      const elapsed = (Date.now()-startRef.current)/1000;
      setTimeLeft(Math.ceil(Math.max(0,DURATION-elapsed)));
      if (elapsed >= DURATION) { finish(true); return; }

      // Physics
      vyRef.current += GRAVITY;
      pyRef.current  = Math.min(GROUND_Y-PH, pyRef.current + vyRef.current);
      if (pyRef.current >= GROUND_Y-PH) { pyRef.current=GROUND_Y-PH; vyRef.current=0; grndRef.current=true; }
      animRef.current = (animRef.current + 1) % 32;

      // Spawn food
      spawnTimer++;
      const rate = Math.max(40, 90 - Math.floor(elapsed*2));
      if (spawnTimer >= rate) {
        spawnTimer=0;
        const isBonus = Math.random() < 0.15;
        const foodY = isBonus ? GROUND_Y-PH-10 : GROUND_Y-PH+(Math.random()<0.5?0:-10);
        foodRef.current.push({
          id: idRef.current++,
          x: W+20, y: foodY,
          type: isBonus ? -1 : Math.floor(Math.random()*JUNK_EMOJIS.length),
          speed: 3+elapsed*0.1+Math.random()*2,
        });
      }

      // Move food
      foodRef.current = foodRef.current.filter(f=>f.x>-40);
      foodRef.current.forEach(f=>{ f.x-=f.speed; });

      // Collision
      const py=pyRef.current;
      foodRef.current = foodRef.current.filter(f=>{
        const hit = PLAYER_X+4<f.x+32&&PLAYER_X+PW-4>f.x&&py+4<f.y+32&&py+PH-4>f.y;
        if(hit){
          if(f.type===-1){ /* bonus - no hp change */ }
          else { hpRef.current=Math.max(0,hpRef.current-25); setHp(hpRef.current); if(hpRef.current<=0){finish(false);} }
          return false;
        }
        return true;
      });

      // Render
      const canvas=canvasRef.current; if(!canvas)return;
      const ctx=canvas.getContext('2d'); if(!ctx)return;
      drawBackground(ctx, frame);
      // Food items
      ctx.font = '28px serif'; ctx.textAlign = 'center';
      foodRef.current.forEach(f=>{
        const emoji = f.type===-1 ? BONUS_EMOJIS[f.id%BONUS_EMOJIS.length] : JUNK_EMOJIS[f.type];
        ctx.fillText(emoji, f.x+16, f.y+28);
      });
      // Player
      drawRunner(ctx, py, Math.floor(animRef.current/8), !grndRef.current);
      // HP flash
      if(hpRef.current<100){
        ctx.fillStyle=`rgba(255,0,0,${Math.max(0,(25-(frame%25))/25)*0.3})`;
        ctx.fillRect(0,0,W,H);
      }
      raf=requestAnimationFrame(loop);
    };
    raf=requestAnimationFrame(loop);
    return ()=>cancelAnimationFrame(raf);
  },[finish]);

  return (
    <div className="flex flex-col items-center gap-2">
      {/* HUD */}
      <div className="flex w-full max-w-lg gap-2 px-1">
        <div className="flex-1 bg-black/40 rounded-lg px-3 py-1">
          <div className="text-xs text-white/60">체력</div>
          <div className="w-full bg-white/10 rounded-full h-3 mt-1">
            <div className="h-full rounded-full transition-all" style={{ width:`${hp}%`, background:hp>50?'#22c55e':hp>25?'#eab308':'#ef4444' }}/>
          </div>
        </div>
        <div className={`bg-black/40 rounded-lg px-3 py-1 text-center ${timeLeft<=5?'text-red-400 animate-pulse':'text-white'}`}>
          <div className="text-xs text-white/60">시간</div>
          <div className="font-bold">{timeLeft}s</div>
        </div>
      </div>
      <p className="text-white/70 text-xs">불량식품을 피해 점프하라! ⬆ 키 또는 아래 버튼</p>

      <div ref={containerRef} className="relative w-full max-w-lg rounded-xl overflow-hidden border-4 border-white/30 shadow-xl">
        <canvas ref={canvasRef} width={W} height={H} className="block" />
        {status !== 'playing' && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/60">
            <span className="text-3xl font-bold text-white">{status==='win'?`🏠 집 도착! (${score}점)`:'💔 건강을 잃었어요!'}</span>
          </div>
        )}
      </div>

      <button
        onClick={doJump}
        className="w-36 h-16 rounded-2xl bg-green-500 hover:bg-green-400 active:scale-95 text-white font-bold text-xl shadow-lg select-none touch-none"
        onTouchStart={e=>{e.preventDefault();doJump();}}
      >
        ⬆ 점프!
      </button>
    </div>
  );
}
