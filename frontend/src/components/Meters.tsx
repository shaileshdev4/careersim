"use client";

import { MeterDef } from "@careersim/engine";
import { Theme } from "./theme";

export function Meters({
  defs,
  values,
  energy,
  theme,
}: {
  defs: MeterDef[];
  values: Record<string, number>;
  energy: number;
  theme: Theme;
}) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
      <MeterBar label="Energy" value={energy} theme={theme} />
      {defs.map((d) => (
        <MeterBar
          key={d.id}
          label={d.label}
          hint={d.hint}
          value={values[d.id] ?? d.start}
          theme={theme}
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
}: {
  label: string;
  hint?: string;
  value: number;
  theme: Theme;
}) {
  const low = value < 35;
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          fontSize: 11,
        }}
        className="eyebrow faint"
        title={hint}
      >
        <span>{label}</span>
        <span className="mono" style={{ color: low ? theme.accent : undefined }}>
          {value}
        </span>
      </div>
      <div
        style={{
          height: 5,
          borderRadius: 3,
          background: "rgba(255,255,255,0.08)",
          overflow: "hidden",
        }}
      >
        <div
          className="meter-fill"
          style={{
            height: "100%",
            width: `${value}%`,
            background: low ? theme.accent : theme.accentSoft,
            transition: `width var(--meter-ease-s, 0.8s) ease`,
          }}
        />
      </div>
    </div>
  );
}
