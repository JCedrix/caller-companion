"use client";

import { useEffect, useMemo, useState } from "react";
import {
  fetchQueue,
  submitOutcome,
  type Customer,
  type OutcomeKind,
  type OutcomeResponse,
} from "@/lib/api";
import {
  appendOutcome,
  getOutcomes,
  type SessionOutcome,
} from "@/lib/session";
import { useIdentity } from "./IdentityProvider";
import { HeroCard } from "./HeroCard";
import { UpcomingCard } from "./UpcomingCard";
import { StartCallButton } from "./StartCallButton";
import { OutcomeButtons } from "./OutcomeButtons";
import { RevealCard } from "./RevealCard";

type CallState = "queue" | "active" | "reveal";

function sortByProbDesc(customers: Customer[]): Customer[] {
  return [...customers].sort(
    (a, b) => b.prediction.probability - a.prediction.probability,
  );
}

export function QueueView() {
  const { callerId } = useIdentity();
  const [customers, setCustomers] = useState<Customer[] | null>(null);
  const [featuredIdx, setFeaturedIdx] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [callState, setCallState] = useState<CallState>("queue");
  const [lastOutcome, setLastOutcome] = useState<OutcomeResponse | null>(null);
  const [sessionOutcomes, setSessionOutcomes] = useState<SessionOutcome[]>([]);

  useEffect(() => {
    if (!callerId) return;
    setCustomers(null);
    setError(null);
    setFeaturedIdx(0);
    setCallState("queue");
    setLastOutcome(null);
    setSessionOutcomes(getOutcomes(callerId));
    fetchQueue(callerId, 20)
      .then((res) => setCustomers(sortByProbDesc(res.customers)))
      .catch((e: unknown) =>
        setError(e instanceof Error ? e.message : String(e)),
      );
  }, [callerId]);

  const upcoming = useMemo(() => {
    if (!customers) return [];
    return customers.filter((_, i) => i !== featuredIdx).slice(0, 4);
  }, [customers, featuredIdx]);

  const handleStartCall = () => setCallState("active");

  const handleOutcome = async (kind: OutcomeKind) => {
    if (!callerId || !customers) return;
    const featured = customers[featuredIdx];
    const res = await submitOutcome(featured.customer_index, callerId, kind);
    appendOutcome(callerId, {
      customer_index: featured.customer_index,
      outcome: kind,
      was_right: res.model_was_right,
      ts: new Date().toISOString(),
    });
    setSessionOutcomes(getOutcomes(callerId));
    setLastOutcome(res);
    setCallState("reveal");
  };

  const handleNextCustomer = async () => {
    if (!callerId) return;
    setCustomers(null);
    setFeaturedIdx(0);
    setLastOutcome(null);
    setCallState("queue");
    try {
      const res = await fetchQueue(callerId, 20);
      setCustomers(sortByProbDesc(res.customers));
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : String(e));
    }
  };

  const handleDoneForNow = () => {
    if (customers && lastOutcome) {
      const filtered = customers.filter(
        (c) => c.customer_index !== lastOutcome.customer_index,
      );
      setCustomers(filtered);
      setFeaturedIdx(0);
    }
    setLastOutcome(null);
    setCallState("queue");
  };

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

  if (callState === "reveal" && lastOutcome) {
    return (
      <RevealCard
        outcome={lastOutcome}
        stats={sessionOutcomes}
        onNext={handleNextCustomer}
        onDone={handleDoneForNow}
      />
    );
  }

  const featured = customers[featuredIdx];
  const action =
    callState === "active" ? (
      <OutcomeButtons onPick={handleOutcome} />
    ) : (
      <StartCallButton onClick={handleStartCall} />
    );

  return (
    <div className="space-y-6">
      <HeroCard customer={featured} action={action} />
      {callState === "queue" && (
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
      )}
    </div>
  );
}
