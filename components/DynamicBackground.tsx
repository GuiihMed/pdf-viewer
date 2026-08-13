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

    // Interactive mouse glow position
    let mouseX = width * 0.5;
    let mouseY = height * 0.3;

    const handleMouseMove = (e: MouseEvent) => {
      mouseX = e.clientX;
      mouseY = e.clientY;
    };
    window.addEventListener('mousemove', handleMouseMove);

    // Ambient floating Document/PDF Page outlines
    const documents = Array.from({ length: 18 }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      w: Math.random() * 40 + 50, // 50 - 90px width
      h: Math.random() * 50 + 70, // 70 - 120px height
      speedY: -(Math.random() * 0.3 + 0.1), // Slow upward drift
      speedX: (Math.random() - 0.5) * 0.15,
      rotation: (Math.random() - 0.5) * 0.4,
      rotationSpeed: (Math.random() - 0.5) * 0.002,
      opacity: Math.random() * 0.12 + 0.05,
    }));

    const render = () => {
      // 1. Deep Midnight Slate & Cyan Gradient Background (#080c14 -> #0d1527 -> #050810)
      const bgGrad = ctx.createLinearGradient(0, 0, width, height);
      bgGrad.addColorStop(0, '#080c14');
      bgGrad.addColorStop(0.5, '#0e172a');
      bgGrad.addColorStop(1, '#050810');
      ctx.fillStyle = bgGrad;
      ctx.fillRect(0, 0, width, height);

      // 2. Cursor Radial Light Glow
      const glowGrad = ctx.createRadialGradient(mouseX, mouseY, 0, mouseX, mouseY, 450);
      glowGrad.addColorStop(0, 'rgba(0, 163, 224, 0.12)');
      glowGrad.addColorStop(0.5, 'rgba(0, 119, 182, 0.04)');
      glowGrad.addColorStop(1, 'transparent');
      ctx.fillStyle = glowGrad;
      ctx.fillRect(0, 0, width, height);

      // 3. Crisp Subtle Isometric Dot Grid
      const spacing = 48;
      ctx.fillStyle = 'rgba(255, 255, 255, 0.07)';
      for (let x = 0; x < width; x += spacing) {
        for (let y = 0; y < height; y += spacing) {
          ctx.beginPath();
          ctx.arc(x, y, 1, 0, Math.PI * 2);
          ctx.fill();
        }
      }

      // 4. Floating PDF Document Cards (Representing PDF Viewer Concept)
      documents.forEach((doc) => {
        doc.y += doc.speedY;
        doc.x += doc.speedX;
        doc.rotation += doc.rotationSpeed;

        if (doc.y < -150) {
          doc.y = height + 50;
          doc.x = Math.random() * width;
        }

        ctx.save();
        ctx.translate(doc.x, doc.y);
        ctx.rotate(doc.rotation);

        // Document Outer Frame
        ctx.strokeStyle = `rgba(0, 163, 224, ${doc.opacity})`;
        ctx.lineWidth = 1.2;
        ctx.strokeRect(-doc.w / 2, -doc.h / 2, doc.w, doc.h);

        // Folded Corner (PDF style icon)
        const cornerSize = 12;
        ctx.beginPath();
        ctx.moveTo(doc.w / 2 - cornerSize, -doc.h / 2);
        ctx.lineTo(doc.w / 2, -doc.h / 2 + cornerSize);
        ctx.lineTo(doc.w / 2 - cornerSize, -doc.h / 2 + cornerSize);
        ctx.closePath();
        ctx.fillStyle = `rgba(0, 163, 224, ${doc.opacity * 0.8})`;
        ctx.fill();

        // Document Internal Text Lines
        ctx.strokeStyle = `rgba(255, 255, 255, ${doc.opacity * 0.6})`;
        ctx.lineWidth = 1;
        const lineSpacing = 8;
        let lineY = -doc.h / 2 + 20;
        while (lineY < doc.h / 2 - 12) {
          ctx.beginPath();
          ctx.moveTo(-doc.w / 2 + 10, lineY);
          ctx.lineTo(doc.w / 2 - (lineY === -doc.h / 2 + 20 ? 24 : 10), lineY);
          ctx.stroke();
          lineY += lineSpacing;
        }

        ctx.restore();
      });

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('mousemove', handleMouseMove);
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
