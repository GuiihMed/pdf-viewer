'use client';
import React, { useEffect, useRef } from 'react';

export function InteractiveBackground() {
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
    };
    window.addEventListener('resize', handleResize);

    // Interactive Shockwaves on click
    const shockwaves: Array<{ x: number; y: number; radius: number; maxRadius: number; alpha: number }> = [];

    const handlePointerDown = (e: MouseEvent | TouchEvent) => {
      const clientX = 'touches' in e ? e.touches[0].clientX : (e as MouseEvent).clientX;
      const clientY = 'touches' in e ? e.touches[0].clientY : (e as MouseEvent).clientY;
      shockwaves.push({
        x: clientX,
        y: clientY,
        radius: 10,
        maxRadius: Math.max(width, height) * 0.4,
        alpha: 0.8,
      });
    };

    window.addEventListener('mousedown', handlePointerDown);
    window.addEventListener('touchstart', handlePointerDown, { passive: true });

    // Floating particles
    const particlesCount = Math.min(Math.floor((width * height) / 18000), 50);
    const particles = Array.from({ length: particlesCount }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      size: Math.random() * 2 + 1,
      speedX: (Math.random() - 0.5) * 0.4,
      speedY: (Math.random() - 0.5) * 0.4,
      alpha: Math.random() * 0.6 + 0.2,
    }));

    // Autonomous 3D Wireframe Icosahedron Geometry
    const numVertices = 12;
    const phi = (1 + Math.sqrt(5)) / 2;
    const baseVertices = [
      [-1, phi, 0], [1, phi, 0], [-1, -phi, 0], [1, -phi, 0],
      [0, -1, phi], [0, 1, phi], [0, -1, -phi], [0, 1, -phi],
      [phi, 0, -1], [phi, 0, 1], [-phi, 0, -1], [-phi, 0, 1]
    ];
    
    // Scale vertices
    const scale = Math.min(width, height) * 0.18;
    const vertices = baseVertices.map(v => [v[0] * scale, v[1] * scale, v[2] * scale]);

    const edges = [
      [0,1], [0,5], [0,7], [0,10], [0,11],
      [1,5], [1,7], [1,8], [1,9],
      [2,3], [2,4], [2,6], [2,10], [2,11],
      [3,4], [3,6], [3,8], [3,9],
      [4,5], [4,9], [4,11],
      [5,9], [5,11],
      [6,7], [6,8], [6,10],
      [7,8], [7,10],
      [8,9], [10,11]
    ];

    let angleX = 0;
    let angleY = 0;
    let waveTime = 0;

    const render = () => {
      // Clear with dark teal deep gradient background (#032b3d -> #064963 -> #021e2c)
      const bgGrad = ctx.createLinearGradient(0, 0, width, height);
      bgGrad.addColorStop(0, '#032b3d');
      bgGrad.addColorStop(0.5, '#064963');
      bgGrad.addColorStop(1, '#021e2c');
      ctx.fillStyle = bgGrad;
      ctx.fillRect(0, 0, width, height);

      // 1. Draw Grid Dots & Plus Marks
      const gridSpacing = 60;
      ctx.fillStyle = 'rgba(255, 255, 255, 0.25)';
      for (let x = gridSpacing; x < width; x += gridSpacing) {
        for (let y = gridSpacing; y < height; y += gridSpacing) {
          if ((x / gridSpacing + y / gridSpacing) % 3 === 0) {
            // Plus mark
            ctx.strokeStyle = 'rgba(0, 195, 255, 0.45)';
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(x - 3, y);
            ctx.lineTo(x + 3, y);
            ctx.moveTo(x, y - 3);
            ctx.lineTo(x, y + 3);
            ctx.stroke();
          } else {
            // Dot mark
            ctx.beginPath();
            ctx.arc(x, y, 1.2, 0, Math.PI * 2);
            ctx.fill();
          }
        }
      }

      // 2. Draw Topographic Sine Wave Lines
      waveTime += 0.015;
      ctx.strokeStyle = 'rgba(0, 195, 255, 0.25)';
      ctx.lineWidth = 1.5;
      const waveLinesCount = 4;
      for (let i = 0; i < waveLinesCount; i++) {
        ctx.beginPath();
        const baseOffsetY = height * 0.4 + i * 70;
        for (let x = 0; x <= width; x += 15) {
          const y = baseOffsetY + Math.sin(x * 0.004 + waveTime + i * 0.8) * 35 + Math.cos(x * 0.002 - waveTime) * 20;
          if (x === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        ctx.stroke();
      }

      // 4. Render Floating Particles
      ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
      particles.forEach((p) => {
        p.x += p.speedX;
        p.y += p.speedY;

        if (p.x < 0) p.x = width;
        if (p.x > width) p.x = 0;
        if (p.y < 0) p.y = height;
        if (p.y > height) p.y = 0;

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
      });

      // 5. Render Interactive Click Shockwaves
      for (let i = shockwaves.length - 1; i >= 0; i--) {
        const sw = shockwaves[i];
        sw.radius += 8;
        sw.alpha -= 0.015;

        if (sw.alpha <= 0 || sw.radius >= sw.maxRadius) {
          shockwaves.splice(i, 1);
          continue;
        }

        ctx.strokeStyle = `rgba(0, 195, 255, ${sw.alpha})`;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(sw.x, sw.y, sw.radius, 0, Math.PI * 2);
        ctx.stroke();
      }

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('mousedown', handlePointerDown);
      window.removeEventListener('touchstart', handlePointerDown);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        pointerEvents: 'none',
        zIndex: 0,
      }}
    />
  );
}
