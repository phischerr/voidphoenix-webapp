export type UpgradeKey = "spark" | "feather" | "ember" | "flare";

export type UpgradeDef = {
  key: UpgradeKey;
  name: string;
  description: string;
  baseCost: number;
  costGrowth: number;
  gainPerSec: number;
};

export type GameState = {
  version: number;
  sparks: number;
  rebirths: number;
  phoenixAsh: number;
  upgrades: Record<UpgradeKey, number>;
  lastTickMs: number;
};

export type Settings = {
  title: string;
  tagline: string;
  theme: { accent: string; background: string };
  numbers: { ashPassiveBonusPerAsh: number; ashTapBonusPerAsh: number };
};

export type Story = {
  chapters: Array<{ id: string; title: string; beats: string[] }>;
};

export const GAME_VERSION = 1;

export const UPGRADE_DEFS: UpgradeDef[] = [
  { key: "spark",   name: "Spark Collector", description: "+0.2 sparks/sec", baseCost: 10,  costGrowth: 1.15, gainPerSec: 0.2 },
  { key: "feather", name: "Phoenix Feather", description: "+1.0 sparks/sec", baseCost: 75,  costGrowth: 1.17, gainPerSec: 1.0 },
  { key: "ember",   name: "Ember Engine",    description: "+5.0 sparks/sec", baseCost: 400, costGrowth: 1.18, gainPerSec: 5.0 },
  { key: "flare",   name: "Flare Core",      description: "+20 sparks/sec",  baseCost: 2000,costGrowth: 1.20, gainPerSec: 20 },
];

export const defaultState = (): GameState => ({
  version: GAME_VERSION,
  sparks: 0,
  rebirths: 0,
  phoenixAsh: 0,
  upgrades: { spark: 0, feather: 0, ember: 0, flare: 0 },
  lastTickMs: Date.now(),
});
