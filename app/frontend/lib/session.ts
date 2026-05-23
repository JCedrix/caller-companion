import type { OutcomeKind } from "./api";

const KEY = "cc_session_outcomes";

export interface SessionOutcome {
  customer_index: number;
  outcome: OutcomeKind;
  was_right: boolean;
  ts: string;
}

type Store = Record<string, SessionOutcome[]>;

function read(): Store {
  if (typeof window === "undefined") return {};
  try {
    const raw = window.localStorage.getItem(KEY);
    if (!raw) return {};
    return JSON.parse(raw) as Store;
  } catch {
    return {};
  }
}

function write(s: Store): void {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(KEY, JSON.stringify(s));
}

export function getOutcomes(callerId: string): SessionOutcome[] {
  return read()[callerId] ?? [];
}

export function appendOutcome(callerId: string, outcome: SessionOutcome): void {
  const store = read();
  const existing = store[callerId] ?? [];
  store[callerId] = [...existing, outcome];
  write(store);
}

export function clearOutcomes(callerId: string): void {
  const store = read();
  delete store[callerId];
  write(store);
}
