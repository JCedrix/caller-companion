"use client";

import { useIdentity } from "@/components/IdentityProvider";
import { Splash } from "@/components/Splash";
import { ShiftSummary } from "@/components/ShiftSummary";
import { ShiftHistory } from "@/components/ShiftHistory";
import { IdentityPicker } from "@/components/IdentityPicker";
import { QueueView } from "@/components/QueueView";

export default function HomePage() {
  const { callerId, mounted, splashDismissed, inShiftSummary, inShiftHistory } =
    useIdentity();

  if (!mounted) return null;
  if (!splashDismissed) return <Splash />;
  if (inShiftHistory) return <ShiftHistory />;
  if (inShiftSummary) return <ShiftSummary />;
  if (!callerId) return <IdentityPicker />;
  return <QueueView />;
}
