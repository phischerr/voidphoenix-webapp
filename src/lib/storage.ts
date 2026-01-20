import { GameState, defaultState, GAME_VERSION } from "./gameTypes";
const KEY = "voidphoenix_save_v1";

export function loadState(): GameState {
  if (typeof window === "undefined") return defaultState();
  try {
    const raw = window.localStorage.getItem(KEY);
    if (!raw) return defaultState();
    const parsed = JSON.parse(raw) as GameState;
    return { ...defaultState(), ...parsed, version: GAME_VERSION, lastTickMs: parsed.lastTickMs || Date.now() };
  } catch {
    return defaultState();
  }
}

export function saveState(state: GameState) {
  if (typeof window === "undefined") return;
  try { window.localStorage.setItem(KEY, JSON.stringify(state)); } catch {}
}

export function exportSave(state: GameState): string {
  const payload = JSON.stringify(state);
  return btoa(unescape(encodeURIComponent(payload)));
}

export function importSave(encoded: string): GameState | null {
  try {
    const json = decodeURIComponent(escape(atob(encoded.trim())));
    const parsed = JSON.parse(json) as GameState;
    return { ...defaultState(), ...parsed, version: GAME_VERSION, lastTickMs: Date.now() };
  } catch { return null; }
}

export function clearSave() {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(KEY);
}
