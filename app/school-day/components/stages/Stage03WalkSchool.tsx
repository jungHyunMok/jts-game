'use client';
import { useCallback, useEffect, useRef, useState } from 'react';
import { drawCar } from '../../../components/game/drawCars';
import { drawPlayer } from '../../../components/game/drawPlayer';
import { CarState, PlayerState } from '../../../components/game/types';
import { CAR_COLORS } from '../../../components/game/constants';
import { StageProps } from './stageTypes';

const W = 480, H = 500;
const ROAD_Y = 220, ROAD_H = 80;
const GOAL_Y = 80;
const START_Y = H - 80;
const PW = 28, PH = 36, PSPEED = 3;

function makeCars(): CarState[] {
  return [
    { id: 0, x: -60,  y: ROAD_Y + 10, width: 56, height: 26, speed: 1.8, color: CAR_COLORS[0], lane: 0, direction: 'right' },
    { id: 1, x: 200,  y: ROAD_Y + 10, width: 52, height: 26, speed: 2.2, color: CAR_COLORS[2], lane: 0, direction: 'right' },
    { id: 2, x: W+20, y: ROAD_Y + 40, width: 58, height: 26, speed: 1.6, color: CAR_COLORS[3], lane: 1, direction: 'left'  },
    { id: 3, x: 100,  y: ROAD_Y + 40, width: 50, height: 26, speed: 2.0, color: CAR_COLORS[5], lane: 1, direction: 'left'  },
  ];
}

function drawScene(ctx: CanvasRenderingContext2D, cars: CarState[], player: PlayerState) {
  // Background
  ctx.fillStyle = '#90EE90';
  ctx.fillRect(0, 0, W, H);

  // School (top)
  ctx.fillStyle = '#E8F5E9';
  ctx.fillRect(0, 0, W, GOAL_Y + 30);
  ctx.fillStyle = '#F9A825';
  ctx.fillRect(W/2 - 50, 8, 100, 60);
  ctx.fillStyle = '#E53935';
  ctx.beginPath(); ctx.moveTo(W/2-60,8); ctx.lineTo(W/2,-16); ctx.lineTo(W/2+60,8); ctx.closePath(); ctx.fill();
  ctx.fillStyle = '#5D4037'; ctx.fillRect(W/2-10, 45, 20, 23);
  ctx.fillStyle = '#1B5E20'; ctx.font = 'bold 11px sans-serif'; ctx.textAlign = 'center';
  ctx.fillText('학교', W/2, H - (H - GOAL_Y + 5));

  // Road
  ctx.fillStyle = '#555'; ctx.fillRect(0, ROAD_Y, W, ROAD_H);
  ctx.strokeStyle = '#FFD700'; ctx.lineWidth = 2; ctx.setLineDash([20,14]);
  ctx.beginPath(); ctx.moveTo(0, ROAD_Y+ROAD_H/2); ctx.lineTo(W, ROAD_Y+ROAD_H/2); ctx.stroke();
  ctx.setLineDash([]);

  // Crosswalk
  ctx.fillStyle = 'rgba(255,255,255,0.9)';
  for (let sx = W/2-30; sx < W/2+30; sx += 18) ctx.fillRect(sx, ROAD_Y, 10, ROAD_H);
  ctx.strokeStyle = '#FFD700'; ctx.lineWidth = 2;
  ctx.strokeRect(W/2-30, ROAD_Y, 60, ROAD_H);

  // Road edges
  ctx.strokeStyle = '#FFF'; ctx.lineWidth = 2; ctx.setLineDash([]);
  [ROAD_Y, ROAD_Y+ROAD_H].forEach(y => {
    ctx.beginPath(); ctx.moveTo(0,y); ctx.lineTo(W,y); ctx.stroke();
  });

  // Goal zone indicator
  ctx.fillStyle = 'rgba(34,197,94,0.25)';
  ctx.fillRect(0, 0, W, GOAL_Y + 30);
  ctx.strokeStyle = '#22c55e'; ctx.lineWidth = 3; ctx.setLineDash([10,6]);
  ctx.beginPath(); ctx.moveTo(0, GOAL_Y+30); ctx.lineTo(W, GOAL_Y+30); ctx.stroke();
  ctx.setLineDash([]);

  // Home (bottom)
  ctx.fillStyle = '#E8F5E9'; ctx.fillRect(0, H-70, W, 70);
  ctx.fillStyle = '#90CAF9'; ctx.fillRect(W/2-45, H-65, 90, 55);
  ctx.fillStyle = '#5C6BC0'; ctx.fillRect(W/2-50, H-68, 100, 8);
  ctx.fillStyle = '#5D4037'; ctx.fillRect(W/2-10, H-25, 20, 24);
  ctx.fillStyle = '#1B5E20'; ctx.font = 'bold 10px sans-serif'; ctx.textAlign = 'center';
  ctx.fillText('우리집', W/2, H-70);

  cars.forEach(c => drawCar(ctx, c));
  drawPlayer(ctx, player);
}

export default function Stage03WalkSchool({ onComplete }: StageProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const playerRef = useRef<PlayerState>({ x: W/2-PW/2, y: START_Y, width: PW, height: PH, speed: PSPEED, direction: 'idle', animFrame: 0 });
  const carsRef = useRef<CarState[]>(makeCars());
  const keysRef = useRef<Set<string>>(new Set());
  const tickRef = useRef(0);
  const startRef = useRef(Date.now());
  const doneRef = useRef(false);
  const [timeLeft, setTimeLeft] = useState(30);
  const [status, setStatus] = useState<'playing'|'win'|'fail'>('playing');

  const update = useCallback(() => {
    if (doneRef.current) return;
    const p = playerRef.current; const keys = keysRef.current; let moved = false;
    if (keys.has('up'))    { p.y = Math.max(0, p.y - PSPEED); p.direction='up'; moved=true; }
    if (keys.has('down'))  { p.y = Math.min(H-PH, p.y + PSPEED); p.direction='down'; moved=true; }
    if (keys.has('left'))  { p.x = Math.max(0, p.x - PSPEED); p.direction='left'; moved=true; }
    if (keys.has('right')) { p.x = Math.min(W-PW, p.x + PSPEED); p.direction='right'; moved=true; }
    if (!moved) p.direction = 'idle';
    tickRef.current++;
    if (moved && tickRef.current % 8 === 0) p.animFrame = (p.animFrame+1)%4;
    carsRef.current.forEach(c => {
      c.x += c.direction === 'right' ? c.speed : -c.speed;
      if (c.x > W+20) c.x = -c.width-20;
      if (c.x < -c.width-20) c.x = W+20;
    });
    // Collision
    const px=p.x+4,py=p.y+4,pw=p.width-8,ph=p.height-4;
    for (const c of carsRef.current) {
      if (px<c.x+c.width && px+pw>c.x && py<c.y+c.height && py+ph>c.y) {
        p.x=W/2-PW/2; p.y=START_Y; break;
      }
    }
    // Win
    if (p.y + p.height < GOAL_Y + 30) {
      doneRef.current = true;
      const elapsed = (Date.now() - startRef.current) / 1000;
      const score = Math.max(20, Math.round(100 - elapsed * 3));
      setStatus('win');
      setTimeout(() => onComplete(score), 800);
    }
    const elapsed = Math.floor((Date.now()-startRef.current)/1000);
    setTimeLeft(Math.max(0, 30 - elapsed));
    if (elapsed >= 30 && !doneRef.current) {
      doneRef.current = true; setStatus('fail');
      setTimeout(() => onComplete(20), 800);
    }
  }, [onComplete]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const map: Record<string,string> = { ArrowUp:'up',ArrowDown:'down',ArrowLeft:'left',ArrowRight:'right' };
      if (map[e.key]) { e.preventDefault(); e.type==='keydown' ? keysRef.current.add(map[e.key]) : keysRef.current.delete(map[e.key]); }
    };
    window.addEventListener('keydown', onKey); window.addEventListener('keyup', onKey);
    return () => { window.removeEventListener('keydown', onKey); window.removeEventListener('keyup', onKey); };
  }, []);

  useEffect(() => {
    const resize = () => {
      if (!containerRef.current || !canvasRef.current) return;
      const s = Math.min(1, containerRef.current.clientWidth / W);
      canvasRef.current.style.width = `${W*s}px`; canvasRef.current.style.height = `${H*s}px`;
    };
    resize(); window.addEventListener('resize', resize); return () => window.removeEventListener('resize', resize);
  }, []);

  useEffect(() => {
    let raf: number;
    const loop = () => {
      update();
      const canvas = canvasRef.current; if (!canvas) return;
      const ctx = canvas.getContext('2d'); if (!ctx) return;
      ctx.clearRect(0,0,W,H);
      drawScene(ctx, carsRef.current, playerRef.current);
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, [update]);

  const press = (k: string) => keysRef.current.add(k);
  const release = (k: string) => keysRef.current.delete(k);

  return (
    <div className="flex flex-col items-center gap-2">
      <div className="flex gap-4 text-sm font-bold text-white">
        <span>⏱ {timeLeft}s</span>
        <span className="text-yellow-300">횡단보도로 건너세요!</span>
      </div>
      <div ref={containerRef} className="relative w-full rounded-xl overflow-hidden border-4 border-white/30 shadow-xl">
        <canvas ref={canvasRef} width={W} height={H} className="block" />
        {status !== 'playing' && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/60">
            <span className="text-3xl font-bold text-white">{status==='win'?'🏫 학교 도착!':'⏰ 시간 초과!'}</span>
          </div>
        )}
      </div>
      {/* D-pad */}
      <div className="flex flex-col items-center gap-1 mt-1">
        {[['up','▲'],['',''],['down','▼']].map(([,],ri) => (
          <div key={ri} className="flex gap-1">
            {ri===1 && <DBtn dir="left" label="◀" press={press} release={release}/>}
            {ri===1 && <div className="w-14 h-14"/>}
            {ri===1 && <DBtn dir="right" label="▶" press={press} release={release}/>}
            {ri!==1 && <DBtn dir={ri===0?'up':'down'} label={ri===0?'▲':'▼'} press={press} release={release}/>}
          </div>
        ))}
      </div>
    </div>
  );
}

function DBtn({ dir, label, press, release }: { dir:string; label:string; press:(k:string)=>void; release:(k:string)=>void }) {
  return (
    <button
      className="w-14 h-14 rounded-xl bg-white/30 active:bg-white/60 border-2 border-white/50 text-white text-xl font-bold select-none touch-none"
      onTouchStart={e=>{e.preventDefault();press(dir);}} onTouchEnd={e=>{e.preventDefault();release(dir);}}
      onMouseDown={()=>press(dir)} onMouseUp={()=>release(dir)} onMouseLeave={()=>release(dir)}
    >{label}</button>
  );
}
