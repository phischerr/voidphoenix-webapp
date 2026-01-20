"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";

type Tile = 0 | 1; // 0 grass, 1 wall
type Vec2 = { x: number; y: number };

type Mob = {
  id: string;
  pos: Vec2; // in tile coords
  color: string;
  name: string;
  kind: "critter" | "npc";
};

const TILE = 16;            // logical pixel tile size
const SCALE = 3;            // screen scale (pixel look)
const VIEW_W = 26;          // visible tiles wide
const VIEW_H = 16;          // visible tiles high
const WORLD_W = 120;
const WORLD_H = 120;

function clamp(n: number, a: number, b: number) {
  return Math.max(a, Math.min(b, n));
}

function keyId(x: number, y: number) {
  return `${x},${y}`;
}

// Simple deterministic-ish world gen (fast, no deps)
function genWorld(): Tile[][] {
  const grid: Tile[][] = Array.from({ length: WORLD_H }, (_, y) =>
    Array.from({ length: WORLD_W }, (_, x) => {
      // border walls
      if (x === 0 || y === 0 || x === WORLD_W - 1 || y === WORLD_H - 1) return 1;

      // pseudo noise
      const v =
        (Math.sin(x * 0.17) +
          Math.cos(y * 0.13) +
          Math.sin((x + y) * 0.07) +
          Math.cos((x - y) * 0.09)) /
        4;

      // scatter walls
      return v > 0.45 ? 1 : 0;
    })
  );

  // carve a safe spawn clearing
  const cx = Math.floor(WORLD_W / 2);
  const cy = Math.floor(WORLD_H / 2);
  for (let yy = cy - 6; yy <= cy + 6; yy++) {
    for (let xx = cx - 8; xx <= cx + 8; xx++) {
      if (yy > 1 && xx > 1 && yy < WORLD_H - 2 && xx < WORLD_W - 2) grid[yy][xx] = 0;
    }
  }

  // carve simple paths
  for (let x = 4; x < WORLD_W - 4; x++) grid[cy][x] = 0;
  for (let y = 4; y < WORLD_H - 4; y++) grid[y][cx] = 0;

  return grid;
}

function isWall(world: Tile[][], x: number, y: number) {
  if (y < 0 || y >= world.length) return true;
  if (x < 0 || x >= world[0].length) return true;
  return world[y][x] === 1;
}

export default function TopDownMap() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const world = useMemo(() => genWorld(), []);

  const [player, setPlayer] = useState<Vec2>(() => ({
    x: Math.floor(WORLD_W / 2),
    y: Math.floor(WORLD_H / 2),
  }));

  const [mobs, setMobs] = useState<Mob[]>(() => {
    const base: Mob[] = [
      { id: "npc-1", pos: { x: Math.floor(WORLD_W / 2) + 4, y: Math.floor(WORLD_H / 2) }, color: "#9AE6B4", name: "Ashkeeper", kind: "npc" },
      { id: "npc-2", pos: { x: Math.floor(WORLD_W / 2) - 5, y: Math.floor(WORLD_H / 2) + 2 }, color: "#90CDF4", name: "Sparkwright", kind: "npc" },
    ];

    // add critters near the clearing
    for (let i = 0; i < 10; i++) {
      base.push({
        id: `critter-${i}`,
        pos: { x: Math.floor(WORLD_W / 2) + (Math.random() * 18 - 9) | 0, y: Math.floor(WORLD_H / 2) + (Math.random() * 12 - 6) | 0 },
        color: i % 2 === 0 ? "#FBB6CE" : "#FBD38D",
        name: i % 2 === 0 ? "Emberling" : "Cinderfox",
        kind: "critter",
      });
    }
    // ensure none spawn in walls
    return base.map(m => {
      let { x, y } = m.pos;
      x = clamp(x, 2, WORLD_W - 3);
      y = clamp(y, 2, WORLD_H - 3);
      if (isWall(world, x, y)) {
        x = Math.floor(WORLD_W / 2);
        y = Math.floor(WORLD_H / 2);
      }
      return { ...m, pos: { x, y } };
    });
  });

  const [toast, setToast] = useState<string>("WASD / Arrows to move • E to interact");
  const keysRef = useRef<Record<string, boolean>>({});
  const lastMoveRef = useRef<number>(0);

  // Input
  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      keysRef.current[e.key.toLowerCase()] = true;
      if (["arrowup", "arrowdown", "arrowleft", "arrowright", " "].includes(e.key.toLowerCase())) {
        e.preventDefault();
      }
      if (e.key.toLowerCase() === "e") {
        // interact
        const near = mobs.find(m => Math.abs(m.pos.x - player.x) + Math.abs(m.pos.y - player.y) === 1);
        if (near) setToast(`${near.name}: ${near.kind === "npc" ? "The Phoenix stirs. Keep gathering sparks." : "Squeak! (It scampers happily.)"}`);
        else setToast("No one nearby.");
      }
    };
    const up = (e: KeyboardEvent) => {
      keysRef.current[e.key.toLowerCase()] = false;
    };
    window.addEventListener("keydown", down, { passive: false });
    window.addEventListener("keyup", up);
    return () => {
      window.removeEventListener("keydown", down as any);
      window.removeEventListener("keyup", up as any);
    };
  }, [mobs, player.x, player.y]);

  // Sim tick: movement + critter wander
  useEffect(() => {
    const tick = () => {
      const now = performance.now();

      // player movement at fixed step rate
      if (now - lastMoveRef.current > 110) {
        const k = keysRef.current;
        let dx = 0, dy = 0;

        if (k["arrowup"] || k["w"]) dy -= 1;
        else if (k["arrowdown"] || k["s"]) dy += 1;
        else if (k["arrowleft"] || k["a"]) dx -= 1;
        else if (k["arrowright"] || k["d"]) dx += 1;

        if (dx !== 0 || dy !== 0) {
          const nx = player.x + dx;
          const ny = player.y + dy;
          if (!isWall(world, nx, ny)) {
            setPlayer({ x: nx, y: ny });
            lastMoveRef.current = now;
          }
        }
      }

      // critters wander occasionally
      if (Math.random() < 0.08) {
        setMobs(prev =>
          prev.map(m => {
            if (m.kind !== "critter") return m;
            if (Math.random() < 0.65) return m;
            const dirs = [
              { x: 1, y: 0 },
              { x: -1, y: 0 },
              { x: 0, y: 1 },
              { x: 0, y: -1 },
            ];
            const d = dirs[(Math.random() * dirs.length) | 0];
            const nx = m.pos.x + d.x;
            const ny = m.pos.y + d.y;
            if (isWall(world, nx, ny)) return m;
            // avoid walking onto player
            if (nx === player.x && ny === player.y) return m;
            return { ...m, pos: { x: nx, y: ny } };
          })
        );
      }

      draw();
      raf = requestAnimationFrame(tick);
    };

    let raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [player.x, player.y]);

  function draw() {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const W = VIEW_W * TILE * SCALE;
    const H = VIEW_H * TILE * SCALE;

    if (canvas.width !== W) canvas.width = W;
    if (canvas.height !== H) canvas.height = H;

    // crisp pixels
    (ctx as any).imageSmoothingEnabled = false;

    // camera centered on player
    const camX = clamp(player.x - Math.floor(VIEW_W / 2), 0, WORLD_W - VIEW_W);
    const camY = clamp(player.y - Math.floor(VIEW_H / 2), 0, WORLD_H - VIEW_H);

    // background
    ctx.fillStyle = "#05060a";
    ctx.fillRect(0, 0, W, H);

    // draw tiles
    for (let ty = 0; ty < VIEW_H; ty++) {
      for (let tx = 0; tx < VIEW_W; tx++) {
        const wx = camX + tx;
        const wy = camY + ty;
        const t = world[wy][wx];
        const px = tx * TILE * SCALE;
        const py = ty * TILE * SCALE;

        // grass
        if (t === 0) {
          ctx.fillStyle = (wx + wy) % 2 === 0 ? "#0b1a12" : "#0a1710";
          ctx.fillRect(px, py, TILE * SCALE, TILE * SCALE);

          // tiny speckles
          if ((wx * 17 + wy * 31) % 19 === 0) {
            ctx.fillStyle = "#103321";
            ctx.fillRect(px + 6 * SCALE, py + 10 * SCALE, 2 * SCALE, 2 * SCALE);
          }
        } else {
          // wall/rock
          ctx.fillStyle = "#10121a";
          ctx.fillRect(px, py, TILE * SCALE, TILE * SCALE);
          ctx.fillStyle = "#1b2130";
          ctx.fillRect(px + 2 * SCALE, py + 2 * SCALE, (TILE - 4) * SCALE, (TILE - 4) * SCALE);
        }
      }
    }

    // mobs
    for (const m of mobs) {
      const sx = (m.pos.x - camX) * TILE * SCALE;
      const sy = (m.pos.y - camY) * TILE * SCALE;
      if (sx < -TILE * SCALE || sy < -TILE * SCALE || sx > W || sy > H) continue;

      // body
      ctx.fillStyle = m.color;
      ctx.fillRect(sx + 3 * SCALE, sy + 3 * SCALE, 10 * SCALE, 10 * SCALE);

      // eyes
      ctx.fillStyle = "#0b0b0b";
      ctx.fillRect(sx + 5 * SCALE, sy + 6 * SCALE, 2 * SCALE, 2 * SCALE);
      ctx.fillRect(sx + 9 * SCALE, sy + 6 * SCALE, 2 * SCALE, 2 * SCALE);
    }

    // player
    const px = (player.x - camX) * TILE * SCALE;
    const py = (player.y - camY) * TILE * SCALE;

    // glow
    ctx.fillStyle = "rgba(255, 120, 80, 0.25)";
    ctx.fillRect(px - 1 * SCALE, py - 1 * SCALE, (TILE + 2) * SCALE, (TILE + 2) * SCALE);

    ctx.fillStyle = "#ff7a5a";
    ctx.fillRect(px + 3 * SCALE, py + 3 * SCALE, 10 * SCALE, 10 * SCALE);

    // “crest”
    ctx.fillStyle = "#ffd7a1";
    ctx.fillRect(px + 7 * SCALE, py + 2 * SCALE, 2 * SCALE, 2 * SCALE);

    // HUD border
    ctx.strokeStyle = "rgba(255,255,255,0.08)";
    ctx.lineWidth = 2;
    ctx.strokeRect(1, 1, W - 2, H - 2);
  }

  return (
    <div className="rounded-3xl border border-zinc-800 bg-zinc-950/40 p-4">
      <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
        <div>
          <div className="text-lg font-semibold">Explore</div>
          <div className="text-sm text-zinc-400">Top-down overworld (pixel-perfect). Interact with creatures and NPCs.</div>
        </div>
        <div className="text-sm text-zinc-400">{toast}</div>
      </div>

      <div className="mt-3 overflow-hidden rounded-2xl border border-zinc-800 bg-black">
        <canvas ref={canvasRef} style={{ display: "block", width: VIEW_W * TILE * SCALE, height: VIEW_H * TILE * SCALE, imageRendering: "pixelated" as any }} />
      </div>

      <div className="mt-3 grid gap-2 text-xs text-zinc-400 sm:grid-cols-3">
        <div className="rounded-xl border border-zinc-800 bg-zinc-950/40 p-3">Move: <span className="text-zinc-200">WASD / Arrows</span></div>
        <div className="rounded-xl border border-zinc-800 bg-zinc-950/40 p-3">Interact: <span className="text-zinc-200">E</span> (stand adjacent)</div>
        <div className="rounded-xl border border-zinc-800 bg-zinc-950/40 p-3">World: <span className="text-zinc-200">{WORLD_W}×{WORLD_H}</span> tiles</div>
      </div>
    </div>
  );
}
