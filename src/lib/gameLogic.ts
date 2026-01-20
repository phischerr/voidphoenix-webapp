import { GameState, UPGRADE_DEFS, UpgradeKey } from "./gameTypes";

export function format(n: number): string {
  if (!Number.isFinite(n)) return "∞";
  if (n < 1000) return n.toFixed(n < 10 ? 2 : n < 100 ? 1 : 0);
  const units = ["K", "M", "B", "T", "Qa", "Qi"];
  let x = n;
  let u = -1;
  while (x >= 1000 && u < units.length - 1) { x /= 1000; u++; }
  return `${x.toFixed(2)}${units[u]}`;
}

export function getUpgradeCost(state: GameState, key: UpgradeKey): number {
  const def = UPGRADE_DEFS.find(d => d.key === key)!;
  const level = state.upgrades[key] ?? 0;
  return def.baseCost * Math.pow(def.costGrowth, level);
}

export function getSparksPerSec(state: GameState, ashPassiveBonusPerAsh: number): number {
  const ashMult = 1 + state.phoenixAsh * ashPassiveBonusPerAsh;
  let base = 0;
  for (const def of UPGRADE_DEFS) base += def.gainPerSec * (state.upgrades[def.key] ?? 0);
  return base * ashMult;
}

export function tick(state: GameState, nowMs: number, ashPassiveBonusPerAsh: number): GameState {
  const dt = Math.max(0, nowMs - state.lastTickMs);
  const sec = Math.min(dt / 1000, 60);
  const gain = getSparksPerSec(state, ashPassiveBonusPerAsh) * sec;
  return { ...state, sparks: state.sparks + gain, lastTickMs: nowMs };
}

export function buyUpgrade(state: GameState, key: UpgradeKey): GameState {
  const cost = getUpgradeCost(state, key);
  if (state.sparks < cost) return state;
  return { ...state, sparks: state.sparks - cost, upgrades: { ...state.upgrades, [key]: (state.upgrades[key] ?? 0) + 1 } };
}

export function tap(state: GameState, ashTapBonusPerAsh: number): GameState {
  const ashMult = 1 + state.phoenixAsh * ashTapBonusPerAsh;
  return { ...state, sparks: state.sparks + 1 * ashMult };
}

export function estimateAshOnRebirth(state: GameState): number {
  return Math.floor(Math.sqrt(state.sparks / 1000));
}

export function rebirth(state: GameState): GameState {
  const gainAsh = estimateAshOnRebirth(state);
  if (gainAsh <= 0) return state;
  return {
    version: state.version,
    sparks: 0,
    rebirths: state.rebirths + 1,
    phoenixAsh: state.phoenixAsh + gainAsh,
    upgrades: { spark: 0, feather: 0, ember: 0, flare: 0 },
    lastTickMs: Date.now(),
  };
}
