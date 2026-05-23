"use client";

import { useState } from "react";
import confetti from "canvas-confetti";
import type { OutcomeKind } from "@/lib/api";

type Tone = "positive" | "negative" | "neutral";

const OUTCOMES: Array<{ key: OutcomeKind; label: string; tone: Tone }> = [
  { key: "no_answer", label: "No Answer", tone: "neutral" },
  { key: "voicemail", label: "Voicemail", tone: "neutral" },
  { key: "callback", label: "Callback", tone: "neutral" },
  { key: "interested", label: "Interested", tone: "positive" },
  { key: "not_now", label: "Not Now", tone: "neutral" },
  { key: "dnc", label: "DNC", tone: "negative" },
];

function buttonClasses(tone: Tone): string {
  const base =
    "rounded-xl border border-card-border bg-card transition-all duration-150 ease-cc text-sm py-3 px-5 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed";
  if (tone === "positive") {
    return `${base} text-positive hover:bg-positive-tint hover:border-positive`;
  }
  if (tone === "negative") {
    return `${base} text-negative hover:bg-negative-tint hover:border-negative`;
  }
  return `${base} text-text-primary hover:border-indigo-bright`;
}

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

    if (kind === "interested") {
      confetti({
        particleCount: 30,
        spread: 60,
        origin: { x: 0.5, y: 0 },
        colors: ["#ff5b4a", "#10b981", "#f59e0b"],
        gravity: 0.6,
        ticks: 150,
        scalar: 0.8,
      });
    }

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
        {OUTCOMES.map(({ key, label, tone }) => (
          <button
            key={key}
            type="button"
            disabled={submitting}
            onClick={() => handle(key)}
            className={buttonClasses(tone)}
          >
            {label}
          </button>
        ))}
      </div>
    </div>
  );
}
