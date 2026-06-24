import {
  Beat,
  Career,
  Choice,
  DayState,
  MeterDef,
  RunResult,
  StateDelta,
} from "./types";
import { openingBeatForArcDay } from "./arc";

// ============================================================================
// SCENARIO ENGINE (deterministic core)
// ----------------------------------------------------------------------------
// The engine is the single source of truth for the simulated world:
//   -it initializes and mutates DayState
//   -it applies engine-defined StateDeltas (never model-defined)
//   -it selects the next beat from the career's skeleton based on accumulated
//     state, so the day BRANCHES and choices COMPOUND
// No network, no LLM. Pure functions over state -> fully testable & demo-safe.
// ============================================================================

const PHASE_ORDER: Beat["phase"][] = [
  "dawn",
  "morning",
  "midday",
  "afternoon",
  "evening",
  "night",
];

const clamp = (n: number, lo = 0, hi = 100) => Math.max(lo, Math.min(hi, n));

export function initState(career: Career): DayState {
  return {
    clock: career.dayStart,
    energy: 100,
    meters: {
      [career.meters[0].id]: career.meters[0].start,
      [career.meters[1].id]: career.meters[1].start,
      [career.meters[2].id]: career.meters[2].start,
    },
    leanLog: [],
    visited: [],
  };
}

export function getBeat(career: Career, beatId: string): Beat | undefined {
  return career.beats.find((b) => b.id === beatId);
}

export function isRankBeat(beat: Beat): boolean {
  return !!beat.rank && beat.rank.items.length >= 2;
}

/** Map a rank order (highest priority first) to the engine's fixed choice. */
export function resolveRankChoice(beat: Beat, order: string[]): Choice | null {
  if (!beat.rank || order.length === 0) return null;
  const choiceId = beat.rank.topItemToChoiceId[order[0]];
  if (!choiceId) return null;
  return beat.choices.find((c) => c.id === choiceId) ?? null;
}

/** Human-readable preview of what a choice will do to state. */
export function formatDeltaPreview(
  delta: StateDelta,
  meterDefs: MeterDef[],
): string[] {
  const parts: string[] = [];
  if (delta.energy !== undefined && delta.energy !== 0) {
    const sign = delta.energy > 0 ? "+" : "";
    parts.push(`Energy ${sign}${delta.energy}`);
  }
  if (delta.meters) {
    for (const m of meterDefs) {
      const v = delta.meters[m.id];
      if (v !== undefined && v !== 0) {
        const sign = v > 0 ? "+" : "";
        parts.push(`${m.label} ${sign}${v}`);
      }
    }
  }
  if (delta.advanceMinutes > 0) {
    parts.push(`+${delta.advanceMinutes} min`);
  }
  return parts;
}

/** Apply a choice's delta to produce a NEW state (immutable). */
export function applyChoice(
  state: DayState,
  beatId: string,
  choice: Choice,
  beat?: Beat,
): DayState {
  const d: StateDelta = choice.delta;
  const meters = { ...state.meters };
  if (d.meters) {
    for (const [k, v] of Object.entries(d.meters)) {
      meters[k] = clamp((meters[k] ?? 0) + v);
    }
  }
  const leanLog = [...state.leanLog];
  if (d.tensionId && d.pole) {
    leanLog.push({ tensionId: d.tensionId, pole: d.pole, beatId });
  }
  // Entering the beat advances the clock to its anchor (elided time between
  // decisions); the chosen action then adds its own duration on top.
  const anchored = beat ? Math.max(state.clock, beat.clockAnchor) : state.clock;
  return {
    clock: anchored + d.advanceMinutes,
    energy: clamp(state.energy + (d.energy ?? 0)),
    meters,
    leanLog,
    visited: state.visited.includes(beatId)
      ? state.visited
      : [...state.visited, beatId],
  };
}

/**
 * Select the next beat. This is the branching logic and the reason the day
 * feels stateful rather than a fixed script:
 *   1. A hard branch (choice.nextBeatId) always wins.
 *   2. Otherwise consider all UNVISITED, eligible beats.
 *   3. Prefer beats whose phase is at or after the current phase (forward time).
 *   4. Among those, higher priority wins; ties broken by skeleton order.
 *   5. If a finale is eligible and no non-finale beats remain, end the day.
 * Returns null when the day is over.
 */
export function selectNextBeat(
  career: Career,
  state: DayState,
  chosen: Choice,
): Beat | null {
  if (chosen.nextBeatId) {
    return getBeat(career, chosen.nextBeatId) ?? null;
  }

  const currentPhaseIdx = phaseOfClock(career, state.clock);

  const eligible = career.beats.filter((b) => {
    if (state.visited.includes(b.id)) return false;
    if (b.eligibleWhen && !b.eligibleWhen(state)) return false;
    return true;
  });

  if (eligible.length === 0) return null;

  // Non-finale beats still to play. A finale should never fire while
  // meaningful non-finale beats remain eligible, regardless of phase -this
  // keeps the day from ending at "9 AM" because an evening beat was reachable.
  const nonFinale = eligible.filter((b) => !b.isFinale);

  if (nonFinale.length > 0) {
    // Prefer beats whose declared phase is time-appropriate (>= current),
    // so the day flows forward; fall back to any remaining non-finale beat.
    const forward = nonFinale.filter(
      (b) => PHASE_ORDER.indexOf(b.phase) >= currentPhaseIdx - 1,
    );
    const pool = forward.length > 0 ? forward : nonFinale;
    return pickByPriority(career, pool);
  }

  // Only finales left -> end on a finale.
  const finales = eligible.filter((b) => b.isFinale);
  if (finales.length > 0) {
    return pickByPriority(career, finales);
  }

  return null;
}

function pickByPriority(career: Career, beats: Beat[]): Beat {
  const order = (b: Beat) => career.beats.indexOf(b);
  // Primary sort: earliest clockAnchor first, so the day flows forward in time.
  // Beats anchored within the same ~90-min window are treated as concurrent and
  // ordered by priority, then by skeleton order.
  return [...beats].sort((a, b) => {
    const concurrent = Math.abs(a.clockAnchor - b.clockAnchor) <= 90;
    if (!concurrent) return a.clockAnchor - b.clockAnchor;
    const pa = a.priority ?? 0;
    const pb = b.priority ?? 0;
    if (pb !== pa) return pb - pa;
    return order(a) - order(b);
  })[0];
}

function phaseOfClock(career: Career, clock: number): number {
  // Map the clock onto a coarse phase index based on progress through the day.
  const span = career.dayEndApprox - career.dayStart;
  const t = (clock - career.dayStart) / Math.max(1, span);
  if (t < 0.12) return 0; // dawn
  if (t < 0.35) return 1; // morning
  if (t < 0.55) return 2; // midday
  if (t < 0.78) return 3; // afternoon
  if (t < 0.95) return 4; // evening
  return 5; // night
}

/** True if the chosen beat is a finale (the day should end after it). */
export function isDayOver(
  career: Career,
  state: DayState,
  justPlayed: Beat,
): boolean {
  if (justPlayed.isFinale) return true;
  // Safety: if nothing remains selectable, end.
  const remaining = career.beats.filter(
    (b) =>
      !state.visited.includes(b.id) &&
      (!b.eligibleWhen || b.eligibleWhen(state)),
  );
  return remaining.length === 0;
}

export function formatClock(minutes: number): string {
  const h24 = Math.floor(minutes / 60) % 24;
  const m = Math.floor(minutes % 60);
  const ampm = h24 < 12 ? "AM" : "PM";
  const h12 = h24 % 12 === 0 ? 12 : h24 % 12;
  return `${h12}:${m.toString().padStart(2, "0")} ${ampm}`;
}

/**
 * Run a full day DETERMINISTICALLY by always taking a chosen index per beat.
 * Used by the test harness and by "auto-play" demos. `policy` returns the
 * choice index for a given beat.
 */
export function runDay(
  career: Career,
  policy: (beat: Beat, state: DayState) => number,
  opts?: { arcDay?: number; startState?: DayState },
): RunResult {
  let state = opts?.startState ?? initState(career);
  const openingId = opts?.arcDay
    ? openingBeatForArcDay(career, opts.arcDay)
    : career.openingBeatId;
  let beat: Beat | null | undefined = getBeat(career, openingId);
  const transcript: RunResult["transcript"] = [];
  let guard = 0;

  while (beat && guard < 50) {
    guard++;
    const idx = clampIdx(policy(beat, state), beat.choices.length);
    const choice = beat.choices[idx];
    transcript.push({
      beatId: beat.id,
      choiceId: choice.id,
      choiceLabel: choice.label,
    });
    state = applyChoice(state, beat.id, choice, beat);
    if (isDayOver(career, state, beat)) break;
    beat = selectNextBeat(career, state, choice);
  }

  return {
    careerId: career.id,
    finalState: state,
    transcript,
    arcDay: opts?.arcDay,
  };
}

const clampIdx = (i: number, len: number) =>
  Math.max(0, Math.min(len - 1, i | 0));
