"use client";

export type PerfMode = "auto" | "quality" | "performance";

export type VpSettings = {
  perfMode: PerfMode;
  fpsCap: 30 | 60 | 120;
  renderScale: 0.75 | 1 | 1.25;   // stub for future renderer
  vfxIntensity: 0 | 0.5 | 1;
  emberDensity: 0.35 | 0.6 | 1;
  musicVol: number;              // 0..1
  sfxVol: number;                // 0..1
};

const KEY = "vp_settings_v1";

export const defaultSettings: VpSettings = {
  perfMode: "auto",
  fpsCap: 60,
  renderScale: 1,
  vfxIntensity: 1,
  emberDensity: 0.6,
  musicVol: 0.8,
  sfxVol: 0.85,
};

export function clamp01(n: number){ return Math.max(0, Math.min(1, n)); }

function prefersReducedMotion(): boolean {
  return typeof window !== "undefined" &&
    window.matchMedia &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}
function isLowEndDevice(): boolean {
  const navAny = navigator as any;
  const cores = typeof navigator.hardwareConcurrency === "number" ? navigator.hardwareConcurrency : 4;
  const mem = typeof navAny.deviceMemory === "number" ? navAny.deviceMemory : 8;
  return cores <= 4 || mem <= 4;
}
function isSaveDataOrSlowNet(): boolean {
  const navAny = navigator as any;
  const c = navAny.connection || navAny.mozConnection || navAny.webkitConnection;
  if (!c) return false;
  if (c.saveData === true) return true;
  const t = String(c.effectiveType || "");
  return t.includes("2g") || t.includes("slow-2g");
}

export function resolvePerfMode(s: VpSettings): "quality" | "performance" {
  if (s.perfMode === "quality" || s.perfMode === "performance") return s.perfMode;
  // AUTO: stability-first
  if (prefersReducedMotion()) return "performance";
  if (isSaveDataOrSlowNet()) return "performance";
  if (isLowEndDevice()) return "performance";
  return "quality";
}

export function autoTune(s: VpSettings): VpSettings {
  const r = resolvePerfMode(s);
  if (r === "performance") {
    return {
      ...s,
      fpsCap: 60,
      renderScale: 0.75,
      vfxIntensity: 0.5,
      emberDensity: 0.35,
    };
  }
  return {
    ...s,
    fpsCap: s.fpsCap ?? 60,
    renderScale: s.renderScale ?? 1,
    vfxIntensity: s.vfxIntensity ?? 1,
    emberDensity: s.emberDensity ?? 0.6,
  };
}

export function loadSettings(): VpSettings {
  if (typeof window === "undefined") return defaultSettings;
  try{
    const raw = window.localStorage.getItem(KEY);
    if (!raw) return autoTune(defaultSettings);
    const parsed = JSON.parse(raw) as Partial<VpSettings>;
    const merged: VpSettings = { ...defaultSettings, ...parsed } as VpSettings;
    return autoTune(merged);
  } catch {
    return autoTune(defaultSettings);
  }
}

export function saveSettings(s: VpSettings){
  if (typeof window === "undefined") return;
  try { window.localStorage.setItem(KEY, JSON.stringify(s)); } catch {}
}
