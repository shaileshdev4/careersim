"use client";

import { Career, RunResult } from "@careersim/engine";
import { reflect } from "@careersim/engine";
import { CAREERS } from "@careersim/engine";
import { Theme } from "./theme";

// The end-of-day debrief: reads the player's choices back to them. Descriptive,
// honest, never a verdict -a mirror, per the design brief.
export function Debrief({
  career,
  result,
  theme,
  onTryAdjacent,
  onReplay,
  onCompare,
}: {
  career: Career;
  result: RunResult;
  theme: Theme;
  onTryAdjacent: (careerId: string) => void;
  onReplay: () => void;
  onCompare: () => void;
}) {
  const r = reflect(career, result);

  return (
    <div
      className="scene-in"
      style={{ display: "flex", flexDirection: "column", gap: 22 }}
    >
      <div>
        <div className="eyebrow" style={{ color: theme.accent }}>
          end of day Â· {career.title.toLowerCase()}
        </div>
        <h2
          className="display"
          style={{ fontSize: 25, marginTop: 8, lineHeight: 1.25 }}
        >
          {r.pattern}
        </h2>
      </div>

      <div>
        <div className="eyebrow faint" style={{ marginBottom: 10 }}>
          what the day pressed on
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {r.leans
            .filter((l) => l.count > 0)
            .map((l) => (
              <LeanRow
                key={l.tension.id}
                label={l.tension.label}
                poleA={l.tension.poleA}
                poleB={l.tension.poleB}
                score={l.score}
                theme={theme}
              />
            ))}
        </div>
      </div>

      <div>
        <div className="eyebrow faint" style={{ marginBottom: 8 }}>
          worth weighing
        </div>
        <ul
          style={{
            display: "flex",
            flexDirection: "column",
            gap: 8,
            listStyle: "none",
          }}
        >
          {r.fitSignals.map((s, i) => (
            <li
              key={i}
              style={{
                fontSize: 14.5,
                lineHeight: 1.55,
                color: "var(--ink)",
                paddingLeft: 16,
                position: "relative",
              }}
            >
              <span
                style={{ position: "absolute", left: 0, color: theme.accent }}
              >
                Â·
              </span>
              {s}
            </li>
          ))}
        </ul>
      </div>

      <div>
        <div className="eyebrow faint" style={{ marginBottom: 10 }}>
          if that was you, try a day as
        </div>
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
          {r.adjacent.map((a) => {
            const c = CAREERS[a.careerId];
            if (!c) return null;
            return (
              <button
                key={a.careerId}
                className="choice-btn"
                style={{ width: "auto", maxWidth: 300 }}
                onClick={() => onTryAdjacent(a.careerId)}
                title={a.reason}
              >
                <span style={{ color: c.mood.accent, fontWeight: 600 }}>
                  {c.title}
                </span>
                <span
                  className="dim"
                  style={{
                    display: "block",
                    fontSize: 12.5,
                    marginTop: 3,
                    lineHeight: 1.4,
                  }}
                >
                  {a.reason}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      <p
        className="dim"
        style={{
          fontSize: 13,
          lineHeight: 1.55,
          borderTop: "1px solid rgba(255,255,255,0.08)",
          paddingTop: 14,
        }}
      >
        {r.caveat}
      </p>

      <div style={{ display: "flex", gap: 10 }}>
        <button
          className="choice-btn"
          style={{
            width: "auto",
            background: theme.accentSoft,
            borderColor: theme.edge,
          }}
          onClick={onCompare}
        >
          Compare two days side by side â†’
        </button>
        <button
          className="choice-btn"
          style={{ width: "auto" }}
          onClick={onReplay}
        >
          Replay this day differently
        </button>
      </div>
    </div>
  );
}

function LeanRow({
  label,
  poleA,
  poleB,
  score,
  theme,
}: {
  label: string;
  poleA: string;
  poleB: string;
  score: number; // -1..+1, +1 = poleA
  theme: Theme;
}) {
  const pct = (score + 1) / 2; // 0..1, 1 = full poleA
  return (
    <div>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          fontSize: 12.5,
          marginBottom: 6,
        }}
      >
        <span
          style={{
            color: score >= 0 ? theme.accent : "var(--ink-dim)",
            fontWeight: score >= 0 ? 600 : 400,
          }}
        >
          {poleA}
        </span>
        <span className="faint" style={{ fontSize: 11 }}>
          {label}
        </span>
        <span
          style={{
            color: score < 0 ? theme.accent : "var(--ink-dim)",
            fontWeight: score < 0 ? 600 : 400,
          }}
        >
          {poleB}
        </span>
      </div>
      <div
        style={{
          position: "relative",
          height: 6,
          borderRadius: 4,
          background: "rgba(255,255,255,0.1)",
        }}
      >
        <span
          style={{
            position: "absolute",
            top: "50%",
            left: `${pct * 100}%`,
            transform: "translate(-50%, -50%)",
            width: 12,
            height: 12,
            borderRadius: 6,
            background: theme.accent,
            transition: `left ${theme.meterEaseS}s cubic-bezier(0.22,1,0.36,1)`,
            boxShadow: `0 0 0 4px ${theme.accentSoft}`,
          }}
        />
      </div>
    </div>
  );
}
