"use client";

import React from "react";

type GameShellProps = {
  title?: string;
  subtitle?: string;
  children: React.ReactNode;
};

export default function GameShell({ title, subtitle, children }: GameShellProps) {
  return (
    <div className="min-h-screen w-full">
      <div className="vp-shell px-4 py-6 max-w-6xl mx-auto">
        {(title || subtitle) && (
          <header className="mb-5 space-y-2">
            {title && <h1 className="text-2xl font-bold tracking-tight">{title}</h1>}
            {subtitle && <p className="text-sm opacity-80">{subtitle}</p>}
          </header>
        )}
        {children}
      </div>
    </div>
  );
}
