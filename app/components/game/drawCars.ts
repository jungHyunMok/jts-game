import { CarState } from './types';

export function drawCar(ctx: CanvasRenderingContext2D, car: CarState) {
  const { x, y, width, height, color, direction } = car;

  ctx.save();

  // Shadow
  ctx.fillStyle = 'rgba(0,0,0,0.2)';
  ctx.fillRect(x + 3, y + height - 2, width - 6, 5);

  // Car body
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.roundRect(x, y, width, height, 5);
  ctx.fill();

  // Roof
  ctx.fillStyle = lightenColor(color, 20);
  const roofX = direction === 'right' ? x + width * 0.25 : x + width * 0.15;
  ctx.beginPath();
  ctx.roundRect(roofX, y - 10, width * 0.55, 13, 4);
  ctx.fill();

  // Windshield (front)
  ctx.fillStyle = 'rgba(173,216,230,0.8)';
  if (direction === 'right') {
    ctx.fillRect(x + width * 0.62, y - 9, width * 0.15, 11);
  } else {
    ctx.fillRect(x + width * 0.22, y - 9, width * 0.15, 11);
  }

  // Windows
  ctx.fillStyle = 'rgba(135,206,235,0.7)';
  ctx.fillRect(x + width * 0.28, y - 9, width * 0.3, 11);

  // Wheels
  ctx.fillStyle = '#212121';
  ctx.beginPath();
  ctx.arc(x + width * 0.22, y + height, 7, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.arc(x + width * 0.78, y + height, 7, 0, Math.PI * 2);
  ctx.fill();

  // Wheel shine
  ctx.fillStyle = '#616161';
  ctx.beginPath();
  ctx.arc(x + width * 0.22, y + height, 3.5, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.arc(x + width * 0.78, y + height, 3.5, 0, Math.PI * 2);
  ctx.fill();

  // Headlights / taillights
  if (direction === 'right') {
    ctx.fillStyle = '#FFFF88';
    ctx.fillRect(x + width - 5, y + 4, 5, 7);
    ctx.fillStyle = '#FF4444';
    ctx.fillRect(x, y + 4, 5, 7);
  } else {
    ctx.fillStyle = '#FFFF88';
    ctx.fillRect(x, y + 4, 5, 7);
    ctx.fillStyle = '#FF4444';
    ctx.fillRect(x + width - 5, y + 4, 5, 7);
  }

  ctx.restore();
}

function lightenColor(hex: string, amount: number): string {
  const num = parseInt(hex.replace('#', ''), 16);
  const r = Math.min(255, (num >> 16) + amount);
  const g = Math.min(255, ((num >> 8) & 0xff) + amount);
  const b = Math.min(255, (num & 0xff) + amount);
  return `rgb(${r},${g},${b})`;
}
