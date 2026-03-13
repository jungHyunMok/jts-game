'use client';
import { useCallback, useEffect, useRef, useState } from 'react';
import {
  CANVAS_HEIGHT,
  CANVAS_WIDTH,
  CAR_COLORS,
  CROSSWALK_WIDTH,
  PLAYER_HEIGHT,
  PLAYER_SPEED,
  PLAYER_START_X,
  PLAYER_START_Y,
  PLAYER_WIDTH,
  ROADS,
  SCHOOL_HEIGHT,
  SCHOOL_Y,
} from './constants';
import { CarState, GameState, PlayerState } from './types';

function randomBetween(a: number, b: number) {
  return a + Math.random() * (b - a);
}

function makeCars(canvasWidth: number, difficulty: number): CarState[] {
  const t = (difficulty - 1) / 9; // 0(쉬움) ~ 1(어려움)
  const cars: CarState[] = [];
  let id = 0;

  ROADS.forEach((road, rIdx) => {
    const lanesPerRoad = 2;
    for (let lane = 0; lane < lanesPerRoad; lane++) {
      const laneY = road.y + 10 + lane * 30;
      const direction = lane % 2 === 0 ? 'right' : 'left';

      // 차량 수: 난이도 1→2대, 난이도 10→6대 (도로 인덱스마다 +1)
      const count = 2 + Math.round(t * 4) + rIdx;
      // 속도: 난이도 1→0.3~0.6, 난이도 10→2.3~3.8 (전체적으로 느리게 조정)
      const roadBonus = rIdx * (0.1 + t * 0.2);
      const speedMin = 0.3 + t * 2.0 + roadBonus;
      const speedMax = speedMin + 0.3 + t * 1.5;
      // 크기: 난이도 1→작게(36×18), 난이도 10→크게(58×28)
      const carW = 36 + t * 22 + Math.random() * 8;
      const carH = 18 + t * 10;

      for (let i = 0; i < count; i++) {
        const startX = direction === 'right'
          ? -carW - i * (canvasWidth / count)
          : canvasWidth + i * (canvasWidth / count);
        cars.push({
          id: id++,
          x: startX,
          y: laneY,
          width: carW,
          height: carH,
          speed: randomBetween(speedMin, speedMax),
          color: CAR_COLORS[Math.floor(Math.random() * CAR_COLORS.length)],
          lane: lane,
          direction,
        });
      }
    }
  });
  return cars;
}

// 도로별 횡단보도 X 위치 목록을 랜덤 생성 (1~3개)
function makeCrosswalks(canvasWidth: number): number[][] {
  const margin = 30;
  const minGap = CROSSWALK_WIDTH + 24;

  return ROADS.map(() => {
    const count = 1 + Math.floor(Math.random() * 3); // 1~3개
    const positions: number[] = [];
    let attempts = 0;

    while (positions.length < count && attempts < 80) {
      attempts++;
      const x = margin + Math.random() * (canvasWidth - margin * 2 - CROSSWALK_WIDTH);
      if (positions.every(p => Math.abs(p - x) >= minGap)) {
        positions.push(x);
      }
    }
    return positions.sort((a, b) => a - b);
  });
}

export function useGameLogic(canvasWidth: number, difficulty: number) {
  const [gameState, setGameState] = useState<GameState>({
    status: 'idle',
    elapsedTime: 0,
    score: 0,
  });

  const playerRef = useRef<PlayerState>({
    x: PLAYER_START_X,
    y: PLAYER_START_Y,
    width: PLAYER_WIDTH,
    height: PLAYER_HEIGHT,
    speed: PLAYER_SPEED,
    direction: 'idle',
    animFrame: 0,
  });

  const carsRef = useRef<CarState[]>([]);
  const crosswalksRef = useRef<number[][]>(ROADS.map(() => [CANVAS_WIDTH / 2 - CROSSWALK_WIDTH / 2]));
  const keysRef = useRef<Set<string>>(new Set());
  const animFrameRef = useRef<number>(0);
  const tickRef = useRef<number>(0);
  const startTimeRef = useRef<number>(0);
  const statusRef = useRef<'idle' | 'playing' | 'dead' | 'win'>('idle');

  const resetPlayer = useCallback(() => {
    playerRef.current = {
      x: PLAYER_START_X,
      y: PLAYER_START_Y,
      width: PLAYER_WIDTH,
      height: PLAYER_HEIGHT,
      speed: PLAYER_SPEED,
      direction: 'idle',
      animFrame: 0,
    };
  }, []);

  const startGame = useCallback(() => {
    resetPlayer();
    carsRef.current = makeCars(canvasWidth, difficulty);
    crosswalksRef.current = makeCrosswalks(canvasWidth);
    startTimeRef.current = Date.now();
    statusRef.current = 'playing';
    setGameState({ status: 'playing', elapsedTime: 0, score: 0 });
  }, [canvasWidth, difficulty, resetPlayer]);

  const checkCollision = useCallback(() => {
    const p = playerRef.current;
    for (const car of carsRef.current) {
      const px = p.x + 4, py = p.y + 4, pw = p.width - 8, ph = p.height - 4;
      if (
        px < car.x + car.width &&
        px + pw > car.x &&
        py < car.y + car.height &&
        py + ph > car.y
      ) {
        return true;
      }
    }
    return false;
  }, []);

  const update = useCallback(() => {
    if (statusRef.current !== 'playing') return;

    const p = playerRef.current;
    const keys = keysRef.current;
    let moved = false;

    if (keys.has('ArrowUp') || keys.has('up')) {
      p.y = Math.max(0, p.y - p.speed);
      p.direction = 'up';
      moved = true;
    }
    if (keys.has('ArrowDown') || keys.has('down')) {
      p.y = Math.min(CANVAS_HEIGHT - p.height, p.y + p.speed);
      p.direction = 'down';
      moved = true;
    }
    if (keys.has('ArrowLeft') || keys.has('left')) {
      p.x = Math.max(0, p.x - p.speed);
      p.direction = 'left';
      moved = true;
    }
    if (keys.has('ArrowRight') || keys.has('right')) {
      p.x = Math.min(canvasWidth - p.width, p.x + p.speed);
      p.direction = 'right';
      moved = true;
    }

    if (!moved) p.direction = 'idle';

    // Animate player legs
    tickRef.current++;
    if (moved && tickRef.current % 8 === 0) {
      p.animFrame = (p.animFrame + 1) % 4;
    }

    // Update cars
    for (const car of carsRef.current) {
      if (car.direction === 'right') {
        car.x += car.speed;
        if (car.x > canvasWidth + 20) car.x = -car.width - 20;
      } else {
        car.x -= car.speed;
        if (car.x < -car.width - 20) car.x = canvasWidth + 20;
      }
    }

    // Check collision
    if (checkCollision()) {
      resetPlayer();
    }

    // Check win
    if (p.y + p.height < SCHOOL_Y + SCHOOL_HEIGHT && p.y > SCHOOL_Y - 10) {
      const elapsed = Math.floor((Date.now() - startTimeRef.current) / 1000);
      const score = Math.max(0, 1000 - elapsed * 10);
      statusRef.current = 'win';
      setGameState({ status: 'win', elapsedTime: elapsed, score });
    } else {
      const elapsed = Math.floor((Date.now() - startTimeRef.current) / 1000);
      setGameState(prev => ({ ...prev, elapsedTime: elapsed }));
    }
  }, [canvasWidth, checkCollision, resetPlayer]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (['ArrowUp','ArrowDown','ArrowLeft','ArrowRight'].includes(e.key)) {
        e.preventDefault();
        if (e.type === 'keydown') {
          keysRef.current.add(e.key);
          if (statusRef.current === 'idle') startGame();
        } else {
          keysRef.current.delete(e.key);
        }
      }
    };
    window.addEventListener('keydown', onKey);
    window.addEventListener('keyup', onKey);
    return () => {
      window.removeEventListener('keydown', onKey);
      window.removeEventListener('keyup', onKey);
    };
  }, [startGame]);

  const pressKey = useCallback((key: string) => {
    keysRef.current.add(key);
    if (statusRef.current === 'idle') startGame();
  }, [startGame]);

  const releaseKey = useCallback((key: string) => {
    keysRef.current.delete(key);
  }, []);

  return {
    gameState,
    playerRef,
    carsRef,
    crosswalksRef,
    startGame,
    pressKey,
    releaseKey,
    update,
  };
}
