import type { ConfidenceBand } from "@/lib/api";

const STYLES: Record<ConfidenceBand, string> = {
  high: "bg-indigo-tint text-indigo",
  medium: "bg-amber-tint text-amber",
  low: "bg-white/5 text-band-low",
};

export function ConfidenceBadge({
  band,
  compact = false,
}: {
  band: ConfidenceBand;
  compact?: boolean;
}) {
  return (
    <span
      className={`inline-flex items-center px-2.5 py-1 rounded text-[11px] uppercase tracking-wider font-medium ${STYLES[band]}`}
    >
      {compact ? band : `${band} confidence`}
    </span>
  );
}
