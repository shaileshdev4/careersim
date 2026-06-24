"use client";

import { useEffect, useRef } from "react";
import { Theme } from "./theme";

type Phase = string | null;

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  r: number;
  a: number;
}

function phaseTint(phase: Phase): { speed: number; alpha: number } {
  switch (phase) {
    case "dawn":
      return { speed: 0.85, alpha: 0.55 };
    case "morning":
      return { speed: 1, alpha: 0.65 };
    case "midday":
      return { speed: 1.05, alpha: 0.7 };
    case "afternoon":
      return { speed: 0.95, alpha: 0.6 };
    case "evening":
      return { speed: 0.72, alpha: 0.45 };
    default:
      return { speed: 1, alpha: 0.6 };
  }
}

function hexToRgb(hex: string): [number, number, number] {
  const n = parseInt(hex.replace("#", ""), 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}

/**
 * Phase 3 - canvas particle field during the simulator.
 * Speed and brightness follow energy + beat phase; respects reduced motion.
 */
export function ParticleCanvas({
  theme,
  energy = 100,
  phase = null,
  active = false,
}: {
  theme: Theme;
  energy?: number;
  phase?: Phase;
  active?: boolean;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const particlesRef = useRef<Particle[]>([]);
  const frameRef = useRef(0);
  const propsRef = useRef({ theme, energy, phase, active });

  propsRef.current = { theme, energy, phase, active };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const reduced = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const count = 42;

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.floor(window.innerWidth * dpr);
      canvas.height = Math.floor(window.innerHeight * dpr);
      canvas.style.width = `${window.innerWidth}px`;
      canvas.style.height = `${window.innerHeight}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      if (particlesRef.current.length === 0) {
        particlesRef.current = Array.from({ length: count }, () => ({
          x: Math.random() * window.innerWidth,
          y: Math.random() * window.innerHeight,
          vx: (Math.random() - 0.5) * 0.35,
          vy: (Math.random() - 0.5) * 0.35,
          r: 1.2 + Math.random() * 2.2,
          a: 0.15 + Math.random() * 0.35,
        }));
      }
    };

    resize();
    window.addEventListener("resize", resize);

    const drawStatic = () => {
      const { theme: t, energy: e, phase: ph } = propsRef.current;
      const [r, g, b] = hexToRgb(t.accent);
      const { alpha } = phaseTint(ph);
      const energyFactor = 0.35 + (e / 100) * 0.65;
      ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);
      for (const p of particlesRef.current) {
        ctx.beginPath();
        ctx.fillStyle = `rgba(${r},${g},${b},${p.a * alpha * energyFactor * 0.85})`;
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fill();
      }
    };

    if (reduced) {
      drawStatic();
      return () => window.removeEventListener("resize", resize);
    }

    const tick = () => {
      const { theme: t, energy: e, phase: ph, active: on } = propsRef.current;
      if (!on) {
        ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);
        frameRef.current = requestAnimationFrame(tick);
        return;
      }

      const [r, g, b] = hexToRgb(t.accent);
      const { speed, alpha } = phaseTint(ph);
      const tempoBoost = 0.65 + t.tempo * 0.7;
      const energyFactor = 0.3 + (e / 100) * 0.85;
      const drift = speed * tempoBoost * energyFactor;

      ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);

      for (const p of particlesRef.current) {
        p.x += p.vx * drift;
        p.y += p.vy * drift;

        if (p.x < -20) p.x = window.innerWidth + 20;
        if (p.x > window.innerWidth + 20) p.x = -20;
        if (p.y < -20) p.y = window.innerHeight + 20;
        if (p.y > window.innerHeight + 20) p.y = -20;

        const glow = p.a * alpha * energyFactor;
        ctx.beginPath();
        ctx.fillStyle = `rgba(${r},${g},${b},${glow})`;
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fill();

        ctx.beginPath();
        ctx.fillStyle = `rgba(${r},${g},${b},${glow * 0.25})`;
        ctx.arc(p.x, p.y, p.r * 3.2, 0, Math.PI * 2);
        ctx.fill();
      }

      frameRef.current = requestAnimationFrame(tick);
    };

    frameRef.current = requestAnimationFrame(tick);

    return () => {
      window.removeEventListener("resize", resize);
      cancelAnimationFrame(frameRef.current);
    };
  }, []);

  if (!active) return null;

  return <canvas ref={canvasRef} className="live-bg__particles" aria-hidden />;
}
