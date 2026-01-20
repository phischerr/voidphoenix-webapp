export type Currency = "ASH" | "EMBER" | "AW";

export type ItemId = string;

export type MarketItem = {
  id: ItemId;
  name: string;
  tier: 1|2|3|4|5;
  rarity: "common"|"uncommon"|"rare"|"epic"|"legendary";
};

export type Listing = {
  listingId: string;
  itemId: ItemId;
  seller: string;
  qty: number;
  price: number;
  currency: Currency;
  createdAt: string;
};

// Fairness scaffold:
// - No pay-to-win boosts
// - Multiple equal-rate acquisition paths (gather/craft/quest/trade)
// - Market bounded with sinks/fees later (anti-inflation)
