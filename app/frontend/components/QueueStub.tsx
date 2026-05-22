"use client";

import { useEffect, useState } from "react";
import { fetchQueue, type Customer } from "@/lib/api";

export function QueueStub() {
  const [data, setData] = useState<Customer[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchQueue("demo", 5)
      .then((res) => setData(res.customers))
      .catch((e: unknown) => setError(e instanceof Error ? e.message : String(e)));
  }, []);

  if (error) {
    return (
      <div className="rounded-2xl border border-card-border bg-card p-8">
        <p className="text-text-secondary text-sm">backend unreachable</p>
        <p className="text-band-low text-xs mt-2 font-mono">{error}</p>
      </div>
    );
  }

  if (!data) {
    return <div className="text-text-muted text-sm">loading…</div>;
  }

  return (
    <div className="rounded-2xl border border-card-border bg-card p-8 space-y-4">
      <p className="text-text-secondary text-sm">
        backend returned {data.length} customers for caller_id=demo
      </p>
      <ul className="space-y-2">
        {data.map((c) => (
          <li
            key={c.customer_index}
            className="text-sm text-text-primary tabular-nums flex items-baseline gap-3"
          >
            <span className="text-text-muted">#{c.customer_index}</span>
            <span className="text-text-secondary">
              {c.profile.job} · {c.profile.age}
            </span>
            <span className="ml-auto text-indigo font-semibold">
              {c.prediction.probability_pct}
            </span>
            <span className="text-text-muted text-xs uppercase tracking-wider">
              {c.prediction.confidence_band}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
