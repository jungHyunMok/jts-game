import { PlayerState } from './types';

export function drawPlayer(ctx: CanvasRenderingContext2D, p: PlayerState) {
  const { x, y, width, height, animFrame, direction } = p;
  const cx = x + width / 2;
  const legSwing = Math.sin((animFrame / 4) * Math.PI * 2) * 5;
  const isMoving = direction !== 'idle';
  const now = Date.now();
  const isInvincible = (p.invincibleUntil ?? 0) > now;

  ctx.save();

  // Ground shadow (ellipse under feet)
  ctx.fillStyle = 'rgba(0,0,0,0.18)';
  ctx.beginPath();
  ctx.ellipse(cx, y + height + 3, width / 2 + 2, 5, 0, 0, Math.PI * 2);
  ctx.fill();

  // Invincible aura
  if (isInvincible) {
    const pulse = 0.25 + Math.sin(now * 0.012) * 0.15;
    const aura = ctx.createRadialGradient(cx, y + height / 2, 4, cx, y + height / 2, height);
    aura.addColorStop(0, `rgba(255,215,0,${pulse})`);
    aura.addColorStop(1, 'rgba(255,215,0,0)');
    ctx.fillStyle = aura;
    ctx.beginPath();
    ctx.ellipse(cx, y + height / 2, width, height, 0, 0, Math.PI * 2);
    ctx.fill();
  }

  // === SHOES (bottom, drawn first for depth) ===
  // Left shoe - 3D
  ctx.fillStyle = '#1a1a1a';
  ctx.beginPath();
  ctx.roundRect(x + 3, y + height - 7, 11, 7, [0, 0, 3, 3]);
  ctx.fill();
  ctx.fillStyle = '#424242';
  ctx.fillRect(x + 4, y + height - 7, 5, 2);

  // Right shoe - 3D
  ctx.fillStyle = '#1a1a1a';
  ctx.beginPath();
  ctx.roundRect(x + width - 14, y + height - 7, 11, 7, [0, 0, 3, 3]);
  ctx.fill();
  ctx.fillStyle = '#424242';
  ctx.fillRect(x + width - 13, y + height - 7, 5, 2);

  // === LEGS ===
  const leftLegH = 13 + (isMoving ? legSwing : 0);
  const rightLegH = 13 - (isMoving ? legSwing : 0);

  // Left leg gradient
  const legGrad = ctx.createLinearGradient(x + 5, 0, x + 13, 0);
  legGrad.addColorStop(0, '#1565C0');
  legGrad.addColorStop(1, '#0D47A1');
  ctx.fillStyle = legGrad;
  ctx.beginPath();
  ctx.roundRect(x + 5, y + height - 18, 8, leftLegH, [2, 2, 0, 0]);
  ctx.fill();

  // Right leg gradient
  const legGrad2 = ctx.createLinearGradient(x + width - 14, 0, x + width - 6, 0);
  legGrad2.addColorStop(0, '#1565C0');
  legGrad2.addColorStop(1, '#0D47A1');
  ctx.fillStyle = legGrad2;
  ctx.beginPath();
  ctx.roundRect(x + width - 14, y + height - 18, 8, rightLegH, [2, 2, 0, 0]);
  ctx.fill();

  // === BACKPACK (behind body, right side) ===
  // Pack body
  const packGrad = ctx.createLinearGradient(x + width - 9, y + 13, x + width, y + 13);
  packGrad.addColorStop(0, '#C62828');
  packGrad.addColorStop(1, '#B71C1C');
  ctx.fillStyle = packGrad;
  ctx.beginPath();
  ctx.roundRect(x + width - 9, y + 13, 9, 17, [0, 3, 3, 0]);
  ctx.fill();
  // Pack highlight
  ctx.fillStyle = 'rgba(255,255,255,0.2)';
  ctx.fillRect(x + width - 8, y + 14, 3, 8);
  // Pack bottom pocket
  ctx.fillStyle = '#B71C1C';
  ctx.beginPath();
  ctx.roundRect(x + width - 8, y + 26, 7, 4, 2);
  ctx.fill();

  // === BODY (school uniform) ===
  const bodyGrad = ctx.createLinearGradient(x + 5, y + 13, x + width - 5, y + 13);
  bodyGrad.addColorStop(0, '#1A237E');
  bodyGrad.addColorStop(0.35, '#283593');
  bodyGrad.addColorStop(0.65, '#283593');
  bodyGrad.addColorStop(1, '#1A237E');
  ctx.fillStyle = bodyGrad;
  ctx.beginPath();
  ctx.roundRect(x + 5, y + 13, width - 10, height - 20, [3, 3, 0, 0]);
  ctx.fill();

  // Uniform collar
  ctx.fillStyle = '#FFFFFF';
  ctx.beginPath();
  ctx.moveTo(cx - 4, y + 13);
  ctx.lineTo(cx, y + 19);
  ctx.lineTo(cx + 4, y + 13);
  ctx.closePath();
  ctx.fill();

  // Uniform button
  ctx.fillStyle = '#BDBDBD';
  ctx.beginPath();
  ctx.arc(cx, y + 22, 1.5, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.arc(cx, y + 27, 1.5, 0, Math.PI * 2);
  ctx.fill();

  // === ARMS ===
  // Left arm
  const armGrad = ctx.createLinearGradient(x, 0, x + 8, 0);
  armGrad.addColorStop(0, '#1A237E');
  armGrad.addColorStop(1, '#283593');
  ctx.fillStyle = armGrad;
  ctx.beginPath();
  ctx.roundRect(x + 1, y + 14, 6, 13, 3);
  ctx.fill();
  // Left hand
  ctx.fillStyle = '#FFCC80';
  ctx.beginPath();
  ctx.arc(x + 4, y + 27, 3, 0, Math.PI * 2);
  ctx.fill();

  // Right arm
  ctx.fillStyle = armGrad;
  ctx.beginPath();
  ctx.roundRect(x + width - 7, y + 14, 6, 13, 3);
  ctx.fill();
  // Right hand
  ctx.fillStyle = '#FFCC80';
  ctx.beginPath();
  ctx.arc(x + width - 4, y + 27, 3, 0, Math.PI * 2);
  ctx.fill();

  // === NECK ===
  ctx.fillStyle = '#FFCC80';
  ctx.fillRect(cx - 3, y + 10, 6, 5);

  // === HEAD ===
  const headGrad = ctx.createRadialGradient(cx - 2, y + 6, 2, cx, y + 9, 10);
  headGrad.addColorStop(0, '#FFE0B2');
  headGrad.addColorStop(0.7, '#FFCC80');
  headGrad.addColorStop(1, '#E6A23C');
  ctx.fillStyle = headGrad;
  ctx.beginPath();
  ctx.arc(cx, y + 9, 10, 0, Math.PI * 2);
  ctx.fill();

  // Ears
  ctx.fillStyle = '#FFCC80';
  ctx.beginPath();
  ctx.arc(cx - 10, y + 10, 3, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.arc(cx + 10, y + 10, 3, 0, Math.PI * 2);
  ctx.fill();
  // Ear shadow
  ctx.fillStyle = '#E6A23C';
  ctx.beginPath();
  ctx.arc(cx - 10, y + 10, 2, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.arc(cx + 10, y + 10, 2, 0, Math.PI * 2);
  ctx.fill();

  // === HAIR ===
  const hairGrad = ctx.createLinearGradient(cx - 9, y, cx + 9, y + 7);
  hairGrad.addColorStop(0, '#5D4037');
  hairGrad.addColorStop(1, '#4E342E');
  ctx.fillStyle = hairGrad;
  ctx.beginPath();
  ctx.arc(cx, y + 9, 10, Math.PI, Math.PI * 2);
  ctx.fill();
  ctx.fillRect(cx - 10, y + 1, 20, 8);
  // Hair highlight
  ctx.fillStyle = 'rgba(255,255,255,0.1)';
  ctx.fillRect(cx - 5, y + 1, 8, 4);

  // === EYES ===
  // Eye whites
  ctx.fillStyle = '#FFFFFF';
  ctx.beginPath();
  ctx.ellipse(cx - 3, y + 9, 3.5, 3, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.ellipse(cx + 3, y + 9, 3.5, 3, 0, 0, Math.PI * 2);
  ctx.fill();

  // Pupils
  ctx.fillStyle = '#212121';
  ctx.beginPath();
  ctx.arc(cx - 2.5, y + 9.5, 2, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.arc(cx + 3.5, y + 9.5, 2, 0, Math.PI * 2);
  ctx.fill();

  // Eye shine
  ctx.fillStyle = 'rgba(255,255,255,0.9)';
  ctx.beginPath();
  ctx.arc(cx - 1.8, y + 8.5, 0.9, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.arc(cx + 4.2, y + 8.5, 0.9, 0, Math.PI * 2);
  ctx.fill();

  // Blush
  ctx.fillStyle = 'rgba(255,150,130,0.3)';
  ctx.beginPath();
  ctx.ellipse(cx - 6, y + 12, 2.5, 1.5, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.ellipse(cx + 6, y + 12, 2.5, 1.5, 0, 0, Math.PI * 2);
  ctx.fill();

  // === INVINCIBLE STARS ===
  if (isInvincible) {
    ctx.fillStyle = '#FFD700';
    ctx.font = 'bold 10px sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    const starAngle = (now * 0.004) % (Math.PI * 2);
    for (let i = 0; i < 4; i++) {
      const angle = starAngle + (i / 4) * Math.PI * 2;
      const sr = height / 2 + 10;
      const sx = cx + Math.cos(angle) * sr;
      const sy = y + height / 2 + Math.sin(angle) * sr;
      ctx.fillText('★', sx, sy);
    }
  }

  ctx.restore();
}
