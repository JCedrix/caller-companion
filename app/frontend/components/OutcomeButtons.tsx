"use client";

import { useState } from "react";
import type { OutcomeKind } from "@/lib/api";

const OUTCOMES: Array<{ key: OutcomeKind; label: string }> = [
  { key: "no_answer", label: "No Answer" },
  { key: "voicemail", label: "Voicemail" },
  { key: "callback", label: "Callback" },
  { key: "interested", label: "Interested" },
  { key: "not_now", label: "Not Now" },
  { key: "dnc", label: "DNC" },
];

export function OutcomeButtons({
  onPick,
}: {
  onPick: (kind: OutcomeKind) => Promise<void>;
}) {
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handle = async (kind: OutcomeKind) => {
    setSubmitting(true);
    setError(null);
    try {
      await onPick(kind);
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
      setSubmitting(false);
    }
  };

  return (
    <div>
      {error && (
        <div className="mb-4 text-amber text-xs">
          Failed to submit outcome: {error}. Try again.
        </div>
      )}
      <div className="grid grid-cols-3 gap-3">
        {OUTCOMES.map(({ key, label }) => (
          <button
            key={key}
            type="button"
            disabled={submitting}
            onClick={() => handle(key)}
            className="rounded-xl border border-card-border bg-card hover:border-indigo-bright transition-all duration-150 ease-cc text-sm text-text-primary py-3 px-5 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {label}
          </button>
        ))}
      </div>
    </div>
  );
}
