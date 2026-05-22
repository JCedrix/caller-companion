export interface Caller {
  id: string;
  name: string;
  initials: string;
}

export const CALLERS: Caller[] = [
  { id: "jared", name: "Jared", initials: "JR" },
  { id: "jacob", name: "Jacob", initials: "JK" },
  { id: "jack", name: "Jack", initials: "JC" },
  { id: "john", name: "John", initials: "JO" },
];

export const CALLER_KEY = "cc_caller_id";

export function getCallerById(id: string | null): Caller | null {
  if (!id) return null;
  return CALLERS.find((c) => c.id === id) ?? null;
}
