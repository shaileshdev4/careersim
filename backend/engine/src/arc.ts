import {
  Career,
  ArcProgress,
  DayState,
  EnergySnapshot,
  RunResult,
} from "./types";
import { getBeat, initState, formatClock } from "./scenario";

// ============================================================================
// MULTI-DAY ARC (Phase 3)
// ----------------------------------------------------------------------------
// Surgeon + Engineer shipped first; all four careers now have 3-day arcs.
// energy recovers partially overnight, meters drift toward baseline, lean log
// accumulates. Each arc day can open on a different beat.
// ============================================================================

export const ARC_DAYS = 3;

export interface ArcCareerConfig {
  totalDays: number;
  openingBeatByDay: Record<number, string>;
}

/** Careers with a authored multi-day arc. */
export const ARC_CAREERS: Record<string, ArcCareerConfig> = {
  surgeon: {
    totalDays: ARC_DAYS,
    openingBeatByDay: {
      1: "s_rounds",
      2: "s_rounds_d2",
      3: "s_rounds_d3",
    },
  },
  engineer: {
    totalDays: ARC_DAYS,
    openingBeatByDay: {
      1: "e_standup",
      2: "e_standup_d2",
      3: "e_standup_d3",
    },
  },
  teacher: {
    totalDays: ARC_DAYS,
    openingBeatByDay: {
      1: "t_arrival",
      2: "t_arrival_d2",
      3: "t_arrival_d3",
    },
  },
  analyst: {
    totalDays: ARC_DAYS,
    openingBeatByDay: {
      1: "a_open",
      2: "a_open_d2",
      3: "a_open_d3",
    },
  },
  nurse: {
    totalDays: ARC_DAYS,
    openingBeatByDay: {
      1: "n_board",
      2: "n_board_d2",
      3: "n_board_d3",
    },
  },
  journalist: {
    totalDays: ARC_DAYS,
    openingBeatByDay: {
      1: "j_morning",
      2: "j_morning_d2",
      3: "j_morning_d3",
    },
  },
  socialworker: {
    totalDays: ARC_DAYS,
    openingBeatByDay: {
      1: "sw_morning",
      2: "sw_morning_d2",
      3: "sw_morning_d3",
    },
  },
  uxdesigner: {
    totalDays: ARC_DAYS,
    openingBeatByDay: {
      1: "ux_kickoff",
      2: "ux_kickoff_d2",
      3: "ux_kickoff_d3",
    },
  },
};

export function hasArc(careerId: string): boolean {
  return careerId in ARC_CAREERS;
}

export function arcConfig(careerId: string): ArcCareerConfig | null {
  return ARC_CAREERS[careerId] ?? null;
}

export function openingBeatForArcDay(career: Career, arcDay: number): string {
  const cfg = ARC_CAREERS[career.id];
  if (!cfg) return career.openingBeatId;
  return cfg.openingBeatByDay[arcDay] ?? career.openingBeatId;
}

const clamp = (n: number, lo = 0, hi = 100) => Math.max(lo, Math.min(hi, n));

/**
 * Start-of-day state for an arc day. Day 1 is fresh; later days carry over
 * energy, meters, and the full lean log from the previous day.
 */
export function initArcDayState(
  career: Career,
  arcDay: number,
  previousDay?: RunResult,
): DayState {
  if (arcDay <= 1 || !previousDay) {
    return { ...initState(career), arcDay: 1 };
  }

  const prev = previousDay.finalState;
  const recovery = prev.energy < 35 ? 18 : prev.energy < 55 ? 28 : 38;
  const meters: Record<string, number> = {};
  for (const m of career.meters) {
    const prevVal = prev.meters[m.id] ?? m.start;
    meters[m.id] = clamp(Math.round(prevVal * 0.65 + m.start * 0.35));
  }

  return {
    clock: career.dayStart,
    energy: clamp(prev.energy + recovery),
    meters,
    leanLog: [...prev.leanLog],
    visited: [],
    arcDay,
  };
}

export function newArcProgress(careerId: string): ArcProgress {
  const cfg = ARC_CAREERS[careerId];
  return {
    careerId,
    totalDays: cfg?.totalDays ?? 1,
    currentDay: 1,
    completedDays: [],
    complete: false,
  };
}

export function recordArcDay(
  progress: ArcProgress,
  dayResult: RunResult,
): ArcProgress {
  const completed = [...progress.completedDays, dayResult];
  const done = completed.length >= progress.totalDays;
  return {
    ...progress,
    completedDays: completed,
    currentDay: done ? progress.totalDays : completed.length + 1,
    complete: done,
  };
}

/** Energy after each choice - used for the "what broke?" timeline. */
export function buildEnergyTimeline(
  career: Career,
  run: RunResult,
  startEnergy?: number,
): EnergySnapshot[] {
  let energy =
    startEnergy ??
    (run.arcDay && run.arcDay > 1
      ? run.energyTimeline?.[0]?.energyAfter
      : undefined) ??
    100;

  const out: EnergySnapshot[] = [
    {
      beatId: "_start",
      choiceId: "_start",
      label: "Day start",
      energyAfter: energy,
      delta: 0,
    },
  ];

  for (const t of run.transcript) {
    const beat = getBeat(career, t.beatId);
    const choice = beat?.choices.find((c) => c.id === t.choiceId);
    const delta = choice?.delta.energy ?? 0;
    energy = clamp(energy + delta);
    out.push({
      beatId: t.beatId,
      choiceId: t.choiceId,
      label: t.choiceLabel,
      energyAfter: energy,
      delta,
    });
  }
  return out;
}

/** Name the choices that hit hardest (energy drops ≥ 12). */
export function whatBroke(
  career: Career,
  timeline: EnergySnapshot[],
): string[] {
  const hits = timeline
    .filter((p) => p.delta <= -12 && p.beatId !== "_start")
    .sort((a, b) => a.delta - b.delta);

  return hits.slice(0, 3).map((p) => {
    const beat = getBeat(career, p.beatId);
    const time = beat ? formatClock(beat.clockAnchor) : "";
    const label = p.label.length > 55 ? `${p.label.slice(0, 55)}…` : p.label;
    const prefix = time ? `${time} - ` : "";
    return `${prefix}"${label}" cost ${-p.delta} energy`;
  });
}

/** Overnight carryover line shown at the start of day 2+. */
export function carryoverSummary(
  career: Career,
  previousDay: RunResult,
): string {
  const prev = previousDay.finalState;
  const e = prev.energy;
  const lowest = Object.entries(prev.meters).sort((a, b) => a[1] - b[1])[0];
  const meterDef = career.meters.find((m) => m.id === lowest[0]);
  let line = `Yesterday ended at ${e}/100 energy`;
  if (meterDef && lowest[1] <= 40) {
    line += `; ${meterDef.label.toLowerCase()} was running low`;
  }
  line += ". Sleep didn't fully reset you.";
  return line;
}
