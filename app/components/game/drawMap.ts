import {
  CANVAS_HEIGHT,
  CANVAS_WIDTH,
  CROSSWALK_WIDTH,
  HOME_HEIGHT,
  HOME_Y,
  ROAD_HEIGHT,
  ROADS,
  SCHOOL_HEIGHT,
  SCHOOL_Y,
} from './constants';
import { ItemBox } from './types';

export function drawMap(
  ctx: CanvasRenderingContext2D,
  canvasWidth: number,
  crosswalks: number[][],
  items?: ItemBox[],
  tick?: number
) {
  // === BACKGROUND (grass) ===
  const grassGrad = ctx.createLinearGradient(0, 0, 0, CANVAS_HEIGHT);
  grassGrad.addColorStop(0, '#66BB6A');
  grassGrad.addColorStop(0.5, '#81C784');
  grassGrad.addColorStop(1, '#66BB6A');
  ctx.fillStyle = grassGrad;
  ctx.fillRect(0, 0, canvasWidth, CANVAS_HEIGHT);

  // Grass texture dots
  ctx.fillStyle = 'rgba(0,100,0,0.06)';
  for (let gx = 10; gx < canvasWidth; gx += 30) {
    for (let gy = SCHOOL_Y + SCHOOL_HEIGHT; gy < CANVAS_HEIGHT; gy += 30) {
      if (!isInRoadY(gy) && !isInRoadY(gy + 15)) {
        ctx.beginPath();
        ctx.arc(gx, gy, 3, 0, Math.PI * 2);
        ctx.fill();
      }
    }
  }

  // === SIDEWALKS ===
  const sidewalkColor = '#C8BCA0';
  const sidewalkDark = '#B8A888';

  // Between school and road 1
  drawSidewalk(ctx, canvasWidth, SCHOOL_Y + SCHOOL_HEIGHT, ROADS[0].y, sidewalkColor, sidewalkDark);
  // Between roads
  for (let i = 0; i < ROADS.length - 1; i++) {
    drawSidewalk(
      ctx,
      canvasWidth,
      ROADS[i].y + ROADS[i].height,
      ROADS[i + 1].y,
      sidewalkColor,
      sidewalkDark
    );
  }
  // Between last road and home
  drawSidewalk(
    ctx,
    canvasWidth,
    ROADS[ROADS.length - 1].y + ROADS[ROADS.length - 1].height,
    HOME_Y,
    sidewalkColor,
    sidewalkDark
  );

  // === ROADS ===
  ROADS.forEach((road, rIdx) => {
    // Road surface gradient (asphalt)
    const roadGrad = ctx.createLinearGradient(0, road.y, 0, road.y + road.height);
    roadGrad.addColorStop(0, '#5A5A5A');
    roadGrad.addColorStop(0.5, '#484848');
    roadGrad.addColorStop(1, '#3C3C3C');
    ctx.fillStyle = roadGrad;
    ctx.fillRect(0, road.y, canvasWidth, road.height);

    // Asphalt texture
    ctx.fillStyle = 'rgba(255,255,255,0.03)';
    for (let tx = 0; tx < canvasWidth; tx += 40) {
      ctx.fillRect(tx, road.y, 20, road.height);
    }

    // Lane dividers
    ctx.strokeStyle = '#FFD700';
    ctx.lineWidth = 2;
    ctx.setLineDash([20, 15]);
    ctx.beginPath();
    ctx.moveTo(0, road.y + road.height / 2);
    ctx.lineTo(canvasWidth, road.y + road.height / 2);
    ctx.stroke();
    ctx.setLineDash([]);

    // Crosswalks
    const positions = crosswalks[rIdx] ?? [canvasWidth / 2 - CROSSWALK_WIDTH / 2];
    positions.forEach(cwX => {
      // Crosswalk shadow
      ctx.fillStyle = 'rgba(0,0,0,0.12)';
      ctx.fillRect(cwX + 4, road.y + 4, CROSSWALK_WIDTH, road.height);

      // White stripes
      ctx.fillStyle = 'rgba(255,255,255,0.93)';
      const stripeW = 10;
      const stripeGap = 8;
      for (let sx = cwX; sx < cwX + CROSSWALK_WIDTH; sx += stripeW + stripeGap) {
        ctx.fillRect(sx, road.y, stripeW, road.height);
      }

      // Yellow border
      ctx.strokeStyle = '#FFD700';
      ctx.lineWidth = 2;
      ctx.setLineDash([]);
      ctx.strokeRect(cwX, road.y, CROSSWALK_WIDTH, road.height);

      // Corner markers (traffic bollards)
      [cwX, cwX + CROSSWALK_WIDTH].forEach(bx => {
        [road.y, road.y + road.height].forEach(by => {
          ctx.fillStyle = '#FFF176';
          ctx.beginPath();
          ctx.arc(bx, by, 4, 0, Math.PI * 2);
          ctx.fill();
          ctx.fillStyle = '#F9A825';
          ctx.beginPath();
          ctx.arc(bx, by, 2.5, 0, Math.PI * 2);
          ctx.fill();
        });
      });

      // "횡단보도" sign (pedestrian crossing sign)
      ctx.fillStyle = '#FFEB3B';
      ctx.font = 'bold 8px sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('보행자', cwX + CROSSWALK_WIDTH / 2, road.y - 6);
    });

    // Road edge lines
    ctx.strokeStyle = '#FFFFFF';
    ctx.lineWidth = 2;
    ctx.setLineDash([]);
    ctx.beginPath();
    ctx.moveTo(0, road.y);
    ctx.lineTo(canvasWidth, road.y);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(0, road.y + road.height);
    ctx.lineTo(canvasWidth, road.y + road.height);
    ctx.stroke();
  });

  // === BUILDINGS ===
  drawSchool3D(ctx, canvasWidth);
  drawHome3D(ctx, canvasWidth);

  // === ITEMS ===
  if (items && tick !== undefined) {
    items.forEach(item => {
      if (!item.collected) drawItemBox(ctx, item, tick);
    });
  }
}

// Draw overpass separately so it renders on top of cars
export function drawOverpass(
  ctx: CanvasRenderingContext2D,
  canvasWidth: number,
  roadIndex: number,
  endTime: number
) {
  if (roadIndex < 0 || roadIndex >= ROADS.length) return;
  const road = ROADS[roadIndex];
  const now = Date.now();
  const remaining = (endTime - now) / 6000;
  const alpha = Math.min(1, remaining * 4);

  ctx.save();
  ctx.globalAlpha = alpha;

  // Bridge deck surface
  const deckGrad = ctx.createLinearGradient(0, road.y - 8, 0, road.y + road.height + 8);
  deckGrad.addColorStop(0, '#8D6E63');
  deckGrad.addColorStop(0.5, '#795548');
  deckGrad.addColorStop(1, '#6D4C41');
  ctx.fillStyle = deckGrad;
  ctx.beginPath();
  ctx.roundRect(0, road.y - 8, canvasWidth, road.height + 16, 4);
  ctx.fill();

  // Bridge planks
  ctx.strokeStyle = 'rgba(93,64,55,0.6)';
  ctx.lineWidth = 2;
  for (let bx = 0; bx < canvasWidth; bx += 18) {
    ctx.beginPath();
    ctx.moveTo(bx, road.y - 8);
    ctx.lineTo(bx, road.y + road.height + 8);
    ctx.stroke();
  }

  // Top railing
  ctx.fillStyle = '#FDD835';
  ctx.fillRect(0, road.y - 12, canvasWidth, 6);
  // Bottom railing
  ctx.fillRect(0, road.y + road.height + 6, canvasWidth, 6);

  // Railing posts
  for (let px = 20; px < canvasWidth; px += 50) {
    ctx.fillStyle = '#F9A825';
    ctx.fillRect(px - 3, road.y - 20, 6, 14);
    ctx.fillRect(px - 3, road.y + road.height + 6, 6, 14);
  }

  // Overpass label
  ctx.fillStyle = '#FFFFFF';
  ctx.font = 'bold 15px sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('🌉 육교', canvasWidth / 2, road.y + road.height / 2);

  // Countdown bar
  const barW = canvasWidth * 0.6;
  ctx.fillStyle = 'rgba(0,0,0,0.3)';
  ctx.fillRect(canvasWidth / 2 - barW / 2, road.y + road.height / 2 + 12, barW, 6);
  ctx.fillStyle = '#FFEB3B';
  ctx.fillRect(
    canvasWidth / 2 - barW / 2,
    road.y + road.height / 2 + 12,
    barW * remaining,
    6
  );

  ctx.restore();
}

function isInRoadY(y: number): boolean {
  return ROADS.some(road => y >= road.y && y <= road.y + road.height);
}

function drawSidewalk(
  ctx: CanvasRenderingContext2D,
  canvasWidth: number,
  y1: number,
  y2: number,
  color: string,
  darkColor: string
) {
  if (y2 <= y1) return;
  ctx.fillStyle = color;
  ctx.fillRect(0, y1, canvasWidth, y2 - y1);

  // Sidewalk tile pattern
  ctx.strokeStyle = darkColor;
  ctx.lineWidth = 0.5;
  const tileSize = 30;
  ctx.setLineDash([]);
  for (let tx = 0; tx < canvasWidth; tx += tileSize) {
    ctx.beginPath();
    ctx.moveTo(tx, y1);
    ctx.lineTo(tx, y2);
    ctx.stroke();
  }
  for (let ty = y1; ty < y2; ty += tileSize) {
    ctx.beginPath();
    ctx.moveTo(0, ty);
    ctx.lineTo(canvasWidth, ty);
    ctx.stroke();
  }
}

function drawSchool3D(ctx: CanvasRenderingContext2D, canvasWidth: number) {
  ctx.fillStyle = '#E8F5E9';
  ctx.fillRect(0, SCHOOL_Y - 20, canvasWidth, SCHOOL_HEIGHT + 20);

  const cx = canvasWidth / 2;
  const sy = SCHOOL_Y + 5;
  const bW = 120;
  const bH = 72;
  const depth = 12;

  // 3D shadow
  ctx.fillStyle = 'rgba(0,0,0,0.12)';
  ctx.fillRect(cx - bW / 2 + depth + 4, sy + 4, bW, bH);

  // Right wall (3D depth)
  ctx.fillStyle = '#C68400';
  ctx.beginPath();
  ctx.moveTo(cx + bW / 2, sy);
  ctx.lineTo(cx + bW / 2 + depth, sy - depth);
  ctx.lineTo(cx + bW / 2 + depth, sy + bH - depth);
  ctx.lineTo(cx + bW / 2, sy + bH);
  ctx.closePath();
  ctx.fill();

  // Top wall (3D)
  ctx.fillStyle = '#B8780A';
  ctx.beginPath();
  ctx.moveTo(cx - bW / 2, sy);
  ctx.lineTo(cx + bW / 2, sy);
  ctx.lineTo(cx + bW / 2 + depth, sy - depth);
  ctx.lineTo(cx - bW / 2 + depth, sy - depth);
  ctx.closePath();
  ctx.fill();

  // Main building face with gradient
  const buildGrad = ctx.createLinearGradient(cx - bW / 2, sy, cx + bW / 2, sy + bH);
  buildGrad.addColorStop(0, '#FBC02D');
  buildGrad.addColorStop(0.5, '#F9A825');
  buildGrad.addColorStop(1, '#E6960C');
  ctx.fillStyle = buildGrad;
  ctx.fillRect(cx - bW / 2, sy, bW, bH);

  // Building horizontal floor lines
  ctx.strokeStyle = 'rgba(0,0,0,0.1)';
  ctx.lineWidth = 1;
  ctx.setLineDash([]);
  for (let fl = 1; fl < 3; fl++) {
    ctx.beginPath();
    ctx.moveTo(cx - bW / 2, sy + (bH / 3) * fl);
    ctx.lineTo(cx + bW / 2, sy + (bH / 3) * fl);
    ctx.stroke();
  }

  // Roof back (3D)
  ctx.fillStyle = '#B71C1C';
  ctx.beginPath();
  ctx.moveTo(cx - bW / 2 - 10 + depth, sy - depth);
  ctx.lineTo(cx + depth, sy - 32 - depth);
  ctx.lineTo(cx + bW / 2 + 10 + depth, sy - depth);
  ctx.lineTo(cx + bW / 2 + 10, sy);
  ctx.lineTo(cx, sy - 32);
  ctx.lineTo(cx - bW / 2 - 10, sy);
  ctx.closePath();
  ctx.fill();

  // Roof front
  const roofGrad = ctx.createLinearGradient(cx, sy - 32, cx, sy);
  roofGrad.addColorStop(0, '#EF5350');
  roofGrad.addColorStop(1, '#C62828');
  ctx.fillStyle = roofGrad;
  ctx.beginPath();
  ctx.moveTo(cx - bW / 2 - 10, sy);
  ctx.lineTo(cx, sy - 32);
  ctx.lineTo(cx + bW / 2 + 10, sy);
  ctx.closePath();
  ctx.fill();

  // Roof highlight
  ctx.fillStyle = 'rgba(255,255,255,0.18)';
  ctx.beginPath();
  ctx.moveTo(cx - 30, sy - 5);
  ctx.lineTo(cx, sy - 30);
  ctx.lineTo(cx + 5, sy - 27);
  ctx.lineTo(cx - 25, sy - 2);
  ctx.closePath();
  ctx.fill();

  // Door 3D
  ctx.fillStyle = '#3E2723';
  ctx.fillRect(cx - 13 + depth / 3, sy + bH - 31 - depth / 3, 26, 31);
  const doorGrad = ctx.createLinearGradient(cx - 13, sy + bH - 31, cx + 13, sy + bH - 31);
  doorGrad.addColorStop(0, '#5D4037');
  doorGrad.addColorStop(0.5, '#6D4C41');
  doorGrad.addColorStop(1, '#5D4037');
  ctx.fillStyle = doorGrad;
  ctx.beginPath();
  ctx.roundRect(cx - 13, sy + bH - 31, 26, 31, [4, 4, 0, 0]);
  ctx.fill();
  // Door glass
  ctx.fillStyle = 'rgba(173,216,230,0.5)';
  ctx.fillRect(cx - 9, sy + bH - 28, 8, 18);
  ctx.fillRect(cx + 1, sy + bH - 28, 8, 18);
  // Door handle
  ctx.fillStyle = '#FFD700';
  ctx.beginPath();
  ctx.arc(cx + 8, sy + bH - 17, 2.5, 0, Math.PI * 2);
  ctx.fill();

  // Windows (3D)
  const winData = [cx - bW / 2 + 10, cx + bW / 2 - 34];
  winData.forEach(wx => {
    // Window depth
    ctx.fillStyle = '#B8780A';
    ctx.fillRect(wx + 2, sy + 14 + 2, 22, 22);
    // Frame
    ctx.fillStyle = '#5D4037';
    ctx.fillRect(wx, sy + 14, 22, 22);
    // Glass
    const glassGrad = ctx.createLinearGradient(wx + 2, sy + 16, wx + 20, sy + 34);
    glassGrad.addColorStop(0, '#B3E5FC');
    glassGrad.addColorStop(1, '#81D4FA');
    ctx.fillStyle = glassGrad;
    ctx.fillRect(wx + 2, sy + 16, 18, 18);
    // Glass reflection
    ctx.fillStyle = 'rgba(255,255,255,0.55)';
    ctx.fillRect(wx + 3, sy + 17, 7, 6);
    // Pane divider
    ctx.strokeStyle = '#5D4037';
    ctx.lineWidth = 1;
    ctx.setLineDash([]);
    ctx.beginPath();
    ctx.moveTo(wx + 11, sy + 16);
    ctx.lineTo(wx + 11, sy + 34);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(wx + 2, sy + 25);
    ctx.lineTo(wx + 20, sy + 25);
    ctx.stroke();
  });

  // Flag pole
  ctx.strokeStyle = '#9E9E9E';
  ctx.lineWidth = 2;
  ctx.setLineDash([]);
  ctx.beginPath();
  ctx.moveTo(cx + bW / 2 + 5, sy - 30);
  ctx.lineTo(cx + bW / 2 + 5, sy - 60);
  ctx.stroke();
  // Flag
  ctx.fillStyle = '#EF5350';
  ctx.fillRect(cx + bW / 2 + 5, sy - 60, 22, 14);
  ctx.fillStyle = '#FFFFFF';
  ctx.fillRect(cx + bW / 2 + 5, sy - 60, 22, 5);

  // School label
  ctx.fillStyle = '#1B5E20';
  ctx.font = 'bold 12px sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'alphabetic';
  ctx.fillText('인천백운초등학교', cx, SCHOOL_Y - 6);
}

function drawHome3D(ctx: CanvasRenderingContext2D, canvasWidth: number) {
  ctx.fillStyle = '#E8F5E9';
  ctx.fillRect(0, HOME_Y - 10, canvasWidth, HOME_HEIGHT + 10);

  const cx = canvasWidth / 2;
  const hy = HOME_Y + 5;
  const bW = 110;
  const bH = 65;
  const depth = 12;

  // 3D shadow
  ctx.fillStyle = 'rgba(0,0,0,0.12)';
  ctx.fillRect(cx - bW / 2 + depth + 4, hy + 4, bW, bH);

  // Right wall (3D)
  ctx.fillStyle = '#5472A0';
  ctx.beginPath();
  ctx.moveTo(cx + bW / 2, hy - 10);
  ctx.lineTo(cx + bW / 2 + depth, hy - 10 - depth);
  ctx.lineTo(cx + bW / 2 + depth, hy + bH - depth);
  ctx.lineTo(cx + bW / 2, hy + bH);
  ctx.closePath();
  ctx.fill();

  // Roof 3D top
  ctx.fillStyle = '#3949AB';
  ctx.beginPath();
  ctx.moveTo(cx - bW / 2 - 5, hy - 10 - depth);
  ctx.lineTo(cx + bW / 2 + 5 + depth, hy - 10 - depth);
  ctx.lineTo(cx + bW / 2 + 5, hy - 10);
  ctx.lineTo(cx - bW / 2 - 5, hy - 10);
  ctx.closePath();
  ctx.fill();

  // Roof front
  const roofGrad = ctx.createLinearGradient(cx - bW / 2, hy - 10, cx + bW / 2, hy - 10);
  roofGrad.addColorStop(0, '#5C6BC0');
  roofGrad.addColorStop(1, '#7986CB');
  ctx.fillStyle = roofGrad;
  ctx.fillRect(cx - bW / 2 - 5, hy - 10, bW + 10, 12);

  // Building face gradient
  const homeGrad = ctx.createLinearGradient(cx - bW / 2, hy, cx + bW / 2, hy + bH);
  homeGrad.addColorStop(0, '#90CAF9');
  homeGrad.addColorStop(0.5, '#64B5F6');
  homeGrad.addColorStop(1, '#42A5F5');
  ctx.fillStyle = homeGrad;
  ctx.fillRect(cx - bW / 2, hy, bW, bH);

  // Floor lines
  ctx.strokeStyle = 'rgba(0,0,0,0.08)';
  ctx.lineWidth = 1;
  ctx.setLineDash([]);
  for (let fl = 1; fl < 3; fl++) {
    ctx.beginPath();
    ctx.moveTo(cx - bW / 2, hy + (bH / 3) * fl);
    ctx.lineTo(cx + bW / 2, hy + (bH / 3) * fl);
    ctx.stroke();
  }

  // Door 3D
  ctx.fillStyle = '#3E2723';
  ctx.fillRect(cx - 11 + depth / 3, hy + bH - 28 - depth / 3, 22, 28);
  const doorGrad = ctx.createLinearGradient(cx - 11, hy + bH - 28, cx + 11, hy + bH - 28);
  doorGrad.addColorStop(0, '#5D4037');
  doorGrad.addColorStop(1, '#4E342E');
  ctx.fillStyle = doorGrad;
  ctx.beginPath();
  ctx.roundRect(cx - 11, hy + bH - 28, 22, 28, [3, 3, 0, 0]);
  ctx.fill();
  ctx.fillStyle = 'rgba(173,216,230,0.45)';
  ctx.fillRect(cx - 8, hy + bH - 25, 7, 14);
  ctx.fillRect(cx + 1, hy + bH - 25, 7, 14);
  ctx.fillStyle = '#FFD700';
  ctx.beginPath();
  ctx.arc(cx + 8, hy + bH - 14, 2, 0, Math.PI * 2);
  ctx.fill();

  // Windows grid 3D
  const wPositions = [-38, -13, 12];
  const wRows = [hy + 8, hy + 24];
  wPositions.forEach(wx => {
    wRows.forEach(wy => {
      // Window depth
      ctx.fillStyle = '#5472A0';
      ctx.fillRect(cx + wx + 1, wy + 1, 18, 13);
      // Window frame
      ctx.fillStyle = '#1565C0';
      ctx.fillRect(cx + wx, wy, 18, 13);
      // Glass
      const winGrad = ctx.createLinearGradient(cx + wx + 2, wy + 2, cx + wx + 16, wy + 11);
      winGrad.addColorStop(0, '#E3F2FD');
      winGrad.addColorStop(1, '#BBDEFB');
      ctx.fillStyle = winGrad;
      ctx.fillRect(cx + wx + 2, wy + 2, 14, 9);
      // Reflection
      ctx.fillStyle = 'rgba(255,255,255,0.65)';
      ctx.fillRect(cx + wx + 3, wy + 3, 5, 3);
      // Pane
      ctx.strokeStyle = '#1565C0';
      ctx.lineWidth = 0.5;
      ctx.beginPath();
      ctx.moveTo(cx + wx + 9, wy + 2);
      ctx.lineTo(cx + wx + 9, wy + 11);
      ctx.stroke();
    });
  });

  // Home label
  ctx.fillStyle = '#1B5E20';
  ctx.font = 'bold 11px sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'alphabetic';
  ctx.fillText('힐스테이트 부평', cx, HOME_Y - 2);
}

const ITEM_ICONS: Record<string, string> = {
  invincible: '🛡',
  overpass: '🌉',
  carSpeedUp: '⚡',
  carSpeedDown: '🐢',
};

function drawItemBox(ctx: CanvasRenderingContext2D, item: ItemBox, tick: number) {
  const { x, y, width, height, type } = item;
  const bounce = Math.sin(tick * 0.07) * 3;
  const cy = y + bounce;

  ctx.save();

  // Shadow
  ctx.fillStyle = 'rgba(0,0,0,0.18)';
  ctx.beginPath();
  ctx.ellipse(x + width / 2, y + height + 5, width / 2, 4, 0, 0, Math.PI * 2);
  ctx.fill();

  // 3D box - bottom face
  ctx.fillStyle = '#5D3A1A';
  ctx.beginPath();
  ctx.moveTo(x, cy + height);
  ctx.lineTo(x + width, cy + height);
  ctx.lineTo(x + width + 5, cy + height + 5);
  ctx.lineTo(x + 5, cy + height + 5);
  ctx.closePath();
  ctx.fill();

  // 3D box - right face
  ctx.fillStyle = '#7B4A20';
  ctx.beginPath();
  ctx.moveTo(x + width, cy);
  ctx.lineTo(x + width + 5, cy - 5);
  ctx.lineTo(x + width + 5, cy + height + 5);
  ctx.lineTo(x + width, cy + height);
  ctx.closePath();
  ctx.fill();

  // 3D box - top face
  ctx.fillStyle = '#C68400';
  ctx.beginPath();
  ctx.moveTo(x, cy);
  ctx.lineTo(x + width, cy);
  ctx.lineTo(x + width + 5, cy - 5);
  ctx.lineTo(x + 5, cy - 5);
  ctx.closePath();
  ctx.fill();

  // Main box face
  const boxGrad = ctx.createLinearGradient(x, cy, x + width, cy + height);
  boxGrad.addColorStop(0, '#FFD740');
  boxGrad.addColorStop(0.4, '#FFA000');
  boxGrad.addColorStop(1, '#E65100');
  ctx.fillStyle = boxGrad;
  ctx.beginPath();
  ctx.roundRect(x, cy, width, height, 3);
  ctx.fill();

  // Box shine
  ctx.fillStyle = 'rgba(255,255,255,0.25)';
  ctx.beginPath();
  ctx.roundRect(x + 2, cy + 2, width * 0.45, height * 0.4, 2);
  ctx.fill();

  // Cross pattern
  ctx.strokeStyle = '#8B4513';
  ctx.lineWidth = 2;
  ctx.setLineDash([]);
  ctx.beginPath();
  ctx.moveTo(x + width / 2, cy + 3);
  ctx.lineTo(x + width / 2, cy + height - 3);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(x + 3, cy + height / 2);
  ctx.lineTo(x + width - 3, cy + height / 2);
  ctx.stroke();

  // Big "?" in center
  ctx.fillStyle = '#FFFFFF';
  ctx.font = `bold ${Math.floor(width * 0.55)}px sans-serif`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.shadowColor = 'rgba(0,0,0,0.3)';
  ctx.shadowBlur = 3;
  ctx.fillText('?', x + width / 2, cy + height / 2 + 1);
  ctx.shadowBlur = 0;

  // Type icon (small)
  ctx.font = '10px sans-serif';
  ctx.textBaseline = 'top';
  ctx.fillText(ITEM_ICONS[type] ?? '?', x + width - 10, cy + 2);

  ctx.restore();
}
