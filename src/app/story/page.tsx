"use client";

import React, { useEffect, useMemo, useState } from "react";
import GameShell from "@/components/GameShell";

type Effect = { var: string; op: string; value: any };
type Hook = { type: string; value: any };
type Choice = { id: string; text: string; effects?: Effect[]; hooks?: Hook[]; next?: string };
type Node =
  | { type: "narration"; text: string[]; next?: string; hooks?: Hook[]; end?: boolean }
  | { type: "dialogue"; speaker: string; text: string; choices: Choice[]; hooks?: Hook[]; end?: boolean };

type Pack = {
  id: string;
  version: string;
  title: string;
  vars_init: Record<string, any>;
  start: string;
  nodes: Record<string, Node>;
};

function applyEffect(vars: Record<string, any>, e: Effect){
  const cur = vars[e.var];
  if(e.op === "+=") vars[e.var] = (typeof cur === "number" ? cur : 0) + Number(e.value);
  else if(e.op === "-=") vars[e.var] = (typeof cur === "number" ? cur : 0) - Number(e.value);
  else if(e.op === "=") vars[e.var] = e.value;
  else vars[e.var] = e.value;
}

function prettyHooks(h?: Hook[]){
  if(!h?.length) return null;
  return (
    <div className="vp-card p-3 text-xs opacity-80">
      <div className="font-semibold mb-1">Hooks triggered</div>
      <ul className="list-disc pl-5 space-y-1">
        {h.map((x,i)=>(<li key={i}><span className="opacity-90">{x.type}</span>: <span className="opacity-70">{JSON.stringify(x.value)}</span></li>))}
      </ul>
    </div>
  );
}

export default function StoryPage(){
  const [pack, setPack] = useState<Pack | null>(null);
  const [nodeId, setNodeId] = useState<string>("");
  const [vars, setVars] = useState<Record<string, any>>({});
  const [log, setLog] = useState<string[]>([]);
  const [lastHooks, setLastHooks] = useState<Hook[] | undefined>(undefined);

  useEffect(()=>{
    (async ()=>{
      const res = await fetch("/content/story/prologue.dialogue.json", { cache: "no-store" });
      const data = (await res.json()) as Pack;
      setPack(data);
      setVars(structuredClone(data.vars_init));
      setNodeId(data.start);
      setLog([`Loaded: ${data.title} (${data.version})`]);
    })().catch((e)=>{
      setLog([`Failed to load story JSON: ${String(e)}`]);
    });
  },[]);

  const node = useMemo(()=> pack?.nodes?.[nodeId], [pack, nodeId]);

  function choose(c: Choice){
    if(!pack || !node) return;

    const nextVars = { ...vars };
    (c.effects || []).forEach(e => applyEffect(nextVars, e));
    setVars(nextVars);

    const hooks = [...(node as any).hooks || [], ...(c.hooks || [])];
    setLastHooks(hooks.length ? hooks : undefined);

    setLog(prev => [
      ...prev,
      `> ${c.text}`,
      ...(c.effects?.length ? c.effects.map(e=>`  effect: ${e.var} ${e.op} ${JSON.stringify(e.value)}`) : []),
      ...(c.hooks?.length ? c.hooks.map(h=>`  hook: ${h.type} ${JSON.stringify(h.value)}`) : []),
    ]);

    if(c.next) setNodeId(c.next);
  }

  function next(){
    if(!pack || !node) return;
    const n: any = node;
    const hooks = n.hooks || [];
    setLastHooks(hooks.length ? hooks : undefined);
    if(n.next) setNodeId(n.next);
  }

  function reset(){
    if(!pack) return;
    setVars(structuredClone(pack.vars_init));
    setNodeId(pack.start);
    setLastHooks(undefined);
    setLog([`Reset: ${pack.title}`]);
  }

  return (
    <GameShell title="Story" subtitle="Dialogue Prototype — click choices, watch variables + hooks.">
      <div className="vp-card-strong p-5 space-y-4">
        <div className="flex flex-wrap gap-2">
          <a className="vp-btn" href="/">Back Home</a>
          <button className="vp-btn" onClick={reset}>Reset Story</button>
        </div>

        {!pack && (
          <div className="vp-card p-4">
            <div className="vp-pill"><span>⏳</span><span>Loading</span></div>
            <p className="opacity-80 text-sm">Fetching story pack…</p>
          </div>
        )}

        {pack && node && (
          <div className="grid gap-4 md:grid-cols-3">
            {/* Main dialogue panel */}
            <div className="md:col-span-2 space-y-3">
              <div className="vp-card p-4 space-y-3">
                <div className="vp-pill"><span>🗣️</span><span>{(node as any).type === "dialogue" ? (node as any).speaker : "Narration"}</span></div>

                {(node as any).type === "narration" ? (
                  <div className="space-y-2 text-sm opacity-90">
                    {(node as any).text.map((t:string, i:number)=>(<p key={i}>{t}</p>))}
                  </div>
                ) : (
                  <p className="text-sm opacity-90">{(node as any).text}</p>
                )}

                {(node as any).type === "narration" && (node as any).next && (
                  <button className="vp-btn" onClick={next}>Continue</button>
                )}

                {(node as any).type === "dialogue" && (
                  <div className="grid gap-2">
                    {(node as any).choices.map((c:Choice)=>(
                      <button key={c.id} className="vp-btn text-left" onClick={()=>choose(c)}>
                        {c.text}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {prettyHooks(lastHooks)}
            </div>

            {/* Vars + log */}
            <div className="space-y-3">
              <div className="vp-card p-4">
                <div className="vp-pill"><span>📟</span><span>State</span></div>
                <div className="text-xs opacity-80 mt-2 space-y-1 max-h-56 overflow-auto">
                  {Object.entries(vars).map(([k,v])=>(
                    <div key={k} className="flex justify-between gap-3">
                      <span className="opacity-90">{k}</span>
                      <span className="opacity-70">{typeof v === "number" ? v.toFixed(2) : String(v)}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="vp-card p-4">
                <div className="vp-pill"><span>🧾</span><span>Log</span></div>
                <div className="text-xs opacity-80 mt-2 space-y-1 max-h-56 overflow-auto whitespace-pre-wrap">
                  {log.map((l,i)=>(<div key={i}>{l}</div>))}
                </div>
              </div>

              <div className="vp-card p-4">
                <div className="vp-pill"><span>📌</span><span>Tip</span></div>
                <p className="text-xs opacity-80">
                  This page reads: <code>/content/story/prologue.dialogue.json</code>.
                  Next step is wiring story milestones into <code>/game</code> as an overlay.
                </p>
              </div>
            </div>
          </div>
        )}

      </div>
    </GameShell>
  );
}