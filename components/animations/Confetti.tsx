"use client";

import React, { useEffect, useRef, useImperativeHandle, forwardRef, useState } from "react";
import anime from "animejs";

export interface ConfettiRef {
  burst: () => void;
}

export const Confetti = forwardRef<ConfettiRef>((props, ref) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isActive, setIsActive] = useState(false);

  useImperativeHandle(ref, () => ({
    burst() {
      setIsActive(true);
    },
  }));

  useEffect(() => {
    if (!isActive || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Set canvas dimensions
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const colors = ["#E8A045", "#F5F0E8", "#D97706", "#FBBF24", "#FFFFFF"];
    const particles: any[] = [];
    const numParticles = 100;
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;

    // Initialize particles
    for (let i = 0; i < numParticles; i++) {
      particles.push({
        x: centerX,
        y: centerY,
        radius: anime.random(4, 9),
        color: colors[anime.random(0, colors.length - 1)],
        angle: anime.random(0, 360) * (Math.PI / 180),
        speed: anime.random(3, 14),
        alpha: 1,
        decay: anime.random(0.012, 0.025),
      });
    }

    let animFrameId: number;

    const render = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      let anyAlive = false;

      particles.forEach((p) => {
        if (p.alpha > 0) {
          anyAlive = true;
          // Apply physics
          p.x += Math.cos(p.angle) * p.speed;
          p.y += Math.sin(p.angle) * p.speed + 0.25; // gravity pull
          p.speed *= 0.975; // drag/friction
          p.alpha -= p.decay;
          p.radius = Math.max(0, p.radius * 0.985); // shrinking size

          ctx.save();
          ctx.globalAlpha = Math.max(0, p.alpha);
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
          ctx.fillStyle = p.color;
          ctx.fill();
          ctx.restore();
        }
      });

      if (anyAlive) {
        animFrameId = requestAnimationFrame(render);
      } else {
        setIsActive(false);
      }
    };

    render();

    const handleResize = () => {
      if (canvasRef.current) {
        canvasRef.current.width = window.innerWidth;
        canvasRef.current.height = window.innerHeight;
      }
    };

    window.addEventListener("resize", handleResize);

    return () => {
      cancelAnimationFrame(animFrameId);
      window.removeEventListener("resize", handleResize);
    };
  }, [isActive]);

  if (!isActive) return null;

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 w-full h-full pointer-events-none z-[999999]"
    />
  );
});

Confetti.displayName = "Confetti";
