"use client";

import { getCallerById } from "@/lib/callers";
import { useIdentity } from "./IdentityProvider";

export function Header() {
  const {
    callerId,
    mounted,
    setCaller,
    splashDismissed,
    inShiftSummary,
    openShiftSummary,
  } = useIdentity();

  if (!mounted) return null;
  if (!splashDismissed) return null;
  if (inShiftSummary) return null;

  const caller = getCallerById(callerId);

  return (
    <header className="border-b border-card-border animate-fade-in">
      <div className="max-w-content mx-auto px-6 py-5 flex items-center justify-between">
        <div className="text-base font-semibold tracking-tight">
          Caller Companion
        </div>
        <div className="text-sm">
          {caller ? (
            <div className="flex items-center gap-3">
              <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-indigo-tint text-indigo font-semibold text-xs">
                {caller.initials}
              </span>
              <span className="text-text-primary">{caller.name}</span>
              <button
                type="button"
                onClick={() => setCaller(null)}
                className="text-text-muted hover:text-indigo transition-colors duration-200 ease-cc text-xs"
              >
                switch
              </button>
              <button
                type="button"
                onClick={openShiftSummary}
                className="text-text-muted hover:text-negative transition-colors duration-200 ease-cc text-xs"
              >
                end shift
              </button>
            </div>
          ) : (
            <span className="text-text-muted">no caller selected</span>
          )}
        </div>
      </div>
    </header>
  );
}
