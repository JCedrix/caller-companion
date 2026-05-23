import type { OutcomeKind, OutcomeResponse } from "@/lib/api";
import type { SessionOutcome } from "@/lib/session";

function labelText(label: 0 | 1): string {
  return label === 1 ? "Subscribed" : "Did not subscribe";
}

const OUTCOME_LABELS: Record<OutcomeKind, string> = {
  no_answer: "No Answer",
  voicemail: "Voicemail",
  callback: "Callback",
  interested: "Interested",
  not_now: "Not Now",
  dnc: "DNC",
};

function chipClasses(kind: OutcomeKind): string {
  const base =
    "inline-flex items-center px-2.5 py-1 rounded text-xs font-medium";
  if (kind === "interested") return `${base} bg-positive-tint text-positive`;
  if (kind === "dnc") return `${base} bg-negative-tint text-negative`;
  return `${base} bg-white/5 text-text-secondary`;
}

export function RevealCard({
  outcome,
  agentOutcome,
  stats,
  onNext,
  onEndShift,
}: {
  outcome: OutcomeResponse;
  agentOutcome: OutcomeKind;
  stats: SessionOutcome[];
  onNext: () => void;
  onEndShift: () => void;
}) {
  const wasRight = outcome.model_was_right;
  const headlineColor = wasRight ? "text-indigo" : "text-amber";
  const headlineText = wasRight ? "Model was right" : "Model was wrong";

  const total = stats.length;
  const correct = stats.filter((s) => s.was_right).length;
  const accuracy = total > 0 ? Math.round((correct / total) * 100) : 0;

  const predictedPct = Math.round(outcome.predicted_probability * 100);

  return (
    <div className="rounded-3xl border border-card-border bg-card animate-fade-in">
      <div className="max-w-2xl mx-auto px-8 py-20 md:py-28 text-center">
        <h2
          className={`text-5xl md:text-6xl font-bold tracking-tight ${headlineColor}`}
        >
          {headlineText}
        </h2>

        <dl className="mt-12 grid grid-cols-[auto_1fr] gap-x-8 gap-y-3 text-sm max-w-md mx-auto text-left">
          <dt className="text-text-muted text-xs uppercase tracking-wider self-center">
            Model predicted
          </dt>
          <dd className="text-text-primary">
            {labelText(outcome.predicted_label)}{" "}
            <span className="text-text-muted tabular-nums">
              ({predictedPct}%)
            </span>
          </dd>
          <dt className="text-text-muted text-xs uppercase tracking-wider self-center">
            Actual outcome
          </dt>
          <dd className="text-text-primary">{outcome.actual_outcome}</dd>
          <dt className="text-text-muted text-xs uppercase tracking-wider self-center">
            You logged
          </dt>
          <dd>
            <span className={chipClasses(agentOutcome)}>
              {OUTCOME_LABELS[agentOutcome]}
            </span>
          </dd>
        </dl>

        <p className="mt-8 text-text-secondary text-sm max-w-md mx-auto leading-relaxed">
          {outcome.message}
        </p>

        <div className="mt-12 flex gap-12 justify-center">
          <div>
            <div className="text-text-muted text-[11px] uppercase tracking-wider mb-1">
              Calls logged
            </div>
            <div className="text-text-primary text-3xl font-bold tabular-nums">
              {total}
            </div>
          </div>
          <div>
            <div className="text-text-muted text-[11px] uppercase tracking-wider mb-1">
              Model accuracy
            </div>
            <div className="text-text-primary text-3xl font-bold tabular-nums">
              {accuracy}%
            </div>
          </div>
        </div>

        <div className="mt-14 flex items-center justify-center gap-4">
          <button
            type="button"
            onClick={onNext}
            className="bg-indigo hover:bg-indigo-bright transition-colors duration-200 ease-cc text-white font-medium text-sm px-6 py-3 rounded-lg"
          >
            Next customer →
          </button>
          <button
            type="button"
            onClick={onEndShift}
            className="border border-card-border bg-transparent hover:border-negative hover:text-negative text-text-secondary text-sm px-6 py-3 rounded-lg transition-all duration-200 ease-cc"
          >
            End shift
          </button>
        </div>
      </div>
    </div>
  );
}
