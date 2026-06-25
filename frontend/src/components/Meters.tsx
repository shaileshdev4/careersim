"use client";

import { useEffect, useRef, useState } from "react";
import { MeterDef } from "@careersim/engine";
import { Theme } from "./theme";

export function Meters({
  defs,
  values,
  energy,
  theme,
  variant = "default",
}: {
  defs: MeterDef[];
  values: Record<string, number>;
  energy: number;
  theme: Theme;
  variant?: "default" | "play";
}) {
  const recessive = variant === "play";
  return (
    <div
      className={recessive ? "play-meters" : undefined}
      style={{ display: "flex", flexDirection: "column", gap: recessive ? 10 : 14 }}
    >
      <MeterBar label="Energy" value={energy} theme={theme} recessive={recessive} />
      {defs.map((d) => (
        <MeterBar
          key={d.id}
          label={d.label}
          hint={d.hint}
          value={values[d.id] ?? d.start}
          theme={theme}
          recessive={recessive}
        />
      ))}
    </div>
  );
}

function MeterBar({
  label,
  hint,
  value,
  theme,
  recessive,
}: {
  label: string;
  hint?: string;
  value: number;
  theme: Theme;
  recessive?: boolean;
}) {
  const low = value < 35;
  const prev = useRef(value);
  const [pop, setPop] = useState(false);

  useEffect(() => {
    if (prev.current !== value) {
      prev.current = value;
      setPop(true);
      const t = window.setTimeout(() => setPop(false), 800);
      return () => window.clearTimeout(t);
    }
  }, [value]);

  return (
    <div className="meter-bar" style={{ display: "flex", flexDirection: "column", gap: recessive ? 4 : 5 }}>
      <div
        className={`meter-bar__label eyebrow faint${recessive ? "" : ""}`}
        style={{
          display: "flex",
          justifyContent: "space-between",
          fontSize: recessive ? undefined : 11,
        }}
        title={hint}
      >
        <span>{label}</span>
        <span
          className={`meter-bar__value mono${low ? "" : ""}`}
          style={{ color: low ? theme.accent : undefined }}
        >
          {value}
        </span>
      </div>
      <div
        className={`meter-bar__track${recessive ? "" : ""}`}
        style={
          recessive
            ? undefined
            : {
                height: 5,
                borderRadius: 3,
                background: "rgba(255,255,255,0.08)",
                overflow: "hidden",
              }
        }
      >
        <div
          className={`meter-fill${pop ? " meter-fill--pop" : ""}`}
          style={{
            height: "100%",
            width: `${value}%`,
            background: low ? theme.accent : theme.accentSoft,
            transition: `width var(--meter-ease-s, 0.8s) ease`,
            transformOrigin: "left center",
          }}
        />
      </div>
    </div>
  );
}
