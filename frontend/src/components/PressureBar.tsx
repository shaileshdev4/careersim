"use client";

import { useEffect, useRef, useState } from "react";
import { BeatPressure } from "@careersim/engine";
import { Theme } from "./theme";

export function PressureBar({
  pressure,
  theme,
  paused,
  highlight,
  onExpire,
}: {
  pressure: BeatPressure;
  theme: Theme;
  paused: boolean;
  highlight?: boolean;
  onExpire: () => void;
}) {
  const [remaining, setRemaining] = useState(pressure.deadlineSeconds);
  const fired = useRef(false);

  useEffect(() => {
    fired.current = false;
    setRemaining(pressure.deadlineSeconds);
  }, [pressure.deadlineSeconds, pressure.defaultChoiceId]);

  useEffect(() => {
    if (paused || fired.current) return;
    if (remaining <= 0) {
      fired.current = true;
      onExpire();
      return;
    }
    const t = window.setTimeout(() => setRemaining((r) => r - 1), 1000);
    return () => window.clearTimeout(t);
  }, [remaining, paused, onExpire]);

  const pct = (remaining / pressure.deadlineSeconds) * 100;
  const urgent = remaining <= 10;

  return (
    <div
      className={highlight ? "pressure-bar--highlight" : undefined}
      style={{ display: "flex", flexDirection: "column", gap: 6 }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "baseline",
          fontSize: 11,
        }}
        className="eyebrow faint"
      >
        <span>{pressure.label}</span>
        <span
          className="mono"
          style={{ color: urgent ? theme.accent : undefined }}
        >
          {remaining}s
        </span>
      </div>
      <div
        style={{
          height: 4,
          borderRadius: 2,
          background: "rgba(255,255,255,0.1)",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            height: "100%",
            width: `${pct}%`,
            background: urgent ? theme.accent : theme.accentSoft,
            transition: "width 1s linear, background 0.3s ease",
          }}
        />
      </div>
    </div>
  );
}
