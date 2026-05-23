"use client";

import { CALLERS } from "@/lib/callers";
import { useIdentity } from "./IdentityProvider";

export function IdentityPicker() {
  const { setCaller, openShiftHistory } = useIdentity();

  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center">
      <div className="text-center mb-10">
        <h1 className="text-3xl font-semibold tracking-tight">
          Who&apos;s calling?
        </h1>
        <p className="text-text-secondary text-sm mt-2">
          Pick your identity to start the shift.
        </p>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6 w-full max-w-2xl">
        {CALLERS.map((c) => (
          <button
            key={c.id}
            type="button"
            onClick={() => setCaller(c.id)}
            className="rounded-2xl border border-card-border bg-card p-6 flex flex-col items-center gap-3 transition-all duration-200 ease-cc hover:scale-[1.03] hover:border-indigo-bright focus:outline-none focus:border-indigo"
          >
            <span className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-indigo-tint text-indigo text-xl font-semibold tracking-wide">
              {c.initials}
            </span>
            <span className="text-base font-medium">{c.name}</span>
          </button>
        ))}
      </div>
      <div className="mt-10">
        <button
          type="button"
          onClick={openShiftHistory}
          className="border border-card-border bg-transparent hover:border-indigo-bright text-text-secondary hover:text-text-primary text-sm px-6 py-3 rounded-lg transition-all duration-200 ease-cc"
        >
          View past shifts
        </button>
      </div>
    </div>
  );
}
