import { CANVAS_HEIGHT, CANVAS_WIDTH, CROSSWALK_WIDTH, HOME_HEIGHT, HOME_Y, ROAD_HEIGHT, ROADS, SCHOOL_HEIGHT, SCHOOL_Y } from './constants';

export function drawMap(ctx: CanvasRenderingContext2D, canvasWidth: number, crosswalks: number[][]) {
  // Background (grass)
  ctx.fillStyle = '#90EE90';
  ctx.fillRect(0, 0, canvasWidth, CANVAS_HEIGHT);

  // Roads
  ROADS.forEach((road, rIdx) => {
    // Road surface
    ctx.fillStyle = '#555';
    ctx.fillRect(0, road.y, canvasWidth, road.height);

    // Lane dividers
    ctx.strokeStyle = '#FFD700';
    ctx.lineWidth = 2;
    ctx.setLineDash([20, 15]);
    ctx.beginPath();
    ctx.moveTo(0, road.y + road.height / 2);
    ctx.lineTo(canvasWidth, road.y + road.height / 2);
    ctx.stroke();
    ctx.setLineDash([]);

    // Crosswalks (랜덤 위치, 1~3개)
    const positions = crosswalks[rIdx] ?? [canvasWidth / 2 - CROSSWALK_WIDTH / 2];
    const stripeW = 10;
    const stripeGap = 8;
    positions.forEach(cwX => {
      // 흰색 줄무늬
      ctx.fillStyle = 'rgba(255,255,255,0.92)';
      for (let sx = cwX; sx < cwX + CROSSWALK_WIDTH; sx += stripeW + stripeGap) {
        ctx.fillRect(sx, road.y, stripeW, road.height);
      }
      // 횡단보도 양쪽 노란 테두리 표시
      ctx.strokeStyle = '#FFD700';
      ctx.lineWidth = 2;
      ctx.setLineDash([]);
      ctx.strokeRect(cwX, road.y, CROSSWALK_WIDTH, road.height);
    });

    // Road edge lines
    ctx.strokeStyle = '#FFF';
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

  // School zone (top)
  drawSchool(ctx, canvasWidth);

  // Home zone (bottom)
  drawHome(ctx, canvasWidth);
}

function drawSchool(ctx: CanvasRenderingContext2D, canvasWidth: number) {
  // Ground
  ctx.fillStyle = '#E8F5E9';
  ctx.fillRect(0, SCHOOL_Y - 20, canvasWidth, SCHOOL_HEIGHT + 20);

  const cx = canvasWidth / 2;
  const sy = SCHOOL_Y + 5;

  // Main building
  ctx.fillStyle = '#F9A825';
  ctx.fillRect(cx - 55, sy, 110, 70);

  // Roof
  ctx.fillStyle = '#E53935';
  ctx.beginPath();
  ctx.moveTo(cx - 65, sy);
  ctx.lineTo(cx, sy - 30);
  ctx.lineTo(cx + 65, sy);
  ctx.closePath();
  ctx.fill();

  // Door
  ctx.fillStyle = '#5D4037';
  ctx.fillRect(cx - 12, sy + 40, 24, 30);

  // Windows
  ctx.fillStyle = '#81D4FA';
  ctx.fillRect(cx - 45, sy + 15, 24, 22);
  ctx.fillRect(cx + 21, sy + 15, 24, 22);

  // Flag pole
  ctx.strokeStyle = '#888';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(cx + 55, sy - 28);
  ctx.lineTo(cx + 55, sy - 55);
  ctx.stroke();
  ctx.fillStyle = '#F44336';
  ctx.fillRect(cx + 55, sy - 55, 20, 12);

  // Label
  ctx.fillStyle = '#1B5E20';
  ctx.font = 'bold 11px sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('인천백운초등학교', cx, SCHOOL_Y - 5);
}

function drawHome(ctx: CanvasRenderingContext2D, canvasWidth: number) {
  ctx.fillStyle = '#E8F5E9';
  ctx.fillRect(0, HOME_Y - 10, canvasWidth, HOME_HEIGHT + 10);

  const cx = canvasWidth / 2;
  const hy = HOME_Y + 5;

  // Building (apartment style)
  ctx.fillStyle = '#90CAF9';
  ctx.fillRect(cx - 50, hy, 100, 65);

  // Roof
  ctx.fillStyle = '#5C6BC0';
  ctx.fillRect(cx - 55, hy - 8, 110, 10);

  // Door
  ctx.fillStyle = '#5D4037';
  ctx.fillRect(cx - 10, hy + 38, 20, 27);

  // Windows grid
  ctx.fillStyle = '#E3F2FD';
  const wPositions = [-35, -10, 15];
  const wRows = [hy + 8, hy + 22];
  wPositions.forEach(wx => {
    wRows.forEach(wy => {
      ctx.fillRect(cx + wx, wy, 16, 12);
    });
  });

  // Label
  ctx.fillStyle = '#1B5E20';
  ctx.font = 'bold 10px sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('힐스테이트 부평', cx, HOME_Y - 2);
}
