import type { OutcomeResponse } from "@/lib/api";
import type { SessionOutcome } from "@/lib/session";

function labelText(label: 0 | 1): string {
  return label === 1 ? "Subscribed" : "Did not subscribe";
}

export function RevealCard({
  outcome,
  stats,
  onNext,
  onDone,
}: {
  outcome: OutcomeResponse;
  stats: SessionOutcome[];
  onNext: () => void;
  onDone: () => void;
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

        <div className="mt-14 flex items-center justify-center gap-6">
          <button
            type="button"
            onClick={onNext}
            className="bg-indigo hover:bg-indigo-bright transition-colors duration-200 ease-cc text-white font-medium text-sm px-6 py-3 rounded-lg"
          >
            Next customer →
          </button>
          <button
            type="button"
            onClick={onDone}
            className="text-text-muted hover:text-indigo transition-colors duration-200 ease-cc text-xs"
          >
            Done for now
          </button>
        </div>
      </div>
    </div>
  );
}
