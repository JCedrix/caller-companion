const BASE =
  process.env.NEXT_PUBLIC_BACKEND_URL ?? "http://localhost:8000";

export interface CustomerProfile {
  age: number;
  job: string;
  marital: string;
  education: string;
  has_mortgage: string;
  has_loan: string;
  contact_method: string;
  campaign_contacts: number;
  prior_history: string;
}

export type ConfidenceBand = "high" | "medium" | "low";

export interface Prediction {
  probability: number;
  probability_pct: string;
  confidence_band: ConfidenceBand;
  predicted_label: 0 | 1;
}

export interface Customer {
  customer_index: number;
  profile: CustomerProfile;
  prediction: Prediction;
  talking_points: string[];
}

export interface QueueResponse {
  caller_id: string;
  customers: Customer[];
}

export type OutcomeKind =
  | "no_answer"
  | "voicemail"
  | "callback"
  | "interested"
  | "not_now"
  | "dnc";

export interface OutcomeResponse {
  customer_index: number;
  actual_label: 0 | 1;
  actual_outcome: string;
  predicted_label: 0 | 1;
  predicted_probability: number;
  model_was_right: boolean;
  message: string;
}

async function jsonOrThrow<T>(res: Response): Promise<T> {
  if (!res.ok) {
    const body = await res.text().catch(() => "");
    throw new Error(`HTTP ${res.status}: ${body || res.statusText}`);
  }
  return res.json() as Promise<T>;
}

export async function fetchQueue(
  callerId: string,
  n = 20,
): Promise<QueueResponse> {
  const url = `${BASE}/api/queue?n=${n}&caller_id=${encodeURIComponent(callerId)}`;
  const res = await fetch(url, { cache: "no-store" });
  return jsonOrThrow<QueueResponse>(res);
}

export async function fetchCustomer(index: number): Promise<Customer> {
  const res = await fetch(`${BASE}/api/customer/${index}`, { cache: "no-store" });
  return jsonOrThrow<Customer>(res);
}

export async function submitOutcome(
  customerIndex: number,
  callerId: string,
  outcome: OutcomeKind,
): Promise<OutcomeResponse> {
  const res = await fetch(`${BASE}/api/outcome`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      customer_index: customerIndex,
      caller_id: callerId,
      outcome,
    }),
  });
  return jsonOrThrow<OutcomeResponse>(res);
}
