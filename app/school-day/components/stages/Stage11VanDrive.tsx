'use client';
import { useCallback, useEffect, useRef, useState } from 'react';
import { StageProps } from './stageTypes';

const W = 360, H = 560;
const LANE_W = 80;
const LANES = [60, 140, 220, 300]; // center-x of 4 lanes
const VAN_W = 50, VAN_H = 70;
const OBS_W = 44, OBS_H = 36;
const DURATION = 25; // seconds

interface Obstacle { id: number; x: number; y: number; type: 0|1|2; speed: number; }

function drawVan(ctx: CanvasRenderingContext2D, x: number, y: number) {
  const cx = x + VAN_W/2;
  ctx.fillStyle = '#FDD835';
  ctx.beginPath(); (ctx as any).roundRect(x, y, VAN_W, VAN_H, 8); ctx.fill();
  ctx.fillStyle = '#1565C0'; ctx.fillRect(x+4, y+4, VAN_W-8, 18); // windshield
  ctx.fillStyle = '#90CAF9'; ctx.fillRect(x+6, y+6, VAN_W-12, 14);
  ctx.fillStyle = '#333';
  [x+8, x+VAN_W-14].forEach(wx => [y+VAN_H-12, y+VAN_H-4].forEach(wy => { ctx.beginPath(); ctx.arc(wx+3, wy+3, 6, 0, Math.PI*2); ctx.fill(); }));
  ctx.fillStyle = '#E53935'; ctx.font = 'bold 7px sans-serif'; ctx.textAlign = 'center';
  ctx.fillText('태권도', cx, y+36);
}

function drawObstacle(ctx: CanvasRenderingContext2D, obs: Obstacle) {
  const { x, y, type } = obs;
  if (type === 0) { // traffic cone
    ctx.fillStyle = '#FF6D00';
    ctx.beginPath(); ctx.moveTo(x+OBS_W/2, y); ctx.lineTo(x, y+OBS_H); ctx.lineTo(x+OBS_W, y+OBS_H); ctx.closePath(); ctx.fill();
    ctx.fillStyle = '#FFF'; ctx.fillRect(x+6, y+OBS_H-10, OBS_W-12, 5);
  } else if (type === 1) { // rock
    ctx.fillStyle = '#78909C';
    ctx.beginPath(); ctx.ellipse(x+OBS_W/2, y+OBS_H/2, OBS_W/2, OBS_H/2-4, 0, 0, Math.PI*2); ctx.fill();
    ctx.fillStyle = '#90A4AE'; ctx.beginPath(); ctx.ellipse(x+OBS_W/2-4, y+OBS_H/2-4, 8, 6, -0.3, 0, Math.PI*2); ctx.fill();
  } else { // pothole
    ctx.fillStyle = '#1a1a1a';
    ctx.beginPath(); ctx.ellipse(x+OBS_W/2, y+OBS_H/2, OBS_W/2, OBS_H/2-2, 0, 0, Math.PI*2); ctx.fill();
    ctx.strokeStyle = '#333'; ctx.lineWidth = 2; ctx.beginPath();
    ctx.moveTo(x+10,y+OBS_H/2); ctx.lineTo(x+OBS_W-10,y+OBS_H/2); ctx.stroke();
  }
}

export default function Stage11VanDrive({ onComplete }: StageProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const vanXRef = useRef(LANES[1] - VAN_W/2);
  const obsRef = useRef<Obstacle[]>([]);
  const hpRef = useRef(100);
  const keysRef = useRef<Set<string>>(new Set());
  const idxRef = useRef(0);
  const doneRef = useRef(false);
  const flashRef = useRef(0);
  const startRef = useRef(Date.now());
  const [hp, setHp] = useState(100);
  const [timeLeft, setTimeLeft] = useState(DURATION);
  const [status, setStatus] = useState<'playing'|'win'|'fail'>('playing');

  const finish = useCallback((win: boolean) => {
    if (doneRef.current) return;
    doneRef.current = true;
    setStatus(win ? 'win' : 'fail');
    const score = win ? Math.max(10, hpRef.current) : 0;
    setTimeout(() => onComplete(score), 800);
  }, [onComplete]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key==='ArrowLeft')  { e.preventDefault(); e.type==='keydown'?keysRef.current.add('left') :keysRef.current.delete('left'); }
      if (e.key==='ArrowRight') { e.preventDefault(); e.type==='keydown'?keysRef.current.add('right'):keysRef.current.delete('right'); }
    };
    window.addEventListener('keydown',onKey); window.addEventListener('keyup',onKey);
    return ()=>{ window.removeEventListener('keydown',onKey); window.removeEventListener('keyup',onKey); };
  },[]);

  useEffect(()=>{
    const resize=()=>{
      if(!containerRef.current||!canvasRef.current) return;
      const s=Math.min(1,containerRef.current.clientWidth/W);
      canvasRef.current.style.width=`${W*s}px`; canvasRef.current.style.height=`${H*s}px`;
    };
    resize(); window.addEventListener('resize',resize); return()=>window.removeEventListener('resize',resize);
  },[]);

  useEffect(()=>{
    let raf: number; let frame=0; let spawnTimer=0;
    const loop=()=>{
      if(doneRef.current) return;
      frame++;
      const elapsed=(Date.now()-startRef.current)/1000;
      const rem=Math.max(0,DURATION-elapsed);
      setTimeLeft(Math.ceil(rem));
      if(rem<=0){ finish(true); return; }

      // Move van
      const spd=4;
      if(keysRef.current.has('left'))  vanXRef.current=Math.max(10,vanXRef.current-spd);
      if(keysRef.current.has('right')) vanXRef.current=Math.min(W-VAN_W-10,vanXRef.current+spd);

      // Spawn obstacles
      spawnTimer++;
      const spawnRate=Math.max(30, 70-Math.floor(elapsed*1.5));
      if(spawnTimer>=spawnRate){
        spawnTimer=0;
        const laneX=LANES[Math.floor(Math.random()*LANES.length)]-OBS_W/2;
        const speed=2+elapsed*0.08+Math.random()*1.5;
        obsRef.current.push({ id:idxRef.current++, x:laneX, y:-OBS_H, type:(Math.floor(Math.random()*3)) as 0|1|2, speed });
      }

      // Move obstacles
      obsRef.current=obsRef.current.filter(o=>o.y<H+20);
      obsRef.current.forEach(o=>{ o.y+=o.speed; });

      // Collision
      if(flashRef.current>0){ flashRef.current--; } else {
        const vx=vanXRef.current, vy=H-VAN_H-20;
        for(const o of obsRef.current){
          if(vx<o.x+OBS_W-4&&vx+VAN_W>o.x+4&&vy<o.y+OBS_H-4&&vy+VAN_H>o.y+4){
            hpRef.current=Math.max(0,hpRef.current-20);
            setHp(hpRef.current); flashRef.current=20;
            obsRef.current=obsRef.current.filter(x=>x!==o);
            if(hpRef.current<=0){ finish(false); return; }
            break;
          }
        }
      }

      // Render
      const canvas=canvasRef.current; if(!canvas) return;
      const ctx=canvas.getContext('2d'); if(!ctx) return;
      // Road
      ctx.fillStyle='#455A64'; ctx.fillRect(0,0,W,H);
      // Lane lines
      ctx.strokeStyle='#FFD700'; ctx.lineWidth=2; ctx.setLineDash([24,16]);
      [LANES[0]+LANE_W/2,LANES[1]+LANE_W/2,LANES[2]+LANE_W/2].forEach(lx=>{
        ctx.beginPath(); ctx.moveTo(lx,0); ctx.lineTo(lx,H); ctx.stroke();
      });
      ctx.setLineDash([]);
      // Road edges
      ctx.strokeStyle='#FFF'; ctx.lineWidth=3;
      ctx.beginPath(); ctx.moveTo(10,0); ctx.lineTo(10,H); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(W-10,0); ctx.lineTo(W-10,H); ctx.stroke();
      // Scrolling road markings
      const offset=(frame*3)%60;
      ctx.strokeStyle='rgba(255,255,255,0.15)'; ctx.lineWidth=1; ctx.setLineDash([40,20]);
      for(let y=-60+offset;y<H;y+=60){
        ctx.beginPath(); ctx.moveTo(W/2,y); ctx.lineTo(W/2,y+40); ctx.stroke();
      }
      ctx.setLineDash([]);
      // Flash overlay on hit
      if(flashRef.current>0){
        ctx.fillStyle=`rgba(255,0,0,${flashRef.current/20*0.4})`;
        ctx.fillRect(0,0,W,H);
      }
      // Obstacles
      obsRef.current.forEach(o=>drawObstacle(ctx,o));
      // Van
      drawVan(ctx,vanXRef.current,H-VAN_H-20);
      raf=requestAnimationFrame(loop);
    };
    raf=requestAnimationFrame(loop);
    return ()=>cancelAnimationFrame(raf);
  },[finish]);

  const moveLeft  = () => keysRef.current.add('left');
  const moveRight = () => keysRef.current.add('right');
  const stopLeft  = () => keysRef.current.delete('left');
  const stopRight = () => keysRef.current.delete('right');

  return (
    <div className="flex flex-col items-center gap-2">
      {/* HUD */}
      <div className="flex w-full max-w-xs gap-2">
        <div className="flex-1 bg-black/40 rounded-lg px-3 py-1">
          <div className="text-xs text-white/60">체력</div>
          <div className="w-full bg-white/10 rounded-full h-3 mt-1">
            <div className="h-full rounded-full transition-all" style={{ width:`${hp}%`, background: hp>50?'#22c55e':hp>25?'#eab308':'#ef4444' }}/>
          </div>
        </div>
        <div className={`bg-black/40 rounded-lg px-3 py-1 text-center ${timeLeft<=5?'text-red-400 animate-pulse':'text-white'}`}>
          <div className="text-xs text-white/60">시간</div>
          <div className="font-bold">{timeLeft}s</div>
        </div>
      </div>

      {/* Canvas */}
      <div ref={containerRef} className="relative w-full max-w-xs rounded-xl overflow-hidden border-4 border-white/30 shadow-xl">
        <canvas ref={canvasRef} width={W} height={H} className="block" />
        {status !== 'playing' && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/60">
            <span className="text-3xl font-bold text-white">{status==='win'?'🏠 도착!':'💥 충돌!'}</span>
          </div>
        )}
      </div>

      {/* Mobile controls */}
      <div className="flex gap-4 mt-1">
        <button onTouchStart={e=>{e.preventDefault();moveLeft();}} onTouchEnd={e=>{e.preventDefault();stopLeft();}}
          onMouseDown={moveLeft} onMouseUp={stopLeft} onMouseLeave={stopLeft}
          className="w-20 h-16 rounded-xl bg-white/30 border-2 border-white/50 text-white text-2xl font-bold select-none touch-none active:bg-white/60">◀</button>
        <button onTouchStart={e=>{e.preventDefault();moveRight();}} onTouchEnd={e=>{e.preventDefault();stopRight();}}
          onMouseDown={moveRight} onMouseUp={stopRight} onMouseLeave={stopRight}
          className="w-20 h-16 rounded-xl bg-white/30 border-2 border-white/50 text-white text-2xl font-bold select-none touch-none active:bg-white/60">▶</button>
      </div>
    </div>
  );
}
