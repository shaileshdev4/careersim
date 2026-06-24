"use client";

import { formatClock } from "@careersim/engine";
import { BeatPhase } from "@careersim/engine";
import { Theme } from "./theme";

const PHASES: BeatPhase[] = ["dawn", "morning", "midday", "afternoon", "evening", "night"];

// The day-clock is the emotional spine: it makes "time is passing" visible,
// which is what turns a quiz into a day. A thin arc fills from dayStart toward
// dayEnd; the active phase is named. Motion speed comes from the theme tempo.
export function DayClock({
  clock,
  dayStart,
  dayEnd,
  phase,
  theme,
}: {
  clock: number;
  dayStart: number;
  dayEnd: number;
  phase: BeatPhase;
  theme: Theme;
}) {
  const progress = Math.max(0, Math.min(1, (clock -dayStart) / Math.max(1, dayEnd -dayStart)));
  const R = 15;
  const C = 2 * Math.PI * R;
  const dash = C * progress;

  return (
    <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
      <svg width="40" height="40" viewBox="0 0 40 40" aria-hidden="true">
        <circle cx="20" cy="20" r={R} fill="none" stroke="rgba(255,255,255,0.12)" strokeWidth="2.5" />
        <circle
          cx="20"
          cy="20"
          r={R}
          fill="none"
          stroke={theme.accent}
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeDasharray={`${dash} ${C}`}
          transform="rotate(-90 20 20)"
          style={{ transition: `stroke-dasharray ${theme.meterEaseS}s cubic-bezier(0.22,1,0.36,1)` }}
        />
        <circle cx="20" cy="20" r="2.5" fill={theme.accent} className="pulse-dot" />
      </svg>
      <div style={{ lineHeight: 1.2 }}>
        <div className="mono" style={{ fontSize: 17, fontWeight: 600, letterSpacing: "0.01em" }}>
          {formatClock(clock)}
        </div>
        <div className="eyebrow faint" style={{ marginTop: 2 }}>
          {phase}
        </div>
      </div>
      <PhaseTrack phase={phase} theme={theme} />
    </div>
  );
}

function PhaseTrack({ phase, theme }: { phase: BeatPhase; theme: Theme }) {
  const activeIdx = PHASES.indexOf(phase);
  return (
    <div style={{ display: "flex", gap: 5, marginLeft: 4 }} aria-hidden="true">
      {PHASES.map((p, i) => {
        const active = i === activeIdx;
        const past = i < activeIdx;
        return (
          <span
            key={p}
            title={p}
            style={{
              width: active ? 18 : 7,
              height: 7,
              borderRadius: 4,
              background: active ? theme.accent : past ? theme.accentSoft : "rgba(255,255,255,0.12)",
              transition: `all ${theme.transitionS}s ease`,
            }}
          />
        );
      })}
    </div>
  );
}
