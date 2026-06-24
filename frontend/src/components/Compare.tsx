"use client";

import { Career, RunResult } from "@careersim/engine";
import { compareRuns } from "@careersim/engine";
import { themeFor } from "./theme";
import { formatClock } from "@careersim/engine";

// THE PEAK MOMENT. Two completed days, side by side, each in its own living
// palette -and beneath them, the engine's contrast synthesis naming what was
// different. The visceral "same me, two different days" beat.
export function Compare({
  careerA,
  runA,
  careerB,
  runB,
  onBack,
}: {
  careerA: Career;
  runA: RunResult;
  careerB: Career;
  runB: RunResult;
  onBack: () => void;
}) {
  const cmp = compareRuns(careerA, runA, careerB, runB);
  const tA = themeFor(careerA);
  const tB = themeFor(careerB);

  return (
    <div
      className="scene-in"
      style={{ display: "flex", flexDirection: "column", gap: 20 }}
    >
      <div>
        <div className="eyebrow faint">side by side</div>
        <h2
          className="display"
          style={{ fontSize: 24, marginTop: 8, lineHeight: 1.25 }}
        >
          {cmp.headline}
        </h2>
      </div>

      <div
        style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}
        className="cmp-grid"
      >
        <DayPanel career={careerA} run={runA} theme={tA} />
        <DayPanel career={careerB} run={runB} theme={tB} />
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        <div className="eyebrow faint">the difference you felt</div>
        {cmp.contrasts.map((c, i) => (
          <div
            key={i}
            style={{
              fontSize: 15,
              lineHeight: 1.6,
              color: "var(--ink)",
              paddingLeft: 16,
              borderLeft: `2px solid ${i % 2 === 0 ? tA.accent : tB.accent}`,
            }}
          >
            {c}
          </div>
        ))}
      </div>

      <button
        className="choice-btn"
        style={{ width: "auto", alignSelf: "flex-start" }}
        onClick={onBack}
      >
        â† Back
      </button>

      <style>{`@media (max-width: 640px){ .cmp-grid { grid-template-columns: 1fr !important; } }`}</style>
    </div>
  );
}

function DayPanel({
  career,
  run,
  theme,
}: {
  career: Career;
  run: RunResult;
  theme: ReturnType<typeof themeFor>;
}) {
  const e = run.finalState.energy;
  return (
    <div
      className="stage"
      style={{
        // @ts-expect-error custom props
        "--bg": theme.bg,
        "--glow": theme.glow,
        borderRadius: 16,
        border: `1px solid ${theme.edge}`,
        padding: 16,
        minHeight: 200,
        display: "flex",
        flexDirection: "column",
        gap: 12,
      }}
    >
      <div>
        <div
          className="display"
          style={{ fontSize: 17, fontWeight: 600, color: theme.accent }}
        >
          {career.title}
        </div>
        <div className="eyebrow faint" style={{ marginTop: 3 }}>
          {theme.texture} · ended {formatClock(run.finalState.clock)}
        </div>
      </div>

      <div
        style={{
          marginTop: "auto",
          display: "flex",
          flexDirection: "column",
          gap: 9,
        }}
      >
        <PanelBar label="Energy left" value={e} accent={theme.accent} />
        {career.meters.map((m) => (
          <PanelBar
            key={m.id}
            label={m.label}
            value={run.finalState.meters[m.id] ?? 0}
            accent={theme.accent}
          />
        ))}
      </div>
    </div>
  );
}

function PanelBar({
  label,
  value,
  accent,
}: {
  label: string;
  value: number;
  accent: string;
}) {
  return (
    <div>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          marginBottom: 4,
        }}
      >
        <span
          className="eyebrow"
          style={{ fontSize: 10, color: "var(--ink-dim)" }}
        >
          {label}
        </span>
        <span
          className="mono"
          style={{
            fontSize: 11,
            color: value <= 30 ? "#ff8d7a" : "var(--ink-dim)",
          }}
        >
          {Math.round(value)}
        </span>
      </div>
      <div className="bar">
        <span
          style={{
            width: `${Math.max(0, Math.min(100, value))}%`,
            background: accent,
          }}
        />
      </div>
    </div>
  );
}
