"use client";

import React, { useEffect, useState } from "react";

type Character = {
  name: string;
  archetype: "Runner" | "Seer" | "Smith";
};

const KEY = "vp_character_v1";

export default function AccountPage() {
  const [name, setName] = useState("");
  const [arch, setArch] = useState<Character["archetype"]>("Runner");
  const [saved, setSaved] = useState<Character | null>(null);

  useEffect(() => {
    const raw = localStorage.getItem(KEY);
    if (raw) setSaved(JSON.parse(raw));
  }, []);

  function save() {
    const c: Character = { name: name.trim() || "Phischer", archetype: arch };
    localStorage.setItem(KEY, JSON.stringify(c));
    setSaved(c);
  }

  return (
    <main className="min-h-screen p-6">
      <div className="max-w-2xl mx-auto space-y-4">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">Create Character</h1>
          <a className="underline text-sm" href="/">Back</a>
        </div>

        <div className="rounded-xl border p-4 space-y-3">
          <label className="block text-sm">
            Name
            <input className="mt-1 w-full rounded-md border p-2" value={name} onChange={(e)=>setName(e.target.value)} />
          </label>

          <label className="block text-sm">
            Archetype
            <select className="mt-1 w-full rounded-md border p-2" value={arch} onChange={(e)=>setArch(e.target.value as any)}>
              <option>Runner</option>
              <option>Seer</option>
              <option>Smith</option>
            </select>
          </label>

          <button className="rounded-md border px-3 py-2" onClick={save}>Save</button>
        </div>

        {saved && (
          <div className="rounded-xl border p-4">
            <div className="font-medium">Saved</div>
            <div className="text-sm text-zinc-600">Name: {saved.name}</div>
            <div className="text-sm text-zinc-600">Archetype: {saved.archetype}</div>
            <a className="underline text-sm" href="/quest">Start Quest</a>
          </div>
        )}
      </div>
    </main>
  );
}
