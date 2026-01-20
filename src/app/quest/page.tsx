"use client";

import React, { useEffect, useMemo, useState } from "react";

type Character = { name: string; archetype: "Runner" | "Seer" | "Smith" };
const KEY = "vp_character_v1";

export default function QuestPage() {
  const [c, setC] = useState<Character | null>(null);
  const [step, setStep] = useState(0);

  useEffect(() => {
    const raw = localStorage.getItem(KEY);
    if (raw) setC(JSON.parse(raw));
  }, []);

  const quest = useMemo(() => ([
    { title: "Spark: First Ignition", text: "Go to /explore and approach Ember Exchange (the station circle). (Next: auto-complete)" },
    { title: "Trade Signal", text: "Approach Ash Dock. (Next: inventory + trade UI)" },
    { title: "Route Memory", text: "Reach Signal Foundry. Your path becomes a blueprint." },
  ]), []);

  if (!c) {
    return (
      <main className="min-h-screen p-6">
        <div className="max-w-2xl mx-auto space-y-4">
          <h1 className="text-2xl font-bold">Quest</h1>
          <p className="text-zinc-600">No character found. Create one first.</p>
          <a className="underline" href="/account">Go to /account</a>
        </div>
      </main>
    );
  }

  const q = quest[Math.min(step, quest.length - 1)];

  return (
    <main className="min-h-screen p-6">
      <div className="max-w-2xl mx-auto space-y-4">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">Quest Log</h1>
          <a className="underline text-sm" href="/explore">Go Explore</a>
        </div>

        <div className="rounded-xl border p-4">
          <div className="text-sm text-zinc-600">Runner: {c.name} ({c.archetype})</div>
          <div className="mt-2 font-medium">{q.title}</div>
          <div className="text-sm text-zinc-600">{q.text}</div>

          <div className="mt-4 flex gap-2">
            <button className="rounded-md border px-3 py-2" onClick={()=>setStep(s=>Math.max(0,s-1))}>Prev</button>
            <button className="rounded-md border px-3 py-2" onClick={()=>setStep(s=>Math.min(quest.length-1,s+1))}>Next</button>
            <a className="rounded-md border px-3 py-2" href="/">Home</a>
          </div>
        </div>

        <div className="text-sm text-zinc-600">
          Next upgrade: link station proximity from /explore to quest completion.
        </div>
      </div>
    </main>
  );
}
