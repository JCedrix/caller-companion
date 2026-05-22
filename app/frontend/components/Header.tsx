"use client";

import { useEffect, useState } from "react";

const CALLER_KEY = "cc_caller_id";

export function Header() {
  const [caller, setCaller] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    setCaller(localStorage.getItem(CALLER_KEY));
  }, []);

  return (
    <header className="border-b border-card-border">
      <div className="max-w-content mx-auto px-6 py-5 flex items-center justify-between">
        <div className="text-base font-semibold tracking-tight">
          Caller Companion
        </div>
        <div className="text-sm">
          {!mounted ? null : caller ? (
            <span className="text-text-secondary">
              <span className="text-text-muted">caller: </span>
              <span className="text-text-primary capitalize">{caller}</span>
            </span>
          ) : (
            <span className="text-text-muted">no caller selected</span>
          )}
        </div>
      </div>
    </header>
  );
}
