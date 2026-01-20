"use client";
import { useEffect, useState } from "react";

export type PhoenixEvent = { visible: boolean; message?: string; questId?: string };

export function usePhoenixMilestone(milestoneKey: string): PhoenixEvent {
  const [evt, setEvt] = useState<PhoenixEvent>({ visible: false });

  useEffect(() => {
    const seenKey = `vp_phoenix_seen_${milestoneKey}`;
    const seen = localStorage.getItem(seenKey);
    if (!seen) {
      const t = setTimeout(() => {
        localStorage.setItem(seenKey, "1");
        setEvt({
          visible: true,
          message: "The Phoenix cuts through the ember drift… a sealed sigil lands in your hand.",
          questId: "first_flame_first_oath"
        });
      }, 900);
      return () => clearTimeout(t);
    }
  }, [milestoneKey]);

  return evt;
}