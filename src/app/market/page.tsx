import React from "react";
import GameShell from "@/components/GameShell";
import { items, listings } from "@/lib/marketMock";

function itemName(id: string){
  return items.find(i=>i.id===id)?.name ?? id;
}

export default function MarketPage(){
  return (
    <GameShell title="Market" subtitle="Multiplayer economy scaffold (mock data). Real networking comes next.">
      <div className="vp-card-strong p-5 space-y-5">
        <div className="vp-card p-4">
          <div className="vp-pill"><span>🤝</span><span>Trade Vision</span></div>
          <p className="text-sm mt-2" style={{ color: "var(--muted)" }}>
            A fair, player-driven market: equal-rate progress paths (gather/craft/quest/trade) and specialization niches
            that build real cooperation.
          </p>
        </div>

        <div className="vp-card p-4">
          <div className="font-semibold mb-2">Listings (mock)</div>
          <div className="space-y-2">
            {listings.map(l => (
              <div key={l.listingId} className="vp-card p-3 flex items-center justify-between gap-3">
                <div>
                  <div className="font-semibold">{itemName(l.itemId)}</div>
                  <div className="text-xs" style={{ color: "var(--muted)" }}>
                    Seller: {l.seller} • Qty: {l.qty}
                  </div>
                </div>
                <div className="vp-pill">
                  <span>💱</span>
                  <span>{l.price} {l.currency}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="vp-card p-4">
          <div className="font-semibold">Next step (planned)</div>
          <ul className="text-sm mt-2 space-y-1" style={{ color: "var(--muted)" }}>
            <li>• WebSocket lobby + presence</li>
            <li>• Server-authoritative listings + escrow trades</li>
            <li>• Anti-inflation sinks (fees/crafting/repairs)</li>
            <li>• Equal-rate acquisition balancing per tier</li>
          </ul>
        </div>
      </div>
    </GameShell>
  );
}

