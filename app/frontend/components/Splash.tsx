"use client";

import { useEffect, useState } from "react";
import { BlobBackground } from "./BlobBackground";
import { useIdentity } from "./IdentityProvider";

export function Splash() {
  const { dismissSplash } = useIdentity();
  const [visible, setVisible] = useState(false);
  const [exiting, setExiting] = useState(false);

  useEffect(() => {
    const id = requestAnimationFrame(() => setVisible(true));
    return () => cancelAnimationFrame(id);
  }, []);

  const handleBegin = () => {
    if (exiting) return;
    setExiting(true);
    setTimeout(() => dismissSplash(), 300);
  };

  const stageClass = exiting
    ? "opacity-0 scale-95 duration-300"
    : visible
      ? "opacity-100 translate-y-0 duration-[600ms]"
      : "opacity-0 translate-y-2 duration-[600ms]";

  return (
    <BlobBackground>
      <div className={`text-center ease-cc transition-all ${stageClass}`}>
        <h1 className="display-heading text-5xl md:text-6xl">
          Caller Companion
        </h1>
        <p className="text-text-secondary text-base md:text-lg mt-3">
          Ready when you are.
        </p>
        <button
          type="button"
          onClick={handleBegin}
          disabled={exiting}
          className="mt-10 bg-indigo hover:bg-indigo-bright transition-colors duration-200 ease-cc text-white font-medium text-sm px-6 py-3 rounded-lg disabled:opacity-50"
        >
          Begin shift →
        </button>
      </div>
    </BlobBackground>
  );
}
