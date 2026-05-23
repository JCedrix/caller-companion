import type { OutcomeKind } from "./api";

const KEY = "cc_session_outcomes";

export interface SessionOutcome {
  customer_index: number;
  outcome: OutcomeKind;
  was_right: boolean;
  ts: string;
}

export interface CompletedShift {
  id: string;
  started_at: string;
  ended_at: string;
  outcomes: SessionOutcome[];
  calls_logged: number;
  model_accuracy: number;
}

export interface CallerSession {
  current: SessionOutcome[];
  current_started_at: string | null;
  past: CompletedShift[];
}

type Store = Record<string, CallerSession>;

function emptySession(): CallerSession {
  return { current: [], current_started_at: null, past: [] };
}

function read(): Store {
  if (typeof window === "undefined") return {};
  try {
    const raw = window.localStorage.getItem(KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw) as unknown;
    if (!parsed || typeof parsed !== "object") return {};
    const store: Store = {};
    for (const [callerId, value] of Object.entries(
      parsed as Record<string, unknown>,
    )) {
      if (Array.isArray(value)) {
        store[callerId] = {
          current: value as SessionOutcome[],
          current_started_at: null,
          past: [],
        };
      } else if (value && typeof value === "object") {
        const v = value as Partial<CallerSession>;
        store[callerId] = {
          current: v.current ?? [],
          current_started_at: v.current_started_at ?? null,
          past: v.past ?? [],
        };
      }
    }
    return store;
  } catch {
    return {};
  }
}

function write(s: Store): void {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(KEY, JSON.stringify(s));
}

export function getOutcomes(callerId: string): SessionOutcome[] {
  return (read()[callerId] ?? emptySession()).current;
}

export function appendOutcome(callerId: string, outcome: SessionOutcome): void {
  const store = read();
  const session = store[callerId] ?? emptySession();
  if (session.current_started_at === null) {
    session.current_started_at = outcome.ts;
  }
  session.current = [...session.current, outcome];
  store[callerId] = session;
  write(store);
}

export function clearOutcomes(callerId: string): void {
  const store = read();
  delete store[callerId];
  write(store);
}

export function archiveCurrentShift(callerId: string): void {
  const store = read();
  const session = store[callerId];
  if (!session) return;
  if (session.current.length === 0) {
    if (session.current_started_at !== null) {
      session.current_started_at = null;
      store[callerId] = session;
      write(store);
    }
    return;
  }

  const ended_at = new Date().toISOString();
  const started_at =
    session.current_started_at ?? session.current[0]?.ts ?? ended_at;
  const calls_logged = session.current.length;
  const correct = session.current.filter((o) => o.was_right).length;
  const model_accuracy = Math.round((correct / calls_logged) * 100);

  const completed: CompletedShift = {
    id: ended_at,
    started_at,
    ended_at,
    outcomes: session.current,
    calls_logged,
    model_accuracy,
  };

  session.past = [...session.past, completed];
  session.current = [];
  session.current_started_at = null;
  store[callerId] = session;
  write(store);
}

export function getPastShifts(callerId: string): CompletedShift[] {
  const session = read()[callerId];
  if (!session) return [];
  return [...session.past].reverse();
}
