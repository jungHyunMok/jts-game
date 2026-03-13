'use client';
import { useCallback, useEffect, useRef, useState } from 'react';
import {
  CANVAS_HEIGHT,
  CANVAS_WIDTH,
  CAR_COLORS,
  CROSSWALK_WIDTH,
  EFFECT_DURATION,
  INITIAL_LIVES,
  ITEM_SIZE,
  PLAYER_HEIGHT,
  PLAYER_SPEED,
  PLAYER_START_X,
  PLAYER_START_Y,
  PLAYER_WIDTH,
  RESPAWN_INVINCIBLE_MS,
  ROADS,
  SCHOOL_HEIGHT,
  SCHOOL_Y,
  SPEED_BOOST_MULT,
  SPEED_SLOW_MULT,
} from './constants';
import { ActiveEffect, CarState, EffectType, GameState, ItemBox, PlayerState } from './types';

const CAR_BRANDS = [
  'mercedes', 'bmw', 'vw', 'kia', 'hyundai',
  'ferrari', 'lamborghini', 'genesis', 'audi', 'porsche',
];

function randomBetween(a: number, b: number) {
  return a + Math.random() * (b - a);
}

function makeCars(canvasWidth: number, difficulty: number): CarState[] {
  const t = (difficulty - 1) / 9;
  const cars: CarState[] = [];
  let id = 0;

  ROADS.forEach((road, rIdx) => {
    const lanesPerRoad = 2;
    for (let lane = 0; lane < lanesPerRoad; lane++) {
      const laneY = road.y + 10 + lane * 30;
      const direction = lane % 2 === 0 ? 'right' : 'left';
      const count = 2 + Math.round(t * 4) + rIdx;
      const roadBonus = rIdx * (0.1 + t * 0.2);
      const speedMin = 0.3 + t * 2.0 + roadBonus;
      const speedMax = speedMin + 0.3 + t * 1.5;
      const carW = 36 + t * 22 + Math.random() * 8;
      const carH = 18 + t * 10;

      for (let i = 0; i < count; i++) {
        const startX =
          direction === 'right'
            ? -carW - i * (canvasWidth / count)
            : canvasWidth + i * (canvasWidth / count);
        const spd = randomBetween(speedMin, speedMax);
        cars.push({
          id: id++,
          x: startX,
          y: laneY,
          width: carW,
          height: carH,
          speed: spd,
          baseSpeed: spd,
          color: CAR_COLORS[Math.floor(Math.random() * CAR_COLORS.length)],
          brand: CAR_BRANDS[Math.floor(Math.random() * CAR_BRANDS.length)],
          lane,
          direction: direction as 'left' | 'right',
        });
      }
    }
  });
  return cars;
}

function makeCrosswalks(canvasWidth: number): number[][] {
  const margin = 30;
  const minGap = CROSSWALK_WIDTH + 24;

  return ROADS.map(() => {
    const count = 1 + Math.floor(Math.random() * 3);
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

const ITEM_TYPES: EffectType[] = ['invincible', 'overpass', 'carSpeedUp', 'carSpeedDown'];

function makeItems(): ItemBox[] {
  const HOME_Y_VAL = CANVAS_HEIGHT - 100;
  const safeZones = [
    { y1: SCHOOL_Y + SCHOOL_HEIGHT + 10, y2: ROADS[0].y - 10 },
    { y1: ROADS[0].y + ROADS[0].height + 10, y2: ROADS[1].y - 10 },
    { y1: ROADS[1].y + ROADS[1].height + 10, y2: ROADS[2].y - 10 },
    { y1: ROADS[2].y + ROADS[2].height + 10, y2: HOME_Y_VAL - 10 },
  ];

  const items: ItemBox[] = [];
  let id = 0;

  safeZones.forEach(zone => {
    const availableH = zone.y2 - zone.y1 - ITEM_SIZE;
    if (availableH < 5) return;
    const count = Math.random() < 0.5 ? 1 : 2;
    const usedTypes: EffectType[] = [];

    for (let i = 0; i < count; i++) {
      const remaining = ITEM_TYPES.filter(t => !usedTypes.includes(t));
      if (remaining.length === 0) break;
      const type = remaining[Math.floor(Math.random() * remaining.length)];
      usedTypes.push(type);

      const x = 20 + Math.random() * (CANVAS_WIDTH - 40 - ITEM_SIZE);
      const y = zone.y1 + Math.random() * availableH;
      items.push({
        id: id++,
        x,
        y,
        width: ITEM_SIZE,
        height: ITEM_SIZE,
        type,
        collected: false,
        animTick: 0,
      });
    }
  });

  return items;
}

function getOverpassRoadIdx(effects: ActiveEffect[], now: number): number {
  const effect = effects.find(e => e.type === 'overpass' && e.endTime > now);
  return effect?.roadIndex ?? -1;
}

function getCarSpeedMult(effects: ActiveEffect[], now: number): number {
  const hasSpeedUp = effects.some(e => e.type === 'carSpeedUp' && e.endTime > now);
  const hasSpeedDown = effects.some(e => e.type === 'carSpeedDown' && e.endTime > now);
  if (hasSpeedUp) return SPEED_BOOST_MULT;
  if (hasSpeedDown) return SPEED_SLOW_MULT;
  return 1;
}

function playerOnCrosswalk(
  px: number,
  pw: number,
  crosswalks: number[][],
  roadIdx: number
): boolean {
  if (roadIdx < 0) return true;
  const positions = crosswalks[roadIdx] ?? [];
  const centerX = px + pw / 2;
  return positions.some(cwX => centerX >= cwX && centerX <= cwX + CROSSWALK_WIDTH);
}

function getPlayerRoadIdx(py: number, ph: number): number {
  return ROADS.findIndex(road => py + ph > road.y + 4 && py < road.y + road.height - 4);
}

export function useGameLogic(canvasWidth: number, difficulty: number) {
  const [gameState, setGameState] = useState<GameState>({
    status: 'idle',
    elapsedTime: 0,
    score: 0,
    lives: INITIAL_LIVES,
    activeEffects: [],
  });

  const playerRef = useRef<PlayerState>({
    x: PLAYER_START_X,
    y: PLAYER_START_Y,
    width: PLAYER_WIDTH,
    height: PLAYER_HEIGHT,
    speed: PLAYER_SPEED,
    direction: 'idle',
    animFrame: 0,
    invincibleUntil: 0,
  });

  const carsRef = useRef<CarState[]>([]);
  const crosswalksRef = useRef<number[][]>(
    ROADS.map(() => [CANVAS_WIDTH / 2 - CROSSWALK_WIDTH / 2])
  );
  const itemsRef = useRef<ItemBox[]>([]);
  const activeEffectsRef = useRef<ActiveEffect[]>([]);
  const keysRef = useRef<Set<string>>(new Set());
  const animFrameRef = useRef<number>(0);
  const tickRef = useRef<number>(0);
  const startTimeRef = useRef<number>(0);
  const statusRef = useRef<'idle' | 'playing' | 'dead' | 'win' | 'gameover'>('idle');
  const livesRef = useRef<number>(INITIAL_LIVES);

  const resetPlayer = useCallback(() => {
    playerRef.current = {
      x: PLAYER_START_X,
      y: PLAYER_START_Y,
      width: PLAYER_WIDTH,
      height: PLAYER_HEIGHT,
      speed: PLAYER_SPEED,
      direction: 'idle',
      animFrame: 0,
      invincibleUntil: Date.now() + RESPAWN_INVINCIBLE_MS,
    };
  }, []);

  const startGame = useCallback(() => {
    resetPlayer();
    playerRef.current.invincibleUntil = 0; // no invincibility at game start
    carsRef.current = makeCars(canvasWidth, difficulty);
    crosswalksRef.current = makeCrosswalks(canvasWidth);
    itemsRef.current = makeItems();
    activeEffectsRef.current = [];
    livesRef.current = INITIAL_LIVES;
    startTimeRef.current = Date.now();
    statusRef.current = 'playing';
    setGameState({
      status: 'playing',
      elapsedTime: 0,
      score: 0,
      lives: INITIAL_LIVES,
      activeEffects: [],
    });
  }, [canvasWidth, difficulty, resetPlayer]);

  const continueGame = useCallback(() => {
    resetPlayer();
    activeEffectsRef.current = [];
    livesRef.current = INITIAL_LIVES;
    startTimeRef.current = Date.now();
    statusRef.current = 'playing';
    setGameState(prev => ({
      ...prev,
      status: 'playing',
      lives: INITIAL_LIVES,
      activeEffects: [],
    }));
  }, [resetPlayer]);

  const checkCollision = useCallback(() => {
    const p = playerRef.current;
    const now = Date.now();
    if ((p.invincibleUntil ?? 0) > now) return false;

    const overpassRoadIdx = getOverpassRoadIdx(activeEffectsRef.current, now);
    const invincibleEffect = activeEffectsRef.current.some(
      e => e.type === 'invincible' && e.endTime > now
    );
    if (invincibleEffect) return false;

    for (const car of carsRef.current) {
      const carRoadIdx = ROADS.findIndex(
        road => car.y >= road.y && car.y < road.y + road.height
      );
      if (carRoadIdx === overpassRoadIdx && overpassRoadIdx >= 0) continue;

      const px = p.x + 4,
        py = p.y + 4,
        pw = p.width - 8,
        ph = p.height - 4;
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

  const checkItemPickup = useCallback(() => {
    const p = playerRef.current;
    const now = Date.now();

    for (const item of itemsRef.current) {
      if (item.collected) continue;
      if (
        p.x < item.x + item.width &&
        p.x + p.width > item.x &&
        p.y < item.y + item.height &&
        p.y + p.height > item.y
      ) {
        item.collected = true;

        const effect: ActiveEffect = {
          type: item.type,
          endTime: now + EFFECT_DURATION,
        };

        if (item.type === 'invincible') {
          playerRef.current.invincibleUntil = now + EFFECT_DURATION;
        } else if (item.type === 'overpass') {
          effect.roadIndex = Math.floor(Math.random() * ROADS.length);
        }

        activeEffectsRef.current = activeEffectsRef.current.filter(
          e => e.type !== item.type
        );
        activeEffectsRef.current.push(effect);
      }
    }
  }, []);

  const update = useCallback(() => {
    if (statusRef.current !== 'playing') return;

    const p = playerRef.current;
    const keys = keysRef.current;
    let moved = false;
    const now = Date.now();

    // Clean expired effects
    activeEffectsRef.current = activeEffectsRef.current.filter(e => e.endTime > now);

    const prevX = p.x;
    const prevY = p.y;

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

    // Crosswalk-only restriction: if player entered a road, must be on crosswalk
    const overpassRoadIdx = getOverpassRoadIdx(activeEffectsRef.current, now);
    const roadIdx = getPlayerRoadIdx(p.y, p.height);
    if (roadIdx >= 0 && roadIdx !== overpassRoadIdx) {
      if (!playerOnCrosswalk(p.x, p.width, crosswalksRef.current, roadIdx)) {
        p.x = prevX;
        p.y = prevY;
        moved = false;
        p.direction = 'idle';
      }
    }

    // Animate player legs
    tickRef.current++;
    if (moved && tickRef.current % 8 === 0) {
      p.animFrame = (p.animFrame + 1) % 4;
    }

    // Update cars with speed effect
    const speedMult = getCarSpeedMult(activeEffectsRef.current, now);
    for (const car of carsRef.current) {
      const spd = (car.baseSpeed ?? car.speed) * speedMult;
      if (car.direction === 'right') {
        car.x += spd;
        if (car.x > canvasWidth + 20) car.x = -car.width - 20;
      } else {
        car.x -= spd;
        if (car.x < -car.width - 20) car.x = canvasWidth + 20;
      }
    }

    // Check item pickup
    checkItemPickup();

    // Check car collision
    if (checkCollision()) {
      livesRef.current--;
      resetPlayer();

      if (livesRef.current <= 0) {
        statusRef.current = 'gameover';
        const elapsed = Math.floor((Date.now() - startTimeRef.current) / 1000);
        setGameState(prev => ({
          ...prev,
          status: 'gameover',
          elapsedTime: elapsed,
          lives: 0,
          activeEffects: [],
        }));
        return;
      }

      setGameState(prev => ({
        ...prev,
        lives: livesRef.current,
      }));
    }

    const activeEffects = [...activeEffectsRef.current];

    // Check win
    if (p.y + p.height < SCHOOL_Y + SCHOOL_HEIGHT && p.y > SCHOOL_Y - 10) {
      const elapsed = Math.floor((Date.now() - startTimeRef.current) / 1000);
      const score = Math.max(0, 1000 - elapsed * 10);
      statusRef.current = 'win';
      setGameState(prev => ({
        ...prev,
        status: 'win',
        elapsedTime: elapsed,
        score,
        activeEffects,
      }));
    } else {
      const elapsed = Math.floor((Date.now() - startTimeRef.current) / 1000);
      setGameState(prev => ({
        ...prev,
        elapsedTime: elapsed,
        lives: livesRef.current,
        activeEffects,
      }));
    }
  }, [canvasWidth, checkCollision, checkItemPickup, resetPlayer]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.key)) {
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

  const pressKey = useCallback(
    (key: string) => {
      keysRef.current.add(key);
      if (statusRef.current === 'idle') startGame();
    },
    [startGame]
  );

  const releaseKey = useCallback((key: string) => {
    keysRef.current.delete(key);
  }, []);

  return {
    gameState,
    playerRef,
    carsRef,
    crosswalksRef,
    itemsRef,
    activeEffectsRef,
    tickRef,
    startGame,
    continueGame,
    pressKey,
    releaseKey,
    update,
  };
}
