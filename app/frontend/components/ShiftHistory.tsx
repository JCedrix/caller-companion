"use client";

import { useEffect, useState } from "react";
import type { OutcomeKind } from "@/lib/api";
import { getCallerById } from "@/lib/callers";
import { getPastShifts, type CompletedShift } from "@/lib/session";
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

function formatDate(iso: string): string {
  const d = new Date(iso);
  const month = d.toLocaleString("en-US", { month: "short" });
  const day = d.getDate();
  const year = d.getFullYear();
  const time = d.toLocaleString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
  return `${month} ${day}, ${year} · ${time}`;
}

function formatDuration(startedAt: string, endedAt: string): string {
  const ms = Date.parse(endedAt) - Date.parse(startedAt);
  const totalMinutes = Math.max(0, Math.floor(ms / 60000));
  const h = Math.floor(totalMinutes / 60);
  const m = totalMinutes % 60;
  if (h === 0) return `${m}m`;
  return `${h}h ${m}m`;
}

function PastShiftCard({ shift }: { shift: CompletedShift }) {
  const [expanded, setExpanded] = useState(false);

  const counts = ALL_OUTCOMES.reduce(
    (acc, k) => {
      acc[k] = shift.outcomes.filter((o) => o.outcome === k).length;
      return acc;
    },
    {} as Record<OutcomeKind, number>,
  );

  const visibleBreakdown = ALL_OUTCOMES.filter((k) => counts[k] > 0);

  return (
    <div className="rounded-2xl border border-card-border bg-card p-6">
      <div className="flex items-baseline justify-between mb-5">
        <div className="text-text-primary text-sm tabular-nums">
          {formatDate(shift.id)}
        </div>
        <div className="text-text-muted text-xs tabular-nums">
          {formatDuration(shift.started_at, shift.ended_at)}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-6 mb-5">
        <div>
          <div className="text-text-muted text-[10px] uppercase tracking-wider mb-1">
            Calls logged
          </div>
          <div className="text-text-primary text-2xl font-bold tabular-nums">
            {shift.calls_logged}
          </div>
        </div>
        <div>
          <div className="text-text-muted text-[10px] uppercase tracking-wider mb-1">
            Model accuracy
          </div>
          <div
            className={`text-2xl font-bold tabular-nums ${accuracyColor(shift.model_accuracy)}`}
          >
            {shift.model_accuracy}%
          </div>
        </div>
      </div>

      {visibleBreakdown.length > 0 && (
        <>
          <button
            type="button"
            onClick={() => setExpanded(!expanded)}
            className="text-text-muted hover:text-indigo transition-colors duration-200 ease-cc text-xs flex items-center gap-2"
          >
            <span>{expanded ? "▾" : "▸"}</span>
            <span>{expanded ? "Hide breakdown" : "Show breakdown"}</span>
          </button>

          {expanded && (
            <ul className="mt-4 space-y-2 animate-fade-in">
              {visibleBreakdown.map((kind) => (
                <li key={kind} className="flex items-center gap-3 text-sm">
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
          )}
        </>
      )}
    </div>
  );
}

export function ShiftHistory() {
  const { callerId, closeShiftHistory } = useIdentity();
  const [shifts, setShifts] = useState<CompletedShift[]>([]);

  useEffect(() => {
    if (callerId) setShifts(getPastShifts(callerId));
  }, [callerId]);

  const caller = getCallerById(callerId);

  return (
    <BlobBackground>
      <div className="w-full max-w-2xl">
        <div className="text-center mb-10">
          {caller && (
            <div className="flex items-center justify-center gap-3 mb-6">
              <span className="inline-flex items-center justify-center w-9 h-9 rounded-full bg-indigo-tint text-indigo font-semibold text-sm">
                {caller.initials}
              </span>
              <span className="text-text-primary text-base">{caller.name}</span>
            </div>
          )}
          <h1 className="display-heading text-4xl md:text-5xl">Past shifts</h1>
        </div>

        {shifts.length === 0 ? (
          <div className="rounded-3xl border border-card-border bg-card p-10 text-center">
            <p className="text-text-secondary text-sm">
              No completed shifts yet. End your current shift to start building
              history.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {shifts.map((shift) => (
              <PastShiftCard key={shift.id} shift={shift} />
            ))}
          </div>
        )}

        <div className="flex justify-center mt-10">
          <button
            type="button"
            onClick={closeShiftHistory}
            className="border border-card-border bg-transparent hover:border-indigo-bright text-text-primary text-sm px-6 py-3 rounded-lg transition-all duration-200 ease-cc"
          >
            Back to summary
          </button>
        </div>
      </div>
    </BlobBackground>
  );
}
