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
}

export interface CarState {
  id: number;
  x: number;
  y: number;
  width: number;
  height: number;
  speed: number;
  color: string;
  lane: number;
  direction: 'left' | 'right';
}

export interface RoadConfig {
  y: number;
  height: number;
  laneCount: number;
}

export interface GameState {
  status: 'idle' | 'playing' | 'dead' | 'win';
  elapsedTime: number;
  score: number;
}
