"use client";

import { useEffect, useMemo, useState } from "react";
import { fetchQueue, type Customer } from "@/lib/api";
import { useIdentity } from "./IdentityProvider";
import { HeroCard } from "./HeroCard";
import { UpcomingCard } from "./UpcomingCard";

export function QueueView() {
  const { callerId } = useIdentity();
  const [customers, setCustomers] = useState<Customer[] | null>(null);
  const [featuredIdx, setFeaturedIdx] = useState(0);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!callerId) return;
    setCustomers(null);
    setError(null);
    setFeaturedIdx(0);
    fetchQueue(callerId, 20)
      .then((res) => {
        const sorted = [...res.customers].sort(
          (a, b) => b.prediction.probability - a.prediction.probability,
        );
        setCustomers(sorted);
      })
      .catch((e: unknown) =>
        setError(e instanceof Error ? e.message : String(e)),
      );
  }, [callerId]);

  const upcoming = useMemo(() => {
    if (!customers) return [];
    return customers.filter((_, i) => i !== featuredIdx).slice(0, 4);
  }, [customers, featuredIdx]);

  if (error) {
    return (
      <div className="rounded-2xl border border-card-border bg-card p-8">
        <p className="text-text-secondary text-sm">backend unreachable</p>
        <p className="text-band-low text-xs mt-2 font-mono">{error}</p>
      </div>
    );
  }

  if (!customers) {
    return <div className="text-text-muted text-sm">Loading queue…</div>;
  }

  if (customers.length === 0) {
    return (
      <div className="text-text-muted text-sm">
        No customers in queue. Switch identity or refresh to refetch.
      </div>
    );
  }

  const featured = customers[featuredIdx];

  return (
    <div className="space-y-6">
      <HeroCard customer={featured} />
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {upcoming.map((c) => (
          <UpcomingCard
            key={c.customer_index}
            customer={c}
            onSelect={() => {
              const idx = customers.findIndex(
                (x) => x.customer_index === c.customer_index,
              );
              if (idx >= 0) setFeaturedIdx(idx);
            }}
          />
        ))}
      </div>
    </div>
  );
}
