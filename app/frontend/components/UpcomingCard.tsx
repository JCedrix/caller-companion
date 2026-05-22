import type { ConfidenceBand, Customer } from "@/lib/api";
import { ConfidenceBadge } from "./ConfidenceBadge";

const PROB_COLOR: Record<ConfidenceBand, string> = {
  high: "text-indigo",
  medium: "text-amber",
  low: "text-band-low",
};

export function UpcomingCard({
  customer,
  onSelect,
}: {
  customer: Customer;
  onSelect: () => void;
}) {
  const band = customer.prediction.confidence_band;
  return (
    <button
      type="button"
      onClick={onSelect}
      className="rounded-2xl border border-card-border bg-card p-4 text-left transition-all duration-200 ease-cc hover:scale-[1.02] hover:border-indigo-bright focus:outline-none focus:border-indigo flex flex-col gap-3 min-h-[140px]"
    >
      <div className="text-text-muted text-xs tabular-nums">
        #{customer.customer_index}
      </div>
      <div className="text-sm text-text-primary leading-snug">
        {customer.profile.job}
        <span className="text-text-muted"> · {customer.profile.age}</span>
      </div>
      <div className="flex items-end justify-between mt-auto">
        <ConfidenceBadge band={band} compact />
        <div
          className={`text-2xl font-bold tabular-nums leading-none ${PROB_COLOR[band]}`}
        >
          {customer.prediction.probability_pct}
        </div>
      </div>
    </button>
  );
}
