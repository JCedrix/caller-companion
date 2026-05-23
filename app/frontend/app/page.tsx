"use client";

import { useIdentity } from "@/components/IdentityProvider";
import { Splash } from "@/components/Splash";
import { IdentityPicker } from "@/components/IdentityPicker";
import { QueueView } from "@/components/QueueView";

export default function HomePage() {
  const { callerId, mounted, splashDismissed } = useIdentity();

  if (!mounted) return null;
  if (!splashDismissed) return <Splash />;
  if (!callerId) return <IdentityPicker />;
  return <QueueView />;
}
