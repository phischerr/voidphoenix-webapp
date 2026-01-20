"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";

type Biome = "ash_dunes" | "scorched_wilds" | "burnt_forest" | "icy_peaks";

type Entity = {
  id: string;
  x: number;
  y: number;
  kind: "player" | "npc" | "mob";
  sprite: "hero" | "mage" | "rogue" | "bot";
  name?: string;
};

function clamp(n: number, a: number, b: number) {
  return Math.max(a, Math.min(b, n));
}

function seeded(n: number) {
  // deterministic-ish 0..1
  const x = Math.sin(n * 999.123) * 10000;
  return x - Math.floor(x);
}

function biomeAt(x: number, y: number): Biome {
  // Simple biome map: left -> ash, mid -> forest, right -> scorched, top-right -> icy
  if (x > 52 && y < 18) return "icy_peaks";
  if (x < 24) return "ash_dunes";
  if (x < 46) return "burnt_forest";
  return "scorched_wilds";
}

function tileColor(b: Biome, x: number, y: number) {
  // dark souls vibe: muted, ashy
  const noise = (seeded(x * 31 + y * 17) - 0.5) * 14; // subtle variance
  const c = (r: number, g: number, b: number) =>
    gb(,,);

  switch (b) {
    case "ash_dunes":
      return c(14, 20, 18);
    case "burnt_forest":
      return c(10, 18, 10);
    case "scorched_wilds":
      return c(18, 12, 10);
    case "icy_peaks":
      return c(10, 14, 22);
  }
}

function spritePath(s: Entity["sprite"]) {
  switch (s) {
    case "hero":
      return "/assets/generated/vp_pixel_hero.png";
    case "mage":
      return "/assets/generated/vp_pixel_mage.png";
    case "rogue":
      return "/assets/generated/vp_pixel_rogue.png";
    case "bot":
      return "/assets/generated/vp_pixel_bot.png";
  }
}

export default function TopDownMap() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // World grid (bigger than viewport)
  const worldW = 72;
  const worldH = 40;

  // Pixel-perfect tile size
  const tile = 16;
  const viewTilesW = 48; // 48*16 = 768px
  const viewTilesH = 30; // 30*16 = 480px

  const [player, setPlayer] = useState<Entity>({
    id: "p1",
    x: 10,
    y: 18,
    kind: "player",
    sprite: "hero",
    name: "Ashbound",
  });

  const entities = useMemo<Entity[]>(() => {
    const out: Entity[] = [];
    // a few NPCs + mobs sprinkled across biomes
    const presets: Array<Pick<Entity, "x" | "y" | "kind" | "sprite" | "name">> = [
      { x: 14, y: 10, kind: "npc", sprite: "mage", name: "Cinder Seer" },
      { x: 28, y: 14, kind: "npc", sprite: "rogue", name: "Dune Stalker" },
      { x: 38, y: 22, kind: "mob", sprite: "bot", name: "Ash Husk" },
      { x: 52, y: 16, kind: "mob", sprite: "bot", name: "Scorch Wretch" },
      { x: 60, y: 10, kind: "mob", sprite: "bot", name: "Frostbound Wisp" },
      { x: 44, y: 28, kind: "mob", sprite: "bot", name: "Burnt Revenant" },
    ];
    presets.forEach((p, i) =>
      out.push({ id: e, ...p })
    );
    return out;
  }, []);

  const allEntities = useMemo(() => [player, ...entities], [player, entities]);

  const [camera, setCamera] = useState({ x: 0, y: 0 });

  // Load sprites once
  const [spritesReady, setSpritesReady] = useState(false);
  const spriteImgs = useRef<Record<string, HTMLImageElement>>({});

  useEffect(() => {
    let cancelled = false;

    const paths = Array.from(
      new Set(allEntities.map((e) => spritePath(e.sprite)))
    );

    let loaded = 0;
    paths.forEach((p) => {
      const img = new Image();
      img.src = p;
      img.onload = () => {
        loaded++;
        if (!cancelled && loaded === paths.length) setSpritesReady(true);
      };
      spriteImgs.current[p] = img;
    });

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Camera follows player
  useEffect(() => {
    const camX = clamp(player.x - Math.floor(viewTilesW / 2), 0, worldW - viewTilesW);
    const camY = clamp(player.y - Math.floor(viewTilesH / 2), 0, worldH - viewTilesH);
    setCamera({ x: camX, y: camY });
  }, [player.x, player.y]);

  // Controls
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const k = e.key.toLowerCase();
      let dx = 0,
        dy = 0;
      if (k === "arrowup" || k === "w") dy = -1;
      if (k === "arrowdown" || k === "s") dy = 1;
      if (k === "arrowleft" || k === "a") dx = -1;
      if (k === "arrowright" || k === "d") dx = 1;

      if (dx || dy) {
        e.preventDefault();
        setPlayer((p) => ({
          ...p,
          x: clamp(p.x + dx, 0, worldW - 1),
          y: clamp(p.y + dy, 0, worldH - 1),
        }));
      }
      if (k === "e") {
        // very small interaction check
        const near = entities.find((en) => Math.abs(en.x - player.x) + Math.abs(en.y - player.y) <= 1);
        if (near) alert(${near.name ?? "Something"} stares back through the ash...);
      }
    };

    window.addEventListener("keydown", onKey, { passive: false });
    return () => window.removeEventListener("keydown", onKey as any);
  }, [entities, player.x, player.y]);

  // Render loop
  useEffect(() => {
    const c = canvasRef.current;
    if (!c) return;
    const ctx = c.getContext("2d");
    if (!ctx) return;

    c.width = viewTilesW * tile;
    c.height = viewTilesH * tile;

    ctx.imageSmoothingEnabled = false;

    const draw = () => {
      // tiles
      for (let y = 0; y < viewTilesH; y++) {
        for (let x = 0; x < viewTilesW; x++) {
          const wx = camera.x + x;
          const wy = camera.y + y;
          const b = biomeAt(wx, wy);
          ctx.fillStyle = tileColor(b, wx, wy);
          ctx.fillRect(x * tile, y * tile, tile, tile);

          // tiny embers/snow specks
          const n = seeded(wx * 77 + wy * 91);
          if (b !== "icy_peaks" && n > 0.985) {
            ctx.fillStyle = "rgba(255,120,60,0.18)";
            ctx.fillRect(x * tile + 7, y * tile + 6, 2, 2);
          }
          if (b === "icy_peaks" && n > 0.988) {
            ctx.fillStyle = "rgba(180,220,255,0.20)";
            ctx.fillRect(x * tile + 6, y * tile + 5, 2, 2);
          }
        }
      }

      // entities (sorted by y for fake depth)
      const entsInView = allEntities
        .filter((e) => e.x >= camera.x && e.x < camera.x + viewTilesW && e.y >= camera.y && e.y < camera.y + viewTilesH)
        .slice()
        .sort((a, b) => a.y - b.y);

      entsInView.forEach((e) => {
        const sx = (e.x - camera.x) * tile;
        const sy = (e.y - camera.y) * tile;

        // soft ground shadow
        ctx.fillStyle = "rgba(0,0,0,0.35)";
        ctx.fillRect(sx + 3, sy + 12, 10, 3);

        const p = spritePath(e.sprite);
        const img = spriteImgs.current[p];

        if (spritesReady && img?.complete) {
          // center sprite slightly above tile for “feet”
          ctx.drawImage(img, sx, sy - 8, tile, tile);
        } else {
          // fallback block
          ctx.fillStyle = "rgba(200,200,200,0.6)";
          ctx.fillRect(sx + 4, sy + 4, 8, 8);
        }

        // player marker
        if (e.kind === "player") {
          ctx.strokeStyle = "rgba(255,180,90,0.85)";
          ctx.strokeRect(sx + 1, sy + 1, tile - 2, tile - 2);
        }
      });

      requestAnimationFrame(draw);
    };

    draw();
  }, [camera.x, camera.y, spritesReady, allEntities]);

  return (
    <div className="mt-3">
      <div className="text-sm text-zinc-300 mb-2">
        <div className="font-semibold">Explore</div>
        <div>Top-down overworld (pixel-perfect). Interact with creatures and NPCs.</div>
        <div className="opacity-80">WASD / Arrows to move • E to interact</div>
      </div>

      <div className="inline-block border border-zinc-800 bg-black/30">
        <canvas ref={canvasRef} />
      </div>

      <div className="mt-2 text-xs text-zinc-400">
        Biomes: Ash Dunes • Burnt Forest • Scorched Wilds • Icy Peaks
      </div>
    </div>
  );
}