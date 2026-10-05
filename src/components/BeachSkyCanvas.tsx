import React, { useEffect, useRef } from 'react';

interface Star {
  x: number;
  y: number;
  size: number;
  alpha: number;
  baseAlpha: number;
  speed: number;
  phase: number;
}

interface ShootingStar {
  x: number;
  y: number;
  length: number;
  speed: number;
  angle: number;
  alpha: number;
  active: boolean;
}

interface Ripple {
  x: number;
  y: number;
  radius: number;
  maxRadius: number;
  alpha: number;
  color: string;
}

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  alpha: number;
  size: number;
  color: string;
}

export const BeachSkyCanvas: React.FC<{ onBeachClick?: (x: number, y: number) => void }> = ({ onBeachClick }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
      initStars();
    };

    window.addEventListener('resize', handleResize);

    // Initialize stars
    let stars: Star[] = [];
    const initStars = () => {
      stars = [];
      const starCount = Math.floor((width * height) / 4500);
      for (let i = 0; i < starCount; i++) {
        const baseAlpha = 0.2 + Math.random() * 0.7;
        stars.push({
          x: Math.random() * width,
          y: Math.random() * (height * 0.65), // Stars mostly in upper 65%
          size: Math.random() < 0.9 ? Math.random() * 1.5 + 0.6 : Math.random() * 2.5 + 1.2,
          alpha: baseAlpha,
          baseAlpha,
          speed: 0.01 + Math.random() * 0.03,
          phase: Math.random() * Math.PI * 2,
        });
      }
    };

    initStars();

    // Shooting stars
    const shootingStars: ShootingStar[] = [];
    let nextShootingStarTime = Date.now() + 4000;

    const spawnShootingStar = () => {
      shootingStars.push({
        x: Math.random() * (width * 0.8),
        y: Math.random() * (height * 0.35),
        length: 80 + Math.random() * 70,
        speed: 12 + Math.random() * 8,
        angle: (Math.PI / 4) + (Math.random() * 0.2 - 0.1),
        alpha: 1,
        active: true,
      });
      nextShootingStarTime = Date.now() + 8000 + Math.random() * 9000;
    };

    // Ripples and Bioluminescent particles
    const ripples: Ripple[] = [];
    const particles: Particle[] = [];

    const addBioluminescence = (x: number, y: number) => {
      ripples.push({
        x,
        y,
        radius: 2,
        maxRadius: 40 + Math.random() * 30,
        alpha: 0.85,
        color: Math.random() > 0.4 ? 'rgba(34, 211, 238, ' : 'rgba(45, 212, 191, ',
      });

      // Spawn glowing plankton sparks
      for (let i = 0; i < 14; i++) {
        const angle = Math.random() * Math.PI * 2;
        const speed = 0.5 + Math.random() * 2;
        particles.push({
          x,
          y,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed,
          alpha: 0.9,
          size: 1 + Math.random() * 2,
          color: Math.random() > 0.5 ? '#22d3ee' : '#2dd4bf',
        });
      }
    };

    const handlePointerDown = (e: MouseEvent | TouchEvent) => {
      const rect = canvas.getBoundingClientRect();
      const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
      const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
      const x = clientX - rect.left;
      const y = clientY - rect.top;
      addBioluminescence(x, y);
      if (onBeachClick) {
        onBeachClick(x, y);
      }
    };

    canvas.addEventListener('mousedown', handlePointerDown);
    canvas.addEventListener('touchstart', handlePointerDown, { passive: true });

    // Animation Loop
    let time = 0;
    const render = () => {
      time += 0.02;
      ctx.clearRect(0, 0, width, height);

      // 1. Draw Stars
      for (let i = 0; i < stars.length; i++) {
        const star = stars[i];
        star.phase += star.speed;
        const currentAlpha = star.baseAlpha + Math.sin(star.phase) * 0.35;

        ctx.fillStyle = `rgba(224, 242, 254, ${Math.max(0.1, Math.min(1, currentAlpha))})`;
        ctx.beginPath();
        ctx.arc(star.x, star.y, star.size, 0, Math.PI * 2);
        ctx.fill();

        // Extra twinkle aura for larger stars
        if (star.size > 1.8) {
          ctx.fillStyle = `rgba(56, 189, 248, ${Math.max(0, currentAlpha * 0.25)})`;
          ctx.beginPath();
          ctx.arc(star.x, star.y, star.size * 2.4, 0, Math.PI * 2);
          ctx.fill();
        }
      }

      // 2. Shooting Stars
      if (Date.now() > nextShootingStarTime) {
        spawnShootingStar();
      }

      for (let i = shootingStars.length - 1; i >= 0; i--) {
        const ss = shootingStars[i];
        if (!ss.active) continue;

        const tailX = ss.x - Math.cos(ss.angle) * ss.length;
        const tailY = ss.y - Math.sin(ss.angle) * ss.length;

        const grad = ctx.createLinearGradient(tailX, tailY, ss.x, ss.y);
        grad.addColorStop(0, 'rgba(56, 189, 248, 0)');
        grad.addColorStop(0.7, `rgba(34, 211, 238, ${ss.alpha * 0.6})`);
        grad.addColorStop(1, `rgba(255, 255, 255, ${ss.alpha})`);

        ctx.strokeStyle = grad;
        ctx.lineWidth = 1.8;
        ctx.beginPath();
        ctx.moveTo(tailX, tailY);
        ctx.lineTo(ss.x, ss.y);
        ctx.stroke();

        ss.x += Math.cos(ss.angle) * ss.speed;
        ss.y += Math.sin(ss.angle) * ss.speed;
        ss.alpha -= 0.015;

        if (ss.alpha <= 0 || ss.x > width + 100 || ss.y > height) {
          shootingStars.splice(i, 1);
        }
      }

      // 3. Bioluminescent Ripples
      for (let i = ripples.length - 1; i >= 0; i--) {
        const r = ripples[i];
        r.radius += 0.8;
        r.alpha -= 0.018;

        if (r.alpha <= 0 || r.radius >= r.maxRadius) {
          ripples.splice(i, 1);
          continue;
        }

        ctx.save();
        ctx.strokeStyle = `${r.color}${r.alpha})`;
        ctx.lineWidth = 2.2;
        ctx.shadowColor = '#22d3ee';
        ctx.shadowBlur = 12;
        ctx.beginPath();
        ctx.arc(r.x, r.y, r.radius, 0, Math.PI * 2);
        ctx.stroke();
        ctx.restore();
      }

      // 4. Bioluminescent Sparks
      for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];
        p.x += p.vx;
        p.y += p.vy;
        p.alpha -= 0.022;

        if (p.alpha <= 0) {
          particles.splice(i, 1);
          continue;
        }

        ctx.save();
        ctx.fillStyle = p.color;
        ctx.globalAlpha = p.alpha;
        ctx.shadowColor = '#2dd4bf';
        ctx.shadowBlur = 8;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', handleResize);
      canvas.removeEventListener('mousedown', handlePointerDown);
      canvas.removeEventListener('touchstart', handlePointerDown);
    };
  }, [onBeachClick]);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-auto z-0"
      style={{ touchAction: 'none' }}
    />
  );
};
