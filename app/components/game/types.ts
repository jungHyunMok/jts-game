export interface Position {
  x: number;
  y: number;
}

export interface PlayerState {
  x: number;
  y: number;
  width: number;
  height: number;
  speed: number;
  direction: 'up' | 'down' | 'left' | 'right' | 'idle';
  animFrame: number;
  invincibleUntil?: number; // timestamp ms (optional for backward compat)
}

export interface CarState {
  id: number;
  x: number;
  y: number;
  width: number;
  height: number;
  speed: number;
  baseSpeed?: number; // original speed (optional for backward compat)
  brand?: string;    // car brand emblem (optional for backward compat)
  color: string;
  lane: number;
  direction: 'left' | 'right';
}

export interface RoadConfig {
  y: number;
  height: number;
  laneCount: number;
}

export type EffectType = 'invincible' | 'overpass' | 'carSpeedUp' | 'carSpeedDown';

export interface ItemBox {
  id: number;
  x: number;
  y: number;
  width: number;
  height: number;
  type: EffectType;
  collected: boolean;
  animTick: number;
}

export interface ActiveEffect {
  type: EffectType;
  endTime: number;
  roadIndex?: number;
}

export interface GameState {
  status: 'idle' | 'playing' | 'dead' | 'win' | 'gameover';
  elapsedTime: number;
  score: number;
  lives: number;
  activeEffects: ActiveEffect[];
}
