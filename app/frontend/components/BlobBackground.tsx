"use client";

import type { ReactNode } from "react";

export function BlobBackground({ children }: { children: ReactNode }) {
  return (
    <div className="fixed inset-0 bg-bg overflow-hidden">
      <div
        className="absolute inset-0"
        style={{ mixBlendMode: "screen" }}
        aria-hidden
      >
        <div className="blob blob-1" />
        <div className="blob blob-2" />
        <div className="blob blob-3" />
      </div>
      <div className="relative z-10 min-h-screen flex items-center justify-center px-6">
        {children}
      </div>
    </div>
  );
}
