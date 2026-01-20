"use client";

import React from "react";

export default function StoryOverlay({
  open,
  title,
  subtitle,
  onClose,
  onGoStory
}:{
  open: boolean;
  title: string;
  subtitle?: string;
  onClose: ()=>void;
  onGoStory: ()=>void;
}){
  if(!open) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/70" onClick={onClose} />
      <div className="relative vp-card-strong w-full max-w-xl p-5 space-y-4">
        <div className="vp-pill"><span>🔥</span><span>{title}</span></div>
        {subtitle && <p className="text-sm opacity-80">{subtitle}</p>}

        <div className="vp-card p-4 text-sm opacity-90 space-y-2">
          <p><b>The Phoenix</b> slips between drifting embers into the foreground.</p>
          <p>A sealed ember-sigil lands in your palm. It feels like a promise you didn’t make—yet.</p>
          <p className="text-xs opacity-70">
            Prototype overlay. Next: read story hooks and grant real items/skills/tabs.
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <button className="vp-btn" onClick={onGoStory}>Open Story</button>
          <button className="vp-btn" onClick={onClose}>Not Now</button>
        </div>
      </div>
    </div>
  );
}