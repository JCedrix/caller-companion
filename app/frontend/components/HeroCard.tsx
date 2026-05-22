import type { ConfidenceBand, Customer, CustomerProfile } from "@/lib/api";
import { ConfidenceBadge } from "./ConfidenceBadge";

const PROB_COLOR: Record<ConfidenceBand, string> = {
  high: "text-indigo",
  medium: "text-amber",
  low: "text-band-low",
};

const PROFILE_FIELDS: Array<{ label: string; key: keyof CustomerProfile }> = [
  { label: "Age", key: "age" },
  { label: "Job", key: "job" },
  { label: "Marital", key: "marital" },
  { label: "Education", key: "education" },
  { label: "Mortgage", key: "has_mortgage" },
  { label: "Personal loan", key: "has_loan" },
  { label: "Contact via", key: "contact_method" },
  { label: "Campaign #", key: "campaign_contacts" },
  { label: "History", key: "prior_history" },
];

function ColumnLabel({ children }: { children: React.ReactNode }) {
  return (
    <div className="text-text-muted text-[11px] uppercase tracking-wider font-medium mb-4">
      {children}
    </div>
  );
}

function capitalize(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

function ProfileValue({
  fieldKey,
  value,
}: {
  fieldKey: keyof CustomerProfile;
  value: string | number;
}) {
  if (fieldKey === "prior_history" && typeof value === "string") {
    const isActionable =
      value.startsWith("Subscribed") || value.startsWith("Declined");
    if (isActionable) {
      return (
        <span className="inline-flex items-center px-2 py-0.5 rounded bg-indigo-tint text-indigo font-medium">
          {value}
        </span>
      );
    }
    return <span className="text-text-secondary">{value}</span>;
  }
  if (
    (fieldKey === "has_mortgage" || fieldKey === "has_loan") &&
    typeof value === "string"
  ) {
    return <span>{capitalize(value)}</span>;
  }
  return <span>{String(value)}</span>;
}

export function HeroCard({ customer }: { customer: Customer }) {
  const band = customer.prediction.confidence_band;

  return (
    <div
      key={customer.customer_index}
      className="rounded-3xl border border-card-border bg-card p-8 md:p-10 animate-fade-in"
    >
      <div className="flex items-start justify-between mb-8">
        <div className="text-text-muted text-sm tabular-nums">
          Customer #{customer.customer_index}
        </div>
        <ConfidenceBadge band={band} />
      </div>

      <div className="grid md:grid-cols-2 gap-10">
        <div>
          <ColumnLabel>Profile</ColumnLabel>
          <dl className="grid grid-cols-[auto_1fr] gap-x-6 gap-y-3 text-sm">
            {PROFILE_FIELDS.map(({ label, key }) => (
              <div key={key} className="contents">
                <dt className="text-text-muted text-xs uppercase tracking-wider self-center">
                  {label}
                </dt>
                <dd className="text-text-primary self-center">
                  <ProfileValue fieldKey={key} value={customer.profile[key]} />
                </dd>
              </div>
            ))}
          </dl>
        </div>

        <div>
          <ColumnLabel>Briefing</ColumnLabel>
          <div className="mb-8">
            <div
              className={`text-6xl md:text-7xl font-bold tabular-nums leading-none ${PROB_COLOR[band]}`}
            >
              {customer.prediction.probability_pct}
            </div>
            <div className="mt-4">
              <ConfidenceBadge band={band} />
            </div>
          </div>

          <ColumnLabel>Talking points</ColumnLabel>
          <ul className="space-y-3">
            {customer.talking_points.map((point, i) => (
              <li
                key={i}
                className="text-sm text-text-primary leading-relaxed pl-4 relative before:content-['•'] before:absolute before:left-0 before:text-indigo before:font-bold"
              >
                {point}
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="flex justify-end mt-10">
        <button
          type="button"
          onClick={() => {}}
          className="bg-indigo hover:bg-indigo-bright transition-colors duration-200 ease-cc text-white font-medium text-sm px-6 py-3 rounded-lg"
        >
          Start call →
        </button>
      </div>
    </div>
  );
}
