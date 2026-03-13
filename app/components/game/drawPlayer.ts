import { PlayerState } from './types';

export function drawPlayer(ctx: CanvasRenderingContext2D, p: PlayerState) {
  const { x, y, width, height, animFrame, direction } = p;
  const cx = x + width / 2;
  const legSwing = Math.sin((animFrame / 4) * Math.PI * 2) * 4;

  ctx.save();

  // Shadow
  ctx.fillStyle = 'rgba(0,0,0,0.15)';
  ctx.ellipse(cx, y + height + 2, width / 2, 5, 0, 0, Math.PI * 2);
  ctx.fill();

  // Body (school uniform: navy)
  ctx.fillStyle = '#1A237E';
  ctx.fillRect(x + 6, y + 14, width - 12, height - 20);

  // Head
  ctx.fillStyle = '#FFCC80';
  ctx.beginPath();
  ctx.arc(cx, y + 9, 9, 0, Math.PI * 2);
  ctx.fill();

  // Hair
  ctx.fillStyle = '#4E342E';
  ctx.fillRect(cx - 9, y + 1, 18, 7);
  ctx.beginPath();
  ctx.arc(cx, y + 9, 9, Math.PI, Math.PI * 2);
  ctx.fill();

  // Eyes
  ctx.fillStyle = '#212121';
  ctx.fillRect(cx - 4, y + 7, 3, 3);
  ctx.fillRect(cx + 1, y + 7, 3, 3);

  // Bag (backpack)
  ctx.fillStyle = '#F44336';
  ctx.fillRect(x + width - 10, y + 14, 7, 14);

  // Legs
  ctx.fillStyle = '#0D47A1';
  // Left leg
  ctx.fillRect(x + 6, y + height - 14, 7, 10 + (direction !== 'idle' ? legSwing : 0));
  // Right leg
  ctx.fillRect(x + width - 13, y + height - 14, 7, 10 - (direction !== 'idle' ? legSwing : 0));

  // Shoes
  ctx.fillStyle = '#212121';
  ctx.fillRect(x + 5, y + height - 6, 9, 5);
  ctx.fillRect(x + width - 14, y + height - 6, 9, 5);

  ctx.restore();
}
