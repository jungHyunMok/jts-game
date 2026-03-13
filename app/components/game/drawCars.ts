import { CarState } from './types';

export function drawCar(ctx: CanvasRenderingContext2D, car: CarState) {
  const { x, y, width, height, color, direction } = car;

  ctx.save();

  // Ground shadow
  ctx.fillStyle = 'rgba(0,0,0,0.25)';
  ctx.beginPath();
  ctx.ellipse(x + width / 2, y + height + 4, width / 2 - 2, 4, 0, 0, Math.PI * 2);
  ctx.fill();

  // 3D: bottom face
  const darkColor = darkenColor(color, 40);
  ctx.fillStyle = darkColor;
  ctx.beginPath();
  ctx.moveTo(x + 4, y + height);
  ctx.lineTo(x + width - 4, y + height);
  ctx.lineTo(x + width, y + height + 4);
  ctx.lineTo(x, y + height + 4);
  ctx.closePath();
  ctx.fill();

  // 3D: side face
  if (direction === 'right') {
    ctx.fillStyle = darkenColor(color, 25);
    ctx.beginPath();
    ctx.moveTo(x + width, y + 2);
    ctx.lineTo(x + width + 4, y - 2);
    ctx.lineTo(x + width + 4, y + height - 2);
    ctx.lineTo(x + width, y + height);
    ctx.closePath();
    ctx.fill();
  } else {
    ctx.fillStyle = darkenColor(color, 25);
    ctx.beginPath();
    ctx.moveTo(x, y + 2);
    ctx.lineTo(x - 4, y - 2);
    ctx.lineTo(x - 4, y + height - 2);
    ctx.lineTo(x, y + height);
    ctx.closePath();
    ctx.fill();
  }

  // Car body with gradient
  const bodyGrad = ctx.createLinearGradient(x, y, x, y + height);
  bodyGrad.addColorStop(0, lightenColor(color, 30));
  bodyGrad.addColorStop(0.5, color);
  bodyGrad.addColorStop(1, darkenColor(color, 20));
  ctx.fillStyle = bodyGrad;
  ctx.beginPath();
  ctx.roundRect(x, y, width, height, 5);
  ctx.fill();

  // Body highlight
  ctx.fillStyle = 'rgba(255,255,255,0.15)';
  ctx.beginPath();
  ctx.roundRect(x + 3, y + 2, width * 0.4, height * 0.4, 3);
  ctx.fill();

  // Roof 3D top surface
  const roofX = direction === 'right' ? x + width * 0.25 : x + width * 0.15;
  const roofW = width * 0.55;

  ctx.fillStyle = lightenColor(color, 15);
  ctx.beginPath();
  ctx.moveTo(roofX, y - 10);
  ctx.lineTo(roofX + roofW, y - 10);
  ctx.lineTo(roofX + roofW + 4, y - 14);
  ctx.lineTo(roofX + 4, y - 14);
  ctx.closePath();
  ctx.fill();

  const roofGrad = ctx.createLinearGradient(roofX, y - 10, roofX + roofW, y - 10);
  roofGrad.addColorStop(0, lightenColor(color, 25));
  roofGrad.addColorStop(1, lightenColor(color, 10));
  ctx.fillStyle = roofGrad;
  ctx.beginPath();
  ctx.roundRect(roofX, y - 10, roofW, 12, 4);
  ctx.fill();

  // Windshield
  ctx.fillStyle = 'rgba(173,216,230,0.85)';
  if (direction === 'right') {
    ctx.beginPath();
    ctx.roundRect(x + width * 0.62, y - 9, width * 0.14, 10, 2);
    ctx.fill();
    ctx.fillStyle = 'rgba(255,255,255,0.4)';
    ctx.fillRect(x + width * 0.63, y - 8, width * 0.05, 4);
  } else {
    ctx.beginPath();
    ctx.roundRect(x + width * 0.23, y - 9, width * 0.14, 10, 2);
    ctx.fill();
    ctx.fillStyle = 'rgba(255,255,255,0.4)';
    ctx.fillRect(x + width * 0.24, y - 8, width * 0.05, 4);
  }

  // Side windows
  ctx.fillStyle = 'rgba(135,206,235,0.75)';
  ctx.beginPath();
  ctx.roundRect(x + width * 0.29, y - 9, width * 0.28, 10, 2);
  ctx.fill();
  ctx.fillStyle = 'rgba(255,255,255,0.3)';
  ctx.fillRect(x + width * 0.31, y - 8, width * 0.08, 4);

  // Wheels
  const wheelPositions = [x + width * 0.2, x + width * 0.78];
  wheelPositions.forEach(wx => {
    ctx.fillStyle = '#1a1a1a';
    ctx.beginPath();
    ctx.arc(wx, y + height - 1, 8, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#9E9E9E';
    ctx.beginPath();
    ctx.arc(wx, y + height - 1, 5, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#E0E0E0';
    ctx.beginPath();
    ctx.arc(wx, y + height - 1, 2.5, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#757575';
    ctx.lineWidth = 1;
    for (let a = 0; a < Math.PI * 2; a += Math.PI / 3) {
      ctx.beginPath();
      ctx.moveTo(wx, y + height - 1);
      ctx.lineTo(wx + Math.cos(a) * 4, y + height - 1 + Math.sin(a) * 4);
      ctx.stroke();
    }
  });

  // Headlights / taillights
  if (direction === 'right') {
    ctx.fillStyle = '#FFFDE7';
    ctx.beginPath();
    ctx.roundRect(x + width - 5, y + 3, 5, 8, 2);
    ctx.fill();
    ctx.fillStyle = 'rgba(255,255,200,0.5)';
    ctx.beginPath();
    ctx.arc(x + width + 2, y + 7, 4, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#FF1744';
    ctx.beginPath();
    ctx.roundRect(x, y + 3, 5, 8, 2);
    ctx.fill();
  } else {
    ctx.fillStyle = '#FFFDE7';
    ctx.beginPath();
    ctx.roundRect(x, y + 3, 5, 8, 2);
    ctx.fill();
    ctx.fillStyle = 'rgba(255,255,200,0.5)';
    ctx.beginPath();
    ctx.arc(x - 2, y + 7, 4, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#FF1744';
    ctx.beginPath();
    ctx.roundRect(x + width - 5, y + 3, 5, 8, 2);
    ctx.fill();
  }

  // Body outline
  ctx.strokeStyle = darkenColor(color, 50);
  ctx.lineWidth = 0.5;
  ctx.setLineDash([]);
  ctx.beginPath();
  ctx.roundRect(x, y, width, height, 5);
  ctx.stroke();

  // ─── Brand emblem ───
  if (car.brand) {
    const r = Math.min(height * 0.3, 7);
    const ex = direction === 'right' ? x + width * 0.87 : x + width * 0.13;
    const ey = y + height * 0.42;
    drawEmblem(ctx, car.brand, ex, ey, r);
  }

  ctx.restore();
}

// ─── Emblem dispatcher ───────────────────────────────────────────────────────
function drawEmblem(
  ctx: CanvasRenderingContext2D,
  brand: string,
  cx: number,
  cy: number,
  r: number
) {
  ctx.save();
  // White backing plate for visibility on any car color
  ctx.fillStyle = 'rgba(245,245,245,0.95)';
  ctx.beginPath();
  ctx.arc(cx, cy, r + 1, 0, Math.PI * 2);
  ctx.fill();

  switch (brand) {
    case 'mercedes':    drawMercedes(ctx, cx, cy, r);    break;
    case 'bmw':         drawBMW(ctx, cx, cy, r);         break;
    case 'vw':          drawVW(ctx, cx, cy, r);          break;
    case 'kia':         drawKia(ctx, cx, cy, r);         break;
    case 'hyundai':     drawHyundai(ctx, cx, cy, r);     break;
    case 'ferrari':     drawFerrari(ctx, cx, cy, r);     break;
    case 'lamborghini': drawLamborghini(ctx, cx, cy, r); break;
    case 'genesis':     drawGenesis(ctx, cx, cy, r);     break;
    case 'audi':        drawAudi(ctx, cx, cy, r);        break;
    case 'porsche':     drawPorsche(ctx, cx, cy, r);     break;
  }
  ctx.restore();
}

// ─── Mercedes-Benz: silver circle + 3-pointed star ───────────────────────────
function drawMercedes(ctx: CanvasRenderingContext2D, cx: number, cy: number, r: number) {
  // Silver circle
  const grad = ctx.createRadialGradient(cx - r * 0.3, cy - r * 0.3, 0, cx, cy, r);
  grad.addColorStop(0, '#EEEEEE');
  grad.addColorStop(1, '#9E9E9E');
  ctx.fillStyle = grad;
  ctx.beginPath();
  ctx.arc(cx, cy, r, 0, Math.PI * 2);
  ctx.fill();

  // Outer ring
  ctx.strokeStyle = '#616161';
  ctx.lineWidth = r * 0.18;
  ctx.beginPath();
  ctx.arc(cx, cy, r * 0.82, 0, Math.PI * 2);
  ctx.stroke();

  // Three-pointed star (lines from center to outer ring)
  ctx.strokeStyle = '#424242';
  ctx.lineWidth = r * 0.18;
  ctx.lineCap = 'round';
  for (let i = 0; i < 3; i++) {
    const angle = (i / 3) * Math.PI * 2 - Math.PI / 2;
    ctx.beginPath();
    ctx.moveTo(cx, cy);
    ctx.lineTo(cx + Math.cos(angle) * r * 0.78, cy + Math.sin(angle) * r * 0.78);
    ctx.stroke();
  }
  ctx.lineCap = 'butt';
}

// ─── BMW: blue/white roundel ──────────────────────────────────────────────────
function drawBMW(ctx: CanvasRenderingContext2D, cx: number, cy: number, r: number) {
  // Black outer ring
  ctx.fillStyle = '#1a1a1a';
  ctx.beginPath();
  ctx.arc(cx, cy, r, 0, Math.PI * 2);
  ctx.fill();

  // Inner quarters: clip to inner circle
  ctx.save();
  ctx.beginPath();
  ctx.arc(cx, cy, r * 0.78, 0, Math.PI * 2);
  ctx.clip();

  // TL: blue (π → 3π/2)
  ctx.fillStyle = '#0066CC';
  ctx.beginPath();
  ctx.moveTo(cx, cy);
  ctx.arc(cx, cy, r, Math.PI, Math.PI * 1.5);
  ctx.closePath();
  ctx.fill();

  // TR: white (3π/2 → 2π)
  ctx.fillStyle = '#FFFFFF';
  ctx.beginPath();
  ctx.moveTo(cx, cy);
  ctx.arc(cx, cy, r, Math.PI * 1.5, Math.PI * 2);
  ctx.closePath();
  ctx.fill();

  // BR: blue (0 → π/2)
  ctx.fillStyle = '#0066CC';
  ctx.beginPath();
  ctx.moveTo(cx, cy);
  ctx.arc(cx, cy, r, 0, Math.PI * 0.5);
  ctx.closePath();
  ctx.fill();

  // BL: white (π/2 → π)
  ctx.fillStyle = '#FFFFFF';
  ctx.beginPath();
  ctx.moveTo(cx, cy);
  ctx.arc(cx, cy, r, Math.PI * 0.5, Math.PI);
  ctx.closePath();
  ctx.fill();

  ctx.restore();

  // White ring separator
  ctx.strokeStyle = '#FFFFFF';
  ctx.lineWidth = r * 0.18;
  ctx.beginPath();
  ctx.arc(cx, cy, r * 0.78, 0, Math.PI * 2);
  ctx.stroke();
}

// ─── Volkswagen: blue circle + VW letters ────────────────────────────────────
function drawVW(ctx: CanvasRenderingContext2D, cx: number, cy: number, r: number) {
  // Deep blue circle
  const grad = ctx.createRadialGradient(cx - r * 0.2, cy - r * 0.2, 0, cx, cy, r);
  grad.addColorStop(0, '#1E5BB5');
  grad.addColorStop(1, '#0D3B8E');
  ctx.fillStyle = grad;
  ctx.beginPath();
  ctx.arc(cx, cy, r, 0, Math.PI * 2);
  ctx.fill();

  // White ring
  ctx.strokeStyle = 'rgba(255,255,255,0.9)';
  ctx.lineWidth = r * 0.15;
  ctx.beginPath();
  ctx.arc(cx, cy, r * 0.82, 0, Math.PI * 2);
  ctx.stroke();

  // VW text
  ctx.fillStyle = '#FFFFFF';
  ctx.font = `bold ${r * 1.1}px Arial`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('VW', cx, cy + r * 0.05);
}

// ─── Kia: red oval + KIA ──────────────────────────────────────────────────────
function drawKia(ctx: CanvasRenderingContext2D, cx: number, cy: number, r: number) {
  // Red oval (slightly wider)
  const grad = ctx.createLinearGradient(cx - r, cy - r, cx + r, cy + r);
  grad.addColorStop(0, '#CC0000');
  grad.addColorStop(1, '#990000');
  ctx.fillStyle = grad;
  ctx.beginPath();
  ctx.ellipse(cx, cy, r * 1.25, r * 0.75, 0, 0, Math.PI * 2);
  ctx.fill();

  // Silver ring
  ctx.strokeStyle = 'rgba(200,200,200,0.8)';
  ctx.lineWidth = r * 0.12;
  ctx.beginPath();
  ctx.ellipse(cx, cy, r * 1.15, r * 0.65, 0, 0, Math.PI * 2);
  ctx.stroke();

  // KIA text
  ctx.fillStyle = '#FFFFFF';
  ctx.font = `bold ${r * 1.0}px Arial`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('KIA', cx, cy + r * 0.05);
}

// ─── Hyundai: silver oval + H ─────────────────────────────────────────────────
function drawHyundai(ctx: CanvasRenderingContext2D, cx: number, cy: number, r: number) {
  // Silver oval
  const grad = ctx.createLinearGradient(cx - r, cy - r, cx + r, cy + r);
  grad.addColorStop(0, '#BDBDBD');
  grad.addColorStop(1, '#757575');
  ctx.fillStyle = grad;
  ctx.beginPath();
  ctx.ellipse(cx, cy, r * 1.2, r * 0.8, 0, 0, Math.PI * 2);
  ctx.fill();

  // Stylized H (italic-like)
  ctx.fillStyle = '#1A237E';
  ctx.font = `bold italic ${r * 1.3}px Arial`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('H', cx, cy + r * 0.05);
}

// ─── Ferrari: yellow shield + prancing horse ─────────────────────────────────
function drawFerrari(ctx: CanvasRenderingContext2D, cx: number, cy: number, r: number) {
  // Yellow/gold shield
  ctx.fillStyle = '#FFD600';
  ctx.beginPath();
  ctx.moveTo(cx, cy + r * 0.95);       // bottom point
  ctx.lineTo(cx - r * 0.85, cy + r * 0.3);
  ctx.lineTo(cx - r * 0.85, cy - r * 0.95);
  ctx.lineTo(cx + r * 0.85, cy - r * 0.95);
  ctx.lineTo(cx + r * 0.85, cy + r * 0.3);
  ctx.closePath();
  ctx.fill();

  // Black border
  ctx.strokeStyle = '#212121';
  ctx.lineWidth = r * 0.12;
  ctx.stroke();

  // Prancing horse (simplified silhouette)
  ctx.fillStyle = '#212121';
  const s = r * 0.55; // scale
  // Body
  ctx.beginPath();
  ctx.ellipse(cx, cy, s * 0.45, s * 0.35, -0.3, 0, Math.PI * 2);
  ctx.fill();
  // Head
  ctx.beginPath();
  ctx.ellipse(cx + s * 0.4, cy - s * 0.45, s * 0.22, s * 0.18, 0.5, 0, Math.PI * 2);
  ctx.fill();
  // Neck
  ctx.beginPath();
  ctx.moveTo(cx + s * 0.2, cy - s * 0.1);
  ctx.lineTo(cx + s * 0.3, cy - s * 0.35);
  ctx.lineWidth = s * 0.22;
  ctx.strokeStyle = '#212121';
  ctx.lineCap = 'round';
  ctx.stroke();
  ctx.lineCap = 'butt';
  // Front legs (up)
  ctx.lineWidth = s * 0.14;
  ctx.beginPath();
  ctx.moveTo(cx + s * 0.2, cy + s * 0.2);
  ctx.lineTo(cx + s * 0.45, cy - s * 0.2);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(cx + s * 0.1, cy + s * 0.25);
  ctx.lineTo(cx + s * 0.25, cy - s * 0.15);
  ctx.stroke();
  // Rear legs
  ctx.beginPath();
  ctx.moveTo(cx - s * 0.3, cy + s * 0.15);
  ctx.lineTo(cx - s * 0.45, cy + s * 0.6);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(cx - s * 0.15, cy + s * 0.2);
  ctx.lineTo(cx - s * 0.3, cy + s * 0.65);
  ctx.stroke();
  // Tail
  ctx.beginPath();
  ctx.moveTo(cx - s * 0.35, cy);
  ctx.quadraticCurveTo(cx - s * 0.8, cy - s * 0.4, cx - s * 0.6, cy - s * 0.7);
  ctx.lineWidth = s * 0.12;
  ctx.stroke();
}

// ─── Lamborghini: black/gold shield + bull ────────────────────────────────────
function drawLamborghini(ctx: CanvasRenderingContext2D, cx: number, cy: number, r: number) {
  // Black shield
  ctx.fillStyle = '#1a1a1a';
  ctx.beginPath();
  ctx.moveTo(cx, cy + r * 0.95);
  ctx.lineTo(cx - r * 0.85, cy + r * 0.2);
  ctx.lineTo(cx - r * 0.85, cy - r * 0.95);
  ctx.lineTo(cx + r * 0.85, cy - r * 0.95);
  ctx.lineTo(cx + r * 0.85, cy + r * 0.2);
  ctx.closePath();
  ctx.fill();

  // Gold border
  ctx.strokeStyle = '#DAA520';
  ctx.lineWidth = r * 0.15;
  ctx.stroke();

  // Bull head (simplified)
  const s = r * 0.55;
  ctx.fillStyle = '#DAA520';
  // Bull head (circle)
  ctx.beginPath();
  ctx.arc(cx, cy + s * 0.05, s * 0.42, 0, Math.PI * 2);
  ctx.fill();
  // Snout
  ctx.beginPath();
  ctx.ellipse(cx, cy + s * 0.3, s * 0.28, s * 0.18, 0, 0, Math.PI * 2);
  ctx.fill();
  // Horns
  ctx.strokeStyle = '#DAA520';
  ctx.lineWidth = s * 0.18;
  ctx.lineCap = 'round';
  // Left horn
  ctx.beginPath();
  ctx.moveTo(cx - s * 0.3, cy - s * 0.25);
  ctx.quadraticCurveTo(cx - s * 0.65, cy - s * 0.7, cx - s * 0.3, cy - s * 0.85);
  ctx.stroke();
  // Right horn
  ctx.beginPath();
  ctx.moveTo(cx + s * 0.3, cy - s * 0.25);
  ctx.quadraticCurveTo(cx + s * 0.65, cy - s * 0.7, cx + s * 0.3, cy - s * 0.85);
  ctx.stroke();
  ctx.lineCap = 'butt';
  // Eyes
  ctx.fillStyle = '#1a1a1a';
  ctx.beginPath();
  ctx.arc(cx - s * 0.16, cy - s * 0.05, s * 0.08, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.arc(cx + s * 0.16, cy - s * 0.05, s * 0.08, 0, Math.PI * 2);
  ctx.fill();
  // Nostrils
  ctx.beginPath();
  ctx.arc(cx - s * 0.1, cy + s * 0.33, s * 0.06, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.arc(cx + s * 0.1, cy + s * 0.33, s * 0.06, 0, Math.PI * 2);
  ctx.fill();
}

// ─── Genesis: dark circle + gold G wings ─────────────────────────────────────
function drawGenesis(ctx: CanvasRenderingContext2D, cx: number, cy: number, r: number) {
  // Dark circle
  const grad = ctx.createRadialGradient(cx, cy, 0, cx, cy, r);
  grad.addColorStop(0, '#2C2C2C');
  grad.addColorStop(1, '#0D0D0D');
  ctx.fillStyle = grad;
  ctx.beginPath();
  ctx.arc(cx, cy, r, 0, Math.PI * 2);
  ctx.fill();

  // Gold ring
  ctx.strokeStyle = '#C5A028';
  ctx.lineWidth = r * 0.15;
  ctx.beginPath();
  ctx.arc(cx, cy, r * 0.82, 0, Math.PI * 2);
  ctx.stroke();

  // Wing shapes (left and right)
  ctx.fillStyle = '#C5A028';
  // Left wing
  ctx.beginPath();
  ctx.moveTo(cx - r * 0.15, cy);
  ctx.quadraticCurveTo(cx - r * 0.6, cy - r * 0.35, cx - r * 0.72, cy);
  ctx.quadraticCurveTo(cx - r * 0.6, cy + r * 0.15, cx - r * 0.15, cy + r * 0.1);
  ctx.closePath();
  ctx.fill();
  // Right wing
  ctx.beginPath();
  ctx.moveTo(cx + r * 0.15, cy);
  ctx.quadraticCurveTo(cx + r * 0.6, cy - r * 0.35, cx + r * 0.72, cy);
  ctx.quadraticCurveTo(cx + r * 0.6, cy + r * 0.15, cx + r * 0.15, cy + r * 0.1);
  ctx.closePath();
  ctx.fill();

  // G letter
  ctx.fillStyle = '#FFD700';
  ctx.font = `bold ${r * 1.05}px serif`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('G', cx, cy + r * 0.05);
}

// ─── Audi: four overlapping rings ────────────────────────────────────────────
function drawAudi(ctx: CanvasRenderingContext2D, cx: number, cy: number, r: number) {
  // White background
  ctx.fillStyle = '#FFFFFF';
  ctx.beginPath();
  ctx.arc(cx, cy, r, 0, Math.PI * 2);
  ctx.fill();

  const ringR = r * 0.42;
  const gap = ringR * 1.45;
  // 4 ring centers spread across the emblem
  const centers = [-1.5 * gap, -0.5 * gap, 0.5 * gap, 1.5 * gap];

  ctx.strokeStyle = '#9E9E9E';
  ctx.lineWidth = r * 0.18;

  // Clip to circle
  ctx.save();
  ctx.beginPath();
  ctx.arc(cx, cy, r * 0.95, 0, Math.PI * 2);
  ctx.clip();

  centers.forEach(offset => {
    ctx.beginPath();
    ctx.arc(cx + offset, cy, ringR, 0, Math.PI * 2);
    ctx.stroke();
  });

  ctx.restore();
}

// ─── Porsche: crest shield ───────────────────────────────────────────────────
function drawPorsche(ctx: CanvasRenderingContext2D, cx: number, cy: number, r: number) {
  // Shield outline
  ctx.fillStyle = '#F5F5F5';
  ctx.beginPath();
  ctx.moveTo(cx, cy + r * 0.95);
  ctx.lineTo(cx - r * 0.85, cy + r * 0.2);
  ctx.lineTo(cx - r * 0.85, cy - r * 0.95);
  ctx.lineTo(cx + r * 0.85, cy - r * 0.95);
  ctx.lineTo(cx + r * 0.85, cy + r * 0.2);
  ctx.closePath();
  ctx.fill();
  ctx.strokeStyle = '#424242';
  ctx.lineWidth = r * 0.12;
  ctx.stroke();

  // Cross dividers
  ctx.strokeStyle = '#424242';
  ctx.lineWidth = r * 0.1;
  ctx.setLineDash([]);
  // Horizontal
  ctx.beginPath();
  ctx.moveTo(cx - r * 0.85, cy - r * 0.2);
  ctx.lineTo(cx + r * 0.85, cy - r * 0.2);
  ctx.stroke();
  // Vertical
  ctx.beginPath();
  ctx.moveTo(cx, cy - r * 0.95);
  ctx.lineTo(cx, cy + r * 0.95);
  ctx.stroke();

  // Quadrant colors: TL red/black stripes, TR horse (gold), BL gold, BR red/black
  // TL quadrant - black/red stripes
  ctx.save();
  ctx.beginPath();
  ctx.rect(cx - r * 0.85, cy - r * 0.95, r * 0.85, r * 0.75);
  ctx.clip();
  const stripeColors = ['#CC0000', '#1a1a1a', '#CC0000', '#1a1a1a', '#CC0000'];
  stripeColors.forEach((c, i) => {
    ctx.fillStyle = c;
    ctx.fillRect(cx - r * 0.85 + i * (r * 0.85 / stripeColors.length), cy - r * 0.95, r * 0.85 / stripeColors.length, r * 0.75);
  });
  ctx.restore();

  // BR quadrant - black/red stripes
  ctx.save();
  ctx.beginPath();
  ctx.rect(cx, cy - r * 0.2, r * 0.85, r * 1.15);
  ctx.clip();
  stripeColors.forEach((c, i) => {
    ctx.fillStyle = c;
    ctx.fillRect(cx + i * (r * 0.85 / stripeColors.length), cy - r * 0.2, r * 0.85 / stripeColors.length, r * 1.15);
  });
  ctx.restore();

  // TR quadrant - gold horse
  ctx.fillStyle = '#DAA520';
  ctx.font = `${r * 0.7}px sans-serif`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('🐴', cx + r * 0.42, cy - r * 0.55);

  // BL quadrant - gold (antler)
  ctx.fillStyle = '#DAA520';
  ctx.fillRect(cx - r * 0.85, cy - r * 0.2, r * 0.85, r * 1.15);
  // Antler details
  ctx.fillStyle = '#1a1a1a';
  ctx.font = `bold ${r * 0.55}px serif`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('W', cx - r * 0.42, cy + r * 0.45);
}

// ─── Color helpers ────────────────────────────────────────────────────────────
function lightenColor(hex: string, amount: number): string {
  const num = parseInt(hex.replace('#', ''), 16);
  const r = Math.min(255, (num >> 16) + amount);
  const g = Math.min(255, ((num >> 8) & 0xff) + amount);
  const b = Math.min(255, (num & 0xff) + amount);
  return `rgb(${r},${g},${b})`;
}

function darkenColor(hex: string, amount: number): string {
  const num = parseInt(hex.replace('#', ''), 16);
  const r = Math.max(0, (num >> 16) - amount);
  const g = Math.max(0, ((num >> 8) & 0xff) - amount);
  const b = Math.max(0, (num & 0xff) - amount);
  return `rgb(${r},${g},${b})`;
}
