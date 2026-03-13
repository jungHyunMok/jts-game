export const CANVAS_WIDTH = 480;
export const CANVAS_HEIGHT = 800;

export const PLAYER_WIDTH = 28;
export const PLAYER_HEIGHT = 36;
export const PLAYER_SPEED = 3;

export const ROAD_HEIGHT = 80;
export const SIDEWALK_HEIGHT = 40;
export const CROSSWALK_WIDTH = 60;

// Y positions from top: school zone at top, home at bottom
export const SCHOOL_Y = 60;
export const SCHOOL_HEIGHT = 100;
export const HOME_Y = CANVAS_HEIGHT - 100;
export const HOME_HEIGHT = 80;

// Road segments (top to bottom)
export const ROADS: { y: number; height: number; label: string }[] = [
  { y: 200, height: ROAD_HEIGHT, label: 'road1' },
  { y: 360, height: ROAD_HEIGHT, label: 'road2' },
  { y: 520, height: ROAD_HEIGHT, label: 'road3' },
];

export const CAR_COLORS = ['#E74C3C', '#3498DB', '#F39C12', '#9B59B6', '#1ABC9C', '#E67E22'];

export const PLAYER_START_X = CANVAS_WIDTH / 2 - PLAYER_WIDTH / 2;
export const PLAYER_START_Y = HOME_Y - PLAYER_HEIGHT - 8;

export const INITIAL_LIVES = 5;
export const ITEM_SIZE = 32;
export const EFFECT_DURATION = 6000; // 6 seconds
export const SPEED_BOOST_MULT = 2.5;
export const SPEED_SLOW_MULT = 0.4;
export const RESPAWN_INVINCIBLE_MS = 2000; // 2 seconds invincibility after respawn
