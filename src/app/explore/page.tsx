"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";

type Vec2 = { x: number; y: number };

function clamp(v: number, a: number, b: number) { return Math.max(a, Math.min(b, v)); }

export default function ExplorePage() {
  // "grid-ish" tuning
  const tileSize = 48;              // visual tile spacing
  const maxSpeed = 240;             // px/sec
  const accel = 1400;               // px/sec^2
  const friction = 1800;            // px/sec^2
  const snapStrength = 14;          // how strongly we bias toward tile lanes
  const deadzone = 0.18;            // controller stick deadzone

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const rafRef = useRef<number | null>(null);
  const lastT = useRef<number>(0);

  const keys = useRef<Record<string, boolean>>({});
  const vel = useRef<Vec2>({ x: 0, y: 0 });
  const pos = useRef<Vec2>({ x: 0, y: 0 }); // world position; player always drawn center

  const [hud, setHud] = useState({ x: 0, y: 0, station: "none" });

  const stations = useMemo(() => {
    // deterministic-ish handful of nearby stations
    return [
      { id: "ember-exchange", name: "Ember Exchange", x: 380, y: -120 },
      { id: "ash-dock", name: "Ash Dock", x: -260, y: 240 },
      { id: "signal-foundry", name: "Signal Foundry", x: 740, y: 620 },
    ];
  }, []);

  useEffect(() => {
    const onDown = (e: KeyboardEvent) => { keys.current[e.key.toLowerCase()] = true; };
    const onUp   = (e: KeyboardEvent) => { keys.current[e.key.toLowerCase()] = false; };
    window.addEventListener("keydown", onDown);
    window.addEventListener("keyup", onUp);
    return () => { window.removeEventListener("keydown", onDown); window.removeEventListener("keyup", onUp); };
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const resize = () => {
      const dpr = window.devicePixelRatio || 1;
      const rect = canvas.getBoundingClientRect();
      canvas.width = Math.floor(rect.width * dpr);
      canvas.height = Math.floor(rect.height * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();
    window.addEventListener("resize", resize);

    const loop = (t: number) => {
      const dt = clamp((t - lastT.current) / 1000, 0, 0.05);
      lastT.current = t;

      // ----- Input vector (keyboard + gamepad) -----
      let ix = 0, iy = 0;

      const k = keys.current;
      if (k["a"] || k["arrowleft"]) ix -= 1;
      if (k["d"] || k["arrowright"]) ix += 1;
      if (k["w"] || k["arrowup"]) iy -= 1;
      if (k["s"] || k["arrowdown"]) iy += 1;

      const pads = navigator.getGamepads ? navigator.getGamepads() : [];
      const p0 = pads && pads[0];
      if (p0) {
        const ax = p0.axes?.[0] ?? 0;
        const ay = p0.axes?.[1] ?? 0;
        const mx = Math.abs(ax) < deadzone ? 0 : ax;
        const my = Math.abs(ay) < deadzone ? 0 : ay;
        ix += mx;
        iy += my;
      }

      // normalize if needed
      const mag = Math.hypot(ix, iy);
      if (mag > 1) { ix /= mag; iy /= mag; }

      // ----- Physics: accel + friction -----
      const v = vel.current;
      if (mag > 0.001) {
        v.x += ix * accel * dt;
        v.y += iy * accel * dt;
      } else {
        // friction toward 0
        const sp = Math.hypot(v.x, v.y);
        if (sp > 0) {
          const drop = friction * dt;
          const ns = Math.max(0, sp - drop);
          const s = ns / sp;
          v.x *= s; v.y *= s;
        }
      }

      // cap speed
      const sp2 = Math.hypot(v.x, v.y);
      if (sp2 > maxSpeed) {
        const s = maxSpeed / sp2;
        v.x *= s; v.y *= s;
      }

      // ----- "grid-ish" lane bias (soft snap) -----
      // bias player's world position toward nearest tile lines while moving
      const p = pos.current;
      const targetX = Math.round(p.x / tileSize) * tileSize;
      const targetY = Math.round(p.y / tileSize) * tileSize;

      // when moving mostly horizontally, snap Y more; mostly vertical, snap X more.
      const axAbs = Math.abs(ix);
      const ayAbs = Math.abs(iy);
      const snapX = ayAbs > axAbs ? snapStrength : snapStrength * 0.35;
      const snapY = axAbs > ayAbs ? snapStrength : snapStrength * 0.35;

      p.x += v.x * dt;
      p.y += v.y * dt;

      // apply gentle spring toward grid lines
      p.x += (targetX - p.x) * snapX * dt * 0.02;
      p.y += (targetY - p.y) * snapY * dt * 0.02;

      // ----- Station detection -----
      let near = "none";
      for (const s of stations) {
        const d = Math.hypot(s.x - p.x, s.y - p.y);
        if (d < 90) { near = s.name; break; }
      }
      setHud({ x: Math.round(p.x), y: Math.round(p.y), station: near });

      // ----- Render -----
      const w = canvas.clientWidth;
      const h = canvas.clientHeight;

      ctx.clearRect(0, 0, w, h);

      // background grid
      const ox = (w / 2) - (p.x % tileSize);
      const oy = (h / 2) - (p.y % tileSize);

      ctx.lineWidth = 1;
      ctx.globalAlpha = 0.25;
      for (let x = ox; x < w; x += tileSize) {
        ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, h); ctx.stroke();
      }
      for (let y = oy; y < h; y += tileSize) {
        ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(w, y); ctx.stroke();
      }
      ctx.globalAlpha = 1;

      // stations (in world coords -> screen coords)
      for (const s of stations) {
        const sx = w / 2 + (s.x - p.x);
        const sy = h / 2 + (s.y - p.y);
        ctx.beginPath();
        ctx.arc(sx, sy, 12, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillText(s.name, sx + 18, sy + 5);
      }

      // player at center
      ctx.beginPath();
      ctx.arc(w / 2, h / 2, 10, 0, Math.PI * 2);
      ctx.fill();

      rafRef.current = requestAnimationFrame(loop);
    };

    lastT.current = performance.now();
    rafRef.current = requestAnimationFrame(loop);

    return () => {
      window.removeEventListener("resize", resize);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [stations]);

  return (
    <main className="min-h-screen p-4">
      <div className="max-w-5xl mx-auto space-y-3">
        <div className="flex items-center justify-between gap-4">
          <h1 className="text-2xl font-bold">Explore</h1>
          <a className="underline text-sm" href="/">Back</a>
        </div>

        <div className="rounded-xl border p-3 text-sm text-zinc-600">
          <div>Move: WASD / Arrow Keys / Controller Left Stick</div>
          <div>Near Station: <span className="font-medium">{hud.station}</span></div>
          <div className="font-mono">pos=({hud.x},{hud.y})</div>
        </div>

        <div className="rounded-xl border overflow-hidden">
          <canvas ref={canvasRef} className="w-full h-[70vh]" />
        </div>

        <div className="text-sm text-zinc-600">
          Next: interact (E / A), station trade UI, inventory, currencies, seeded market drift.
        </div>
      </div>
    </main>
  );
}
