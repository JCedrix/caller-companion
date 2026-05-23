"use client";

import { useEffect, useState } from "react";
import type { OutcomeKind } from "@/lib/api";
import { getCallerById } from "@/lib/callers";
import { getOutcomes, type SessionOutcome } from "@/lib/session";
import { BlobBackground } from "./BlobBackground";
import { useIdentity } from "./IdentityProvider";

const ALL_OUTCOMES: OutcomeKind[] = [
  "interested",
  "callback",
  "voicemail",
  "no_answer",
  "not_now",
  "dnc",
];

const OUTCOME_LABELS: Record<OutcomeKind, string> = {
  no_answer: "No Answer",
  voicemail: "Voicemail",
  callback: "Callback",
  interested: "Interested",
  not_now: "Not Now",
  dnc: "DNC",
};

const POSITIVE = new Set<OutcomeKind>(["interested", "callback"]);
const NEGATIVE = new Set<OutcomeKind>(["dnc"]);

function dotColor(kind: OutcomeKind): string {
  if (POSITIVE.has(kind)) return "bg-positive";
  if (NEGATIVE.has(kind)) return "bg-negative";
  return "bg-text-muted";
}

function accuracyColor(pct: number): string {
  if (pct >= 70) return "text-positive";
  if (pct >= 40) return "text-amber";
  return "text-text-secondary";
}

export function ShiftSummary() {
  const { callerId, resumeShift, endShift, openShiftHistory } = useIdentity();
  const [outcomes, setOutcomes] = useState<SessionOutcome[]>([]);

  useEffect(() => {
    if (callerId) setOutcomes(getOutcomes(callerId));
  }, [callerId]);

  const caller = getCallerById(callerId);
  const total = outcomes.length;
  const correct = outcomes.filter((o) => o.was_right).length;
  const accuracy = total > 0 ? Math.round((correct / total) * 100) : 0;

  const counts = ALL_OUTCOMES.reduce(
    (acc, k) => {
      acc[k] = outcomes.filter((o) => o.outcome === k).length;
      return acc;
    },
    {} as Record<OutcomeKind, number>,
  );

  const visibleBreakdown = ALL_OUTCOMES.filter((k) => counts[k] > 0);

  return (
    <BlobBackground>
      <div className="w-full max-w-xl text-center">
        {caller && (
          <div className="flex items-center justify-center gap-3 mb-6">
            <span className="inline-flex items-center justify-center w-9 h-9 rounded-full bg-indigo-tint text-indigo font-semibold text-sm">
              {caller.initials}
            </span>
            <span className="text-text-primary text-base">{caller.name}</span>
          </div>
        )}

        <h1 className="display-heading text-4xl md:text-5xl">
          Shift summary
        </h1>

        <div className="rounded-3xl border border-card-border bg-card p-8 mt-10 text-left">
          {total === 0 ? (
            <p className="text-text-secondary text-sm">No calls logged yet.</p>
          ) : (
            <>
              <div className="grid grid-cols-2 gap-8 mb-8">
                <div>
                  <div className="text-text-muted text-[11px] uppercase tracking-wider mb-2">
                    Calls logged
                  </div>
                  <div className="text-text-primary text-4xl font-bold tabular-nums">
                    {total}
                  </div>
                </div>
                <div>
                  <div className="text-text-muted text-[11px] uppercase tracking-wider mb-2">
                    Model accuracy
                  </div>
                  <div
                    className={`text-4xl font-bold tabular-nums ${accuracyColor(accuracy)}`}
                  >
                    {accuracy}%
                  </div>
                </div>
              </div>

              {visibleBreakdown.length > 0 && (
                <div className="border-t border-card-border pt-6">
                  <div className="text-text-muted text-[11px] uppercase tracking-wider mb-3">
                    Breakdown
                  </div>
                  <ul className="space-y-2.5">
                    {visibleBreakdown.map((kind) => (
                      <li
                        key={kind}
                        className="flex items-center gap-3 text-sm"
                      >
                        <span
                          className={`w-2 h-2 rounded-full ${dotColor(kind)}`}
                        />
                        <span className="text-text-primary flex-1">
                          {OUTCOME_LABELS[kind]}
                        </span>
                        <span className="text-text-primary tabular-nums">
                          {counts[kind]}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </>
          )}
        </div>

        <div className="flex items-center justify-center gap-4 mt-10">
          <button
            type="button"
            onClick={resumeShift}
            className="border border-card-border bg-transparent hover:border-indigo-bright text-text-primary text-sm px-6 py-3 rounded-lg transition-all duration-200 ease-cc"
          >
            Resume shift
          </button>
          <button
            type="button"
            onClick={endShift}
            className="bg-indigo hover:bg-indigo-bright text-white font-medium text-sm px-6 py-3 rounded-lg transition-colors duration-200 ease-cc"
          >
            End shift
          </button>
        </div>

        <div className="mt-5">
          <button
            type="button"
            onClick={openShiftHistory}
            className="text-text-muted hover:text-indigo transition-colors duration-200 ease-cc text-xs"
          >
            View past shifts
          </button>
        </div>
      </div>
    </BlobBackground>
  );
}
