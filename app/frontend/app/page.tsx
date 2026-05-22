"use client";

import { useIdentity } from "@/components/IdentityProvider";
import { IdentityPicker } from "@/components/IdentityPicker";
import { QueueView } from "@/components/QueueView";

export default function HomePage() {
  const { callerId, mounted } = useIdentity();

  if (!mounted) return null;
  if (!callerId) return <IdentityPicker />;
  return <QueueView />;
}
