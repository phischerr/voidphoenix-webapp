"use client";

import React from "react";
import GameShell from "@/components/GameShell";
import { loadSettings, saveSettings, clamp01, autoTune, type VpSettings, type PerfMode } from "@/lib/settings";

export default function SettingsPage(){
  const [s, setS] = React.useState<VpSettings>(() => loadSettings());

  function update(next: Partial<VpSettings>){
    const merged = autoTune({ ...s, ...next });
    setS(merged);
    saveSettings(merged);
  }

  return (
    <GameShell title="Settings" subtitle="Auto-mode is default. Players can tune visuals, performance, and audio.">
      <div className="vp-card-strong p-5 space-y-5">
        <div className="grid md:grid-cols-2 gap-4">
          <div className="vp-card p-4 space-y-2">
            <div className="font-semibold">Performance Mode</div>
            <div className="text-sm" style={{ color: "var(--muted)" }}>
              Auto chooses stability-first based on device + connection hints. Players can override.
            </div>
            <select value={s.perfMode} onChange={(e)=>update({ perfMode: e.target.value as PerfMode })}>
              <option value="auto">Auto (recommended)</option>
              <option value="quality">Quality</option>
              <option value="performance">Performance</option>
            </select>
          </div>

          <div className="vp-card p-4 space-y-2">
            <div className="font-semibold">FPS Cap</div>
            <div className="text-sm" style={{ color: "var(--muted)" }}>
              Helps keep CPU/GPU calm and prevents runaway usage on some systems.
            </div>
            <select value={s.fpsCap} onChange={(e)=>update({ fpsCap: Number(e.target.value) as any })}>
              <option value={30}>30</option>
              <option value={60}>60</option>
              <option value={120}>120</option>
            </select>
          </div>

          <div className="vp-card p-4 space-y-2">
            <div className="font-semibold">Render Scale (stub)</div>
            <div className="text-sm" style={{ color: "var(--muted)" }}>
              Stored preference for future Canvas/WebGL renderer.
            </div>
            <select value={s.renderScale} onChange={(e)=>update({ renderScale: Number(e.target.value) as any })}>
              <option value={0.75}>0.75x</option>
              <option value={1}>1.0x</option>
              <option value={1.25}>1.25x</option>
            </select>
          </div>

          <div className="vp-card p-4 space-y-2">
            <div className="font-semibold">VFX Intensity</div>
            <div className="text-sm" style={{ color: "var(--muted)" }}>
              Controls spark/ember intensity. Auto may reduce for stability.
            </div>
            <select value={s.vfxIntensity} onChange={(e)=>update({ vfxIntensity: Number(e.target.value) as any })}>
              <option value={0}>Off</option>
              <option value={0.5}>Medium</option>
              <option value={1}>High</option>
            </select>
          </div>

          <div className="vp-card p-4 space-y-2">
            <div className="font-semibold">Ember Density</div>
            <div className="text-sm" style={{ color: "var(--muted)" }}>
              Foreground sparks density across the whole screen.
            </div>
            <select value={s.emberDensity} onChange={(e)=>update({ emberDensity: Number(e.target.value) as any })}>
              <option value={0.35}>Low</option>
              <option value={0.6}>Default</option>
              <option value={1}>High</option>
            </select>
          </div>

          <div className="vp-card p-4 space-y-3">
            <div className="font-semibold">Audio (saved prefs)</div>

            <label className="text-sm" style={{ color: "var(--muted)" }}>Music: {Math.round(s.musicVol*100)}%</label>
            <input type="range" min="0" max="1" step="0.01" value={s.musicVol}
              onChange={(e)=>update({ musicVol: clamp01(Number(e.target.value)) })} />

            <label className="text-sm" style={{ color: "var(--muted)" }}>SFX: {Math.round(s.sfxVol*100)}%</label>
            <input type="range" min="0" max="1" step="0.01" value={s.sfxVol}
              onChange={(e)=>update({ sfxVol: clamp01(Number(e.target.value)) })} />
          </div>
        </div>

        <div className="vp-card p-4">
          <div className="vp-pill"><span>🛡️</span><span>Stability note</span></div>
          <p className="text-sm mt-2" style={{ color: "var(--muted)" }}>
            Messages like “removing unpermitted intrinsics” usually come from browser extensions injecting security
            lockdown code. This game avoids depending on those intrinsics and stays stable either way.
          </p>
        </div>
      </div>
    </GameShell>
  );
}

