import "./globals.css";
import type { Metadata } from "next";
import React from "react";

export const metadata: Metadata = {
  title: "VoidPhoenix",
  description: "Ignite. Ascend. Rebirth.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="vp-crt">{children}</body>
    </html>
  );
}
