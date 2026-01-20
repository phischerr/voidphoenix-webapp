"use client";
import React, { useEffect, useMemo, useRef } from "react";

type Props = { enabled?: boolean };

export default function EmberFX({ enabled = true }: Props) {
  const ref = useRef<HTMLCanvasElement | null>(null);
  const prefersReduced = useMemo(() => {
    if (typeof window === "undefined") return false;
    return window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches ?? false;
  }, []);

  useEffect(() => {
    if (!enabled || prefersReduced) return;

    const canvas = ref.current!;
    const ctx = canvas.getContext("2d", { alpha: true })!;
    let raf = 0;
    let w = 0, h = 0;
    const DPR = Math.min(window.devicePixelRatio || 1, 2);

    const sparks = Array.from({ length: 70 }, () => ({
      x: Math.random(), y: 1 + Math.random() * 0.2,
      vx: (Math.random() - 0.5) * 0.00015,
      vy: 0.00025 + Math.random() *  0.00035,
      life: 0.35 + Math.random() * 0.9,
      size: 0.6 + Math.random() * 1.2,
      hue: 18 + Math.random() * 30,
      a: 0.10 + Math.random() * 0.18,
    }));

    const resize = () => {
      w = Math.floor(window.innerWidth);
      h = Math.floor(window.innerHeight);
      canvas.width = Math.floor(w * DPR);
      canvas.height = Math.floor(h * DPR);
      canvas.style.width = w + "px";
      canvas.style.height = h + "px";
      ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
    };
    resize();
    window.addEventListener("resize", resize);

    const tick = () => {
      ctx.clearRect(0, 0, w, h);

      // faint glow overlay
      ctx.globalCompositeOperation = "lighter";

      for (const s of sparks) {
        // rise
        s.x += s.vx;
        s.y -= s.vy;
        s.life -= 0.0022;

        const px = s.x * w;
        const py = s.y * h;

        if (s.life <= 0 || py < -30 || px < -30 || px > w + 30) {
          s.x = Math.random();
          s.y = 1.05 + Math.random() * 0.2;
          s.vx = (Math.random() - 0.5) * 0.00018;
          s.vy = 0.00028 + Math.random() * 0.00038;
          s.life = 0.35 + Math.random() * 0.95;
          s.size = 0.6 + Math.random() * 1.3;
          s.hue = 18 + Math.random() * 30;
          s.a = 0.10 + Math.random() * 0.18;
        }

        const alpha = Math.max(0, Math.min(1, s.life)) * s.a;
        ctx.fillStyle = `hsla(${s.hue}, 95%, 65%, ${alpha})`;

        // tiny flicker
        const jitter = (Math.random() - 0.5) * 0.9;
        const r = s.size + jitter * 0.25;
        ctx.beginPath();
        ctx.arc(px, py, r, 0, Math.PI * 2);
        ctx.fill();
      }

      ctx.globalCompositeOperation = "source-over";
      raf = requestAnimationFrame(tick);
    };

    raf = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
    };
  }, [enabled, prefersReduced]);

  return (
    <canvas
      ref={ref}
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 60,
        pointerEvents: "none",
        opacity: 0.85,
      }}
      aria-hidden="true"
    />
  );
}
