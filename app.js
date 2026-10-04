/**
 * Celebration Party Popper Engine
 * Monochromatic / Gray Shades Only
 * Features:
 * - Multi-stage explosive cannon bursts (corners + center)
 * - 4 distinct confetti shapes: fluttering flakes, twisting streamers, discs, and diamond stars
 * - Realistic air dynamics, 3D tumble physics, and sinusoidal drift
 * - Automatic blast on load/reload, interactive pop on button clicks
 */

(function () {
  'use strict';

  const canvas = document.getElementById('popper-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');

  let width = 0;
  let height = 0;
  let dpr = window.devicePixelRatio || 1;

  function resize() {
    dpr = window.devicePixelRatio || 1;
    width = window.innerWidth;
    height = window.innerHeight;
    canvas.width = Math.floor(width * dpr);
    canvas.height = Math.floor(height * dpr);
    canvas.style.width = width + 'px';
    canvas.style.height = height + 'px';
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.scale(dpr, dpr);
  }

  resize();
  window.addEventListener('resize', resize);

  // Strictly Monochromatic Palette - Deep Charcoal to Pale Slate
  const GRAY_PALETTE = [
    '#111827', // Deep charcoal
    '#1f2937', // Dark slate
    '#374151', // Graphite
    '#4b5563', // Slate gray (matches hero theme)
    '#6b7280', // Cool mid-gray
    '#9ca3af', // Light silver gray
    '#cbd5e1', // Soft silver
    '#e2e8f0', // Pale smoke
    '#f1f5f9', // Near-white accent
  ];

  class ConfettiParticle {
    constructor(originX, originY, angleDeg, velocity) {
      this.x = originX;
      this.y = originY;

      const angleRad = (angleDeg * Math.PI) / 180;
      this.vx = Math.cos(angleRad) * velocity;
      this.vy = -Math.sin(angleRad) * velocity;

      this.color = GRAY_PALETTE[Math.floor(Math.random() * GRAY_PALETTE.length)];

      // 4 Particle Types: Flake (rectangle), Streamer (ribbon), Disc (circle), Star (diamond)
      const randType = Math.random();
      if (randType < 0.35) {
        this.type = 'flake';
        this.w = Math.random() * 8 + 7;
        this.h = Math.random() * 7 + 5;
      } else if (randType < 0.65) {
        this.type = 'streamer';
        this.w = Math.random() * 4 + 3.5;
        this.h = Math.random() * 18 + 12;
      } else if (randType < 0.85) {
        this.type = 'disc';
        this.radius = Math.random() * 3.5 + 2.5;
      } else {
        this.type = 'star';
        this.radius = Math.random() * 5 + 4;
      }

      // Rotation & 3D Wobble
      this.rotation = Math.random() * Math.PI * 2;
      this.rotSpeed = (Math.random() - 0.5) * 0.25;
      this.wobble = Math.random() * Math.PI * 2;
      this.wobbleSpeed = Math.random() * 0.14 + 0.06;
      this.swayRate = Math.random() * 1.5 + 0.5;

      // Physics
      this.gravity = 0.22 + Math.random() * 0.16;
      this.drag = 0.978;
      this.opacity = 1;
      this.decay = Math.random() * 0.003 + 0.0022;
    }

    update() {
      this.vx *= this.drag;
      this.vy = this.vy * this.drag + this.gravity;

      // Gentle horizontal air current sway
      this.x += this.vx + Math.sin(this.wobble) * this.swayRate;
      this.y += this.vy;

      this.rotation += this.rotSpeed;
      this.wobble += this.wobbleSpeed;
      this.opacity -= this.decay;

      return this.opacity > 0 && this.y < height + 80;
    }

    draw(context) {
      context.save();
      context.translate(this.x, this.y);
      context.rotate(this.rotation);
      context.scale(1, Math.cos(this.wobble)); // 3D paper flutter
      context.globalAlpha = Math.max(0, Math.min(1, this.opacity));
      context.fillStyle = this.color;

      if (this.type === 'flake') {
        context.fillRect(-this.w / 2, -this.h / 2, this.w, this.h);
      } else if (this.type === 'streamer') {
        // Streamer ribbon with curved appearance
        context.beginPath();
        context.moveTo(-this.w / 2, -this.h / 2);
        context.quadraticCurveTo(this.w / 2, 0, -this.w / 2, this.h / 2);
        context.lineTo(this.w / 2, this.h / 2);
        context.quadraticCurveTo(-this.w / 2, 0, this.w / 2, -this.h / 2);
        context.closePath();
        context.fill();
      } else if (this.type === 'disc') {
        context.beginPath();
        context.arc(0, 0, this.radius, 0, Math.PI * 2);
        context.fill();
      } else if (this.type === 'star') {
        // 4-point diamond star glint
        context.beginPath();
        context.moveTo(0, -this.radius);
        context.lineTo(this.radius * 0.35, 0);
        context.lineTo(0, this.radius);
        context.lineTo(-this.radius * 0.35, 0);
        context.closePath();
        context.fill();
      }

      context.restore();
    }
  }

  let particles = [];
  let animId = null;

  function burst(x, y, count, baseAngle, spread, minSpeed, maxSpeed) {
    for (let i = 0; i < count; i++) {
      const angle = baseAngle + (Math.random() - 0.5) * spread;
      const speed = minSpeed + Math.random() * (maxSpeed - minSpeed);
      particles.push(new ConfettiParticle(x, y, angle, speed));
    }
  }

  function launchPartyPopper() {
    // Wave 1 (Immediate explosive blast from both bottom corners)
    burst(width * 0.05, height * 0.98, 90, 58, 48, 18, 30);
    burst(width * 0.95, height * 0.98, 90, 122, 48, 18, 30);

    // Wave 2 (+160ms: High arc cross-cannons)
    setTimeout(() => {
      burst(width * 0.15, height * 0.95, 60, 68, 40, 16, 26);
      burst(width * 0.85, height * 0.95, 60, 112, 40, 16, 26);
      if (!animId) animate();
    }, 160);

    // Wave 3 (+320ms: Celebratory mid-screen explosion showering down over content)
    setTimeout(() => {
      burst(width * 0.5, height * 0.65, 80, 90, 110, 12, 24);
      if (!animId) animate();
    }, 320);

    if (!animId) animate();
  }

  function animate() {
    ctx.clearRect(0, 0, width, height);

    for (let i = particles.length - 1; i >= 0; i--) {
      const p = particles[i];
      if (p.update()) {
        p.draw(ctx);
      } else {
        particles.splice(i, 1);
      }
    }

    if (particles.length > 0) {
      animId = requestAnimationFrame(animate);
    } else {
      ctx.clearRect(0, 0, width, height);
      animId = null;
    }
  }

  // Trigger automatically on load / reload
  if (document.readyState === 'complete' || document.readyState === 'interactive') {
    setTimeout(launchPartyPopper, 200);
  } else {
    window.addEventListener('DOMContentLoaded', () => {
      setTimeout(launchPartyPopper, 200);
    });
  }

  // Also trigger when clicking either pill button for fun
  const buttons = document.querySelectorAll('.btn-pill');
  buttons.forEach(btn => {
    btn.addEventListener('click', () => {
      launchPartyPopper();
    });
  });

})();
