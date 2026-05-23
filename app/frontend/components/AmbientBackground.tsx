"use client";

import { useIdentity } from "./IdentityProvider";

export function AmbientBackground() {
  const { mounted, splashDismissed } = useIdentity();
  if (!mounted || !splashDismissed) return null;

  return (
    <div
      className="fixed inset-0 -z-10 overflow-hidden"
      style={{ mixBlendMode: "screen" }}
      aria-hidden
    >
      <div className="ambient-blob ambient-blob-1" />
      <div className="ambient-blob ambient-blob-2" />
    </div>
  );
}
