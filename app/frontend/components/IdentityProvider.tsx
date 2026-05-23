"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import { CALLER_KEY } from "@/lib/callers";
import { clearOutcomes } from "@/lib/session";

interface IdentityContextValue {
  callerId: string | null;
  mounted: boolean;
  setCaller: (id: string | null) => void;
  splashDismissed: boolean;
  dismissSplash: () => void;
  inShiftSummary: boolean;
  openShiftSummary: () => void;
  resumeShift: () => void;
  endShift: () => void;
}

const IdentityContext = createContext<IdentityContextValue | null>(null);

export function IdentityProvider({ children }: { children: ReactNode }) {
  const [callerId, setCallerId] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);
  const [splashDismissed, setSplashDismissed] = useState(false);
  const [inShiftSummary, setInShiftSummary] = useState(false);

  useEffect(() => {
    setCallerId(localStorage.getItem(CALLER_KEY));
    setMounted(true);
  }, []);

  const setCaller = (id: string | null) => {
    setCallerId(id);
    if (id) {
      localStorage.setItem(CALLER_KEY, id);
    } else {
      localStorage.removeItem(CALLER_KEY);
    }
  };

  const dismissSplash = () => setSplashDismissed(true);
  const openShiftSummary = () => setInShiftSummary(true);
  const resumeShift = () => setInShiftSummary(false);

  const endShift = () => {
    const id = callerId;
    if (id) clearOutcomes(id);
    setCaller(null);
    setInShiftSummary(false);
    setSplashDismissed(false);
  };

  return (
    <IdentityContext.Provider
      value={{
        callerId,
        mounted,
        setCaller,
        splashDismissed,
        dismissSplash,
        inShiftSummary,
        openShiftSummary,
        resumeShift,
        endShift,
      }}
    >
      {children}
    </IdentityContext.Provider>
  );
}

export function useIdentity(): IdentityContextValue {
  const ctx = useContext(IdentityContext);
  if (!ctx) {
    throw new Error("useIdentity must be used inside IdentityProvider");
  }
  return ctx;
}
