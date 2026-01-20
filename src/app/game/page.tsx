"use client";


import TopDownMap from "@/components/TopDownMap";
import { usePhoenixMilestone } from "@/lib/phoenix";
import StoryOverlay from "@/components/StoryOverlay";
import React, { useEffect, useMemo, useRef, useState  } from "react";
import { GameState, UPGRADE_DEFS, UpgradeKey, defaultState } from "@/lib/gameTypes";
import { buyUpgrade, estimateAshOnRebirth, format, getSparksPerSec, rebirth, tap, tick } from "@/lib/gameLogic";
import { clearSave, exportSave, importSave, loadState, saveState } from "@/lib/storage";

type Settings = {
  title: string;
  tagline: string;
  numbers: { ashPassiveBonusPerAsh: number; ashTapBonusPerAsh: number };
};

export default function GamePage() {
  const [showStory, setShowStory] = React.useState(false);
  const phoenix = usePhoenixMilestone("mvp_milestone_1");
  React.useEffect(()=>{ if(phoenix.visible) setShowStory(true); },[phoenix.visible]);

  const [state, setState] = useState<GameState>(() => defaultState());
  const [importText, setImportText] = useState("");
const [view, setView] = useState<"explore" | "forge">("explore");
  const [settings, setSettings] = useState<Settings | null>(null);
  const rafRef = useRef<number | null>(null);

  useEffect(() => {
    setState(loadState());
    fetch("/api/settings").then(r => r.json()).then(setSettings).catch(() => setSettings(null));
  }, []);

  const passiveBonus = settings?.numbers.ashPassiveBonusPerAsh ?? 0.05;
  const tapBonus = settings?.numbers.ashTapBonusPerAsh ?? 0.02;

  useEffect(() => {
    const loop = () => {
      setState(prev => tick(prev, Date.now(), passiveBonus));
      rafRef.current = requestAnimationFrame(loop);
    };
    rafRef.current = requestAnimationFrame(loop);
    return () => { if (rafRef.current) cancelAnimationFrame(rafRef.current); };
  }, [passiveBonus]);

  useEffect(() => {
    const t = setTimeout(() => saveState(state), 250);
    return () => clearTimeout(t);
  }, [state]);

  const sps = useMemo(() => getSparksPerSec(state, passiveBonus), [state, passiveBonus]);
  const ashGain = useMemo(() => estimateAshOnRebirth(state), [state]);

  const onBuy = (key: UpgradeKey) => setState(prev => buyUpgrade(prev, key));
  const onTap = () => setState(prev => tap(prev, tapBonus));
  const onRebirth = () => setState(prev => rebirth(prev));

  const onExport = async () => {
    const data = exportSave(state);
    await navigator.clipboard.writeText(data);
    alert("Save exported to clipboard.");
  };

  const onImport = () => {
    const next = importSave(importText);
    if (!next) return alert("Invalid import string.");
    setState(next);
    setImportText("");
    alert("Save imported.");
  };

  const onReset = () => {
    if (!confirm("Hard reset your save? This cannot be undone.")) return;
    clearSave();
    setState(defaultState());
  };

  return (
    <>
      <main className="min-h-screen bg-zinc-950 text-zinc-100">
      <div className="mx-auto max-w-5xl px-4 py-10">
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <h1 className="text-3xl font-semibold tracking-tight">{settings?.title ?? "VoidPhoenix"}</h1>
            <p className="text-zinc-400">{settings?.tagline ?? "Ignite. Ascend. Rebirth."}</p>
          </div>

          <div className="flex flex-wrap gap-2">
            <a className="rounded-xl bg-zinc-800 px-4 py-2 text-sm hover:bg-zinc-700" href="/">Home</a>
            <a className="rounded-xl bg-zinc-800 px-4 py-2 text-sm hover:bg-zinc-700" href="/codex">Codex</a>
            <button className="rounded-xl bg-zinc-800 px-4 py-2 text-sm hover:bg-zinc-700" onClick={onExport}>Export Save</button>
            <button className="rounded-xl bg-zinc-800 px-4 py-2 text-sm hover:bg-zinc-700" onClick={onReset}>Hard Reset</button>
          </div>
        </div>

        <div className="mt-4 flex gap-2">
          <button
            onClick={() => setView("explore")}
            className={`rounded-2xl px-4 py-2 text-sm font-semibold ${view === "explore" ? "bg-zinc-100 text-zinc-950" : "bg-zinc-900 text-zinc-200 hover:bg-zinc-800"}`}
          >
            Explore
          </button>
          <button
            onClick={() => setView("forge")}
            className={`rounded-2xl px-4 py-2 text-sm font-semibold ${view === "forge" ? "bg-zinc-100 text-zinc-950" : "bg-zinc-900 text-zinc-200 hover:bg-zinc-800"}`}
          >
            Forge
          </button>
        </div>

        {view === "explore" && (
          <div className="mt-5">
            <TopDownMap />
          </div>
        )}

        <div className="mt-8 grid gap-4 md:grid-cols-3">
          <div className="rounded-2xl bg-zinc-900 p-5 shadow">
            <div className="text-sm text-zinc-400">Sparks</div>
            <div className="mt-1 text-4xl font-semibold">{format(state.sparks)}</div>
            <div className="mt-2 text-sm text-zinc-400">
              {format(sps)}/sec ÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã¢â‚¬Â ÃƒÂ¢Ã¢â€šÂ¬Ã¢â€žÂ¢ÃƒÆ’Ã†â€™ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬ÃƒÂ¢Ã¢â‚¬Å¾Ã‚Â¢ÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬Ãƒâ€¦Ã‚Â¡ÃƒÆ’Ã†â€™ÃƒÂ¢Ã¢â€šÂ¬Ã…Â¡ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â¢ÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã¢â‚¬Â ÃƒÂ¢Ã¢â€šÂ¬Ã¢â€žÂ¢ÃƒÆ’Ã†â€™ÃƒÂ¢Ã¢â€šÂ¬Ã…Â¡ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â¢ÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â¢ÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¢ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬Ãƒâ€¦Ã‚Â¡ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â¬ÃƒÆ’Ã†â€™ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â¦ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â¡ÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬Ãƒâ€¦Ã‚Â¡ÃƒÆ’Ã†â€™ÃƒÂ¢Ã¢â€šÂ¬Ã…Â¡ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â¬ÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã¢â‚¬Â ÃƒÂ¢Ã¢â€šÂ¬Ã¢â€žÂ¢ÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¢ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã…Â¡Ãƒâ€šÃ‚Â¬ÃƒÆ’Ã¢â‚¬Â¦Ãƒâ€šÃ‚Â¡ÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬Ãƒâ€¦Ã‚Â¡ÃƒÆ’Ã†â€™ÃƒÂ¢Ã¢â€šÂ¬Ã…Â¡ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â¢ Rebirths: {state.rebirths} ÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã¢â‚¬Â ÃƒÂ¢Ã¢â€šÂ¬Ã¢â€žÂ¢ÃƒÆ’Ã†â€™ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬ÃƒÂ¢Ã¢â‚¬Å¾Ã‚Â¢ÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬Ãƒâ€¦Ã‚Â¡ÃƒÆ’Ã†â€™ÃƒÂ¢Ã¢â€šÂ¬Ã…Â¡ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â¢ÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã¢â‚¬Â ÃƒÂ¢Ã¢â€šÂ¬Ã¢â€žÂ¢ÃƒÆ’Ã†â€™ÃƒÂ¢Ã¢â€šÂ¬Ã…Â¡ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â¢ÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â¢ÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¢ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬Ãƒâ€¦Ã‚Â¡ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â¬ÃƒÆ’Ã†â€™ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â¦ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â¡ÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬Ãƒâ€¦Ã‚Â¡ÃƒÆ’Ã†â€™ÃƒÂ¢Ã¢â€šÂ¬Ã…Â¡ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â¬ÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã¢â‚¬Â ÃƒÂ¢Ã¢â€šÂ¬Ã¢â€žÂ¢ÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¢ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã…Â¡Ãƒâ€šÃ‚Â¬ÃƒÆ’Ã¢â‚¬Â¦Ãƒâ€šÃ‚Â¡ÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬Ãƒâ€¦Ã‚Â¡ÃƒÆ’Ã†â€™ÃƒÂ¢Ã¢â€šÂ¬Ã…Â¡ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â¢ Phoenix Ash: {state.phoenixAsh}
            </div>

            <button className="mt-4 w-full rounded-2xl bg-amber-500 px-4 py-3 font-semibold text-zinc-950 hover:opacity-90" onClick={onTap}>
              Ignite (+1)
            </button>

            <div className="mt-4 rounded-xl bg-zinc-950/50 p-3 text-sm text-zinc-300">
              Ash passive mult: <span className="font-semibold">{(1 + state.phoenixAsh * passiveBonus).toFixed(2)}ÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã¢â‚¬Â ÃƒÂ¢Ã¢â€šÂ¬Ã¢â€žÂ¢ÃƒÆ’Ã†â€™ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬ÃƒÂ¢Ã¢â‚¬Å¾Ã‚Â¢ÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬Ãƒâ€šÃ‚Â ÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¢ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã…Â¡Ãƒâ€šÃ‚Â¬ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã…Â¾Ãƒâ€šÃ‚Â¢ÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã¢â‚¬Â ÃƒÂ¢Ã¢â€šÂ¬Ã¢â€žÂ¢ÃƒÆ’Ã†â€™ÃƒÂ¢Ã¢â€šÂ¬Ã…Â¡ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â¢ÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â¢ÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¢ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã…Â¡Ãƒâ€šÃ‚Â¬ÃƒÆ’Ã¢â‚¬Â¦Ãƒâ€šÃ‚Â¡ÃƒÆ’Ã†â€™ÃƒÂ¢Ã¢â€šÂ¬Ã…Â¡ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â¬ÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â¢ÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¢ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬Ãƒâ€¦Ã‚Â¡ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â¬ÃƒÆ’Ã†â€™ÃƒÂ¢Ã¢â€šÂ¬Ã…Â¡ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â</span>
            </div>
          </div>

          <div className="rounded-2xl bg-zinc-900 p-5 shadow md:col-span-2">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold">Upgrades</h2>
              <div className="text-sm text-zinc-400">Buy to increase sparks/sec</div>
            </div>

            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              {UPGRADE_DEFS.map(def => {
                const level = state.upgrades[def.key] ?? 0;
                const cost = def.baseCost * Math.pow(def.costGrowth, level);
                const affordable = state.sparks >= cost;

                return (
                  <button
                    key={def.key}
                    onClick={() => onBuy(def.key)}
                    className={`rounded-2xl border p-4 text-left transition ${
                      affordable ? "border-zinc-700 bg-zinc-950/40 hover:bg-zinc-950/70" : "border-zinc-800 bg-zinc-950/20 opacity-80"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <div className="font-semibold">{def.name} <span className="text-zinc-400">Lv {level}</span></div>
                        <div className="text-sm text-zinc-400">{def.description}</div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm text-zinc-400">Cost</div>
                        <div className="font-semibold">{format(cost)}</div>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>

            <div className="mt-6 border-t border-zinc-800 pt-5">
              <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                <div>
                  <h3 className="text-lg font-semibold">Phoenix Rebirth</h3>
                  <p className="text-sm text-zinc-400">Reset sparks/upgrades to gain Ash and boost passive gain.</p>
                </div>
                <button
                  onClick={onRebirth}
                  disabled={ashGain <= 0}
                  className={`rounded-2xl px-4 py-3 font-semibold ${
                    ashGain > 0 ? "bg-red-500 text-zinc-950 hover:opacity-90" : "bg-zinc-800 text-zinc-400"
                  }`}
                >
                  Rebirth (+{ashGain} Ash)
                </button>
              </div>

              <div className="mt-4 rounded-2xl bg-zinc-950/40 p-4">
                <div className="text-sm text-zinc-400">Import Save</div>
                <div className="mt-2 flex flex-col gap-2 sm:flex-row">
                  <input
                    value={importText}
                    onChange={e => setImportText(e.target.value)}
                    placeholder="Paste save string"
                    className="w-full rounded-xl bg-zinc-900 px-3 py-2 text-sm outline-none ring-1 ring-zinc-800 focus:ring-zinc-600"
                  />
                  <button onClick={onImport} className="rounded-xl bg-zinc-800 px-4 py-2 text-sm hover:bg-zinc-700">Import</button>
                </div>
              </div>

              <div className="mt-3 text-xs text-zinc-500">
                Local-only MVP. Settings come from /gameData via a local API route.
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
          <StoryOverlay
          open={showStory}
          title="Phoenix Arrival"
          subtitle={phoenix.message || "A milestone event has begun."}
          onClose={()=>setShowStory(false)}
          onGoStory={()=>{ window.location.href="/story"; }}
        />
      
    </>
  );
}