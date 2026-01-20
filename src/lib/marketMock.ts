import type { MarketItem, Listing } from "./marketTypes";

export const items: MarketItem[] = [
  { id: "ash-ore", name: "Ash Ore", tier: 1, rarity: "common" },
  { id: "ember-shard", name: "Ember Shard", tier: 2, rarity: "uncommon" },
  { id: "phoenix-fiber", name: "Phoenix Fiber", tier: 3, rarity: "rare" },
  { id: "voidglass", name: "Voidglass", tier: 4, rarity: "epic" },
];

export const listings: Listing[] = [
  { listingId: "L-001", itemId: "ash-ore", seller: "Player_Seed", qty: 40, price: 6, currency: "ASH", createdAt: new Date().toISOString() },
  { listingId: "L-002", itemId: "ember-shard", seller: "TradeMage", qty: 10, price: 3, currency: "EMBER", createdAt: new Date().toISOString() },
  { listingId: "L-003", itemId: "phoenix-fiber", seller: "Weaver", qty: 2, price: 1, currency: "AW", createdAt: new Date().toISOString() },
];
