import React from "react";
import GameShell from "../components/GameShell";

function Stat({ k, v }: { k: string; v: string }) {
  return (
    <div className="vp-chip" style={{ minWidth: 170, justifyContent: "space-between" }}>
      <span style={{ color: "var(--muted)", fontSize: 12 }}>{k}</span>
      <span style={{ fontWeight: 800 }}>{v}</span>
    </div>
  );
}

function PixelCard({ title, body, tone }: { title: string; body: string; tone: "hot" | "aqua" | "violet" }) {
  const border =
    tone === "hot" ? "rgba(255,77,109,.35)" : tone === "aqua" ? "rgba(46,242,255,.35)" : "rgba(168,85,255,.35)";
  return (
    <div className="vp-panel" style={{ padding: 16, borderColor: border }}>
      <div style={{ fontSize: 14, fontWeight: 900, letterSpacing: 0.4 }}>{title}</div>
      <div style={{ marginTop: 8, color: "var(--muted)", fontSize: 13, lineHeight: 1.5 }}>{body}</div>
    </div>
  );
}

export default function HomePage() {
  return (
    <GameShell>
      <section className="vp-panel" style={{ padding: 18 }}>
        <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", justifyContent: "space-between", gap: 12 }}>
          <div style={{ maxWidth: 640 }}>
            <div style={{ fontSize: 34, fontWeight: 950, letterSpacing: 0.5, lineHeight: 1.05 }}>
              Ignite. Ascend. Rebirth.
            </div>
            <p style={{ margin: "10px 0 0", color: "var(--muted)", fontSize: 14, lineHeight: 1.6 }}>
              VoidPhoenix is evolving into a multiplayer, fairness-first sandbox with a stable market and deep customization.
              This build is the retro-themed shell: CRT glow, pixel UI, and lightweight foreground embers.
            </p>

            <div style={{ marginTop: 14, display: "flex", flexWrap: "wrap", gap: 10 }}>
              <a className="vp-btn vp-btn-hot" href="/game">Enter Game</a>
              <a className="vp-btn vp-btn-aqua" href="/market">Open Market</a>
              <a className="vp-btn" href="/settings">Performance</a>
            </div>

            <div style={{ marginTop: 14, display: "flex", flexWrap: "wrap", gap: 10 }}>
              <Stat k="Theme" v="Retro CRT" />
              <Stat k="Particles" v="Faint Embers" />
              <Stat k="Build" v="Next + Tauri" />
            </div>
          </div>

          <div className="vp-panel" style={{ padding: 14, width: 330, borderRadius: 18 }}>
            <div style={{ fontSize: 12, color: "var(--muted)" }}>Pixel Scene (placeholder art)</div>
            <svg viewBox="0 0 320 200" width="100%" height="auto" style={{ marginTop: 10, imageRendering: "pixelated" as any }}>
              <rect width="320" height="200" fill="rgba(0,0,0,.25)" />
              <rect x="18" y="22" width="284" height="156" rx="16" fill="rgba(8,10,26,.8)" stroke="rgba(255,255,255,.14)" />
              <rect x="40" y="50" width="240" height="10" fill="rgba(46,242,255,.35)" />
              <rect x="40" y="70" width="180" height="8" fill="rgba(168,85,255,.35)" />
              <rect x="40" y="88" width="210" height="8" fill="rgba(255,77,109,.28)" />
              <g opacity="0.9">
                <rect x="70" y="120" width="20" height="40" fill="rgba(255,211,110,.35)" />
                <rect x="95" y="135" width="22" height="25" fill="rgba(46,242,255,.25)" />
                <rect x="124" y="128" width="18" height="32" fill="rgba(168,85,255,.25)" />
                <rect x="148" y="142" width="26" height="18" fill="rgba(255,77,109,.22)" />
              </g>
              <circle cx="250" cy="120" r="22" fill="rgba(46,242,255,.18)" />
              <circle cx="250" cy="120" r="10" fill="rgba(255,255,255,.12)" />
            </svg>
          </div>
        </div>
      </section>

      <section style={{ marginTop: 16, display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: 12 }}>
        <PixelCard
          tone="aqua"
          title="Fair Progress"
          body="All gathering and progression paths are balanced so every playstyle can reach perfection without a paywall."
        />
        <PixelCard
          tone="violet"
          title="Player Trade Network"
          body="Economy scaffolds are designed around stable exchange, crafting niches, and social trade loops."
        />
        <PixelCard
          tone="hot"
          title="Customization x100"
          body="Character cosmetics, gear looks, base styling, UI skins, particle themes, and moreâ€”built to be collectible and expressive."
        />
      </section>
    </GameShell>
  );
}

/* AIOC: add Story button somewhere in your CTA bar if you prefer */

/* AIOC: add <a className="vp-btn" href="/story">Story</a> in your CTA bar */
