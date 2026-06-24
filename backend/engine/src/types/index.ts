// ============================================================================
// CAREER SIM -Domain Types
// ----------------------------------------------------------------------------
// Design contract: the ENGINE owns the world (state, consequences, which
// tension fires when). The MODEL (if used) only dramatizes pre-grounded
// material into prose. Every choice a scene offers is bound to an
// engine-defined StateDelta -the model can never invent a consequence.
// ============================================================================

// ---------------------------------------------------------------------------
// TENSIONS -the authentic tradeoffs that define a job's felt texture.
// These are hand-authored from researched day-in-the-life sources, NOT the
// model's stereotype of the job. A career "is" its tensions.
// ---------------------------------------------------------------------------
export interface Tension {
  id: string;
  /** Short name shown in the debrief, e.g. "Autonomy vs. Ambiguity". */
  label: string;
  /** The pole a player leans toward when they pick the "lean-in" choice. */
  poleA: string;
  /** The opposite pole. */
  poleB: string;
  /** One-sentence description of why this tension is real for this job. */
  description: string;
}

// ---------------------------------------------------------------------------
// DAY STATE -tracked across the whole day so choices COMPOUND.
// energy + time are universal; the three meters are career-specific
// (relationships / progress / standing -labeled per career).
// ---------------------------------------------------------------------------
export interface MeterDef {
  id: string; // stable key, e.g. "trust"
  label: string; // display, e.g. "Team Trust"
  /** Short hint shown on hover / under the bar. */
  hint: string;
  /** Starting value 0-100. */
  start: number;
}

export interface DayState {
  /** Minutes since midnight; the day-clock reads this. */
  clock: number;
  /** 0-100. Drains over the day; some choices cost more. */
  energy: number;
  /** Career-specific meters, keyed by MeterDef.id. */
  meters: Record<string, number>;
  /** Running log of which tension pole each choice leaned toward. */
  leanLog: Array<{ tensionId: string; pole: "A" | "B"; beatId: string }>;
  /** Beat ids already played (prevents repeats, enables branching). */
  visited: string[];
  /** Multi-day arc: which day of the arc (1-based). */
  arcDay?: number;
}

// A change to the world produced by making a choice. Engine-defined.
export interface StateDelta {
  energy?: number; // +/-energy
  meters?: Record<string, number>; // +/-per meter id
  /** Advance the day-clock by this many minutes. */
  advanceMinutes: number;
  /** Which tension this choice leans toward, and which pole. */
  tensionId?: string;
  pole?: "A" | "B";
}

// ---------------------------------------------------------------------------
// BEATS & CHOICES -the branching scenario graph.
// A beat is one decision moment. The engine picks the next beat from the
// skeleton based on current state (energy, meters, time, what's visited).
// ---------------------------------------------------------------------------
export interface Choice {
  id: string;
  /** Player-facing label. May be model-dramatized, but the delta is fixed. */
  label: string;
  /** What actually happens -engine-owned, never model-owned. */
  delta: StateDelta;
  /** Consequence text revealed after choosing. Grounded fallback provided. */
  consequence: string;
  /**
   * Optional: force the next beat (hard branch). If absent, the engine
   * selects the next beat by its selection rules.
   */
  nextBeatId?: string;
}

export type BeatPhase =
  | "dawn"
  | "morning"
  | "midday"
  | "afternoon"
  | "evening"
  | "night";

/** Inspectable in-scene document (handoff note, patient list, etc.). */
export interface Artifact {
  id: string;
  title: string;
  body: string;
}

/** Soft real-time deadline; expires to a default authored choice. */
export interface BeatPressure {
  label: string;
  deadlineSeconds: number;
  defaultChoiceId: string;
}

export interface RankItem {
  id: string;
  label: string;
  detail?: string;
}

/** Rank interaction: player's #1 priority maps to an engine-owned choice. */
export interface BeatRank {
  items: RankItem[];
  topItemToChoiceId: Record<string, string>;
}

export interface Beat {
  id: string;
  phase: BeatPhase;
  /**
   * The real wall-clock time (minutes since midnight) this scene begins at.
   * Entering a beat advances the day-clock TO this anchor (representing elided
   * time between decisions), then the chosen action adds its own duration.
   * This keeps the clock honest to the narrative without faking deltas.
   */
  clockAnchor: number;
  /** Scene-setting prose. Grounded; may be re-dramatized by the model. */
  scene: string;
  /** 2-4 choices. */
  choices: Choice[];
  /** Optional inspectable documents before deciding. */
  artifacts?: Artifact[];
  /** Optional soft timer -auto-picks defaultChoiceId when time runs out. */
  pressure?: BeatPressure;
  /** Optional rank interaction -top-ranked item selects the choice. */
  rank?: BeatRank;
  /**
   * Selection guard: this beat is eligible only if the predicate passes.
   * Lets the day branch on accumulated state (e.g. low energy unlocks a
   * "you're running on fumes" beat). Pure function of state.
   */
  eligibleWhen?: (s: DayState) => boolean;
  /** Higher = preferred when multiple beats are eligible. */
  priority?: number;
  /** Marks a beat as a valid day-ender. */
  isFinale?: boolean;
}

// ---------------------------------------------------------------------------
// CAREER -a full grounded pack.
// ---------------------------------------------------------------------------
export interface Source {
  title: string;
  url: string;
  /** What this source grounds (for the writeup / honesty layer). */
  grounds: string;
}

export interface Career {
  id: string;
  title: string;
  /** One-line real-world framing (the unglamorous truth). */
  realityLine: string;
  /** Visual identity -drives the per-career mood/palette. */
  mood: {
    /** Primary accent (hex). */
    accent: string;
    /** Background gradient stops (hex). */
    bgFrom: string;
    bgTo: string;
    /** A one-word felt-texture label, e.g. "tense", "quiet". */
    texture: string;
    /** Tempo hint for UI pacing, 0 (languid) -1 (frantic). */
    tempo: number;
  };
  /** Start/end of the workday in minutes-since-midnight. */
  dayStart: number;
  dayEndApprox: number;
  meters: [MeterDef, MeterDef, MeterDef];
  tensions: Tension[];
  /** The beat skeleton -the scenario graph. */
  beats: Beat[];
  /** First beat id. */
  openingBeatId: string;
  sources: Source[];
}

// ---------------------------------------------------------------------------
// REFLECTION -the debrief output.
// ---------------------------------------------------------------------------
export interface TensionLean {
  tension: Tension;
  /** -1 (all poleB) .. +1 (all poleA). */
  score: number;
  count: number;
}

export interface Reflection {
  /** Per-tension lean, sorted by strength. */
  leans: TensionLean[];
  /** Plain-language read of the dominant pattern. */
  pattern: string;
  /** Fit signals -what the pattern suggests. */
  fitSignals: string[];
  /** Adjacent careers to try, by id, with a reason. */
  adjacent: Array<{ careerId: string; reason: string }>;
  /** Honest caveat. */
  caveat: string;
  /** Beat-by-beat moments for export/debrief. */
  moments: string[];
}

/** Multi-day arc progress stored client-side. */
export interface ArcProgress {
  careerId: string;
  totalDays: number;
  currentDay: number;
  completedDays: RunResult[];
  complete: boolean;
}

/** One point on the energy timeline across a day. */
export interface EnergySnapshot {
  beatId: string;
  choiceId: string;
  label: string;
  energyAfter: number;
  delta: number;
}

/** Reflection across a full arc (3 days). */
export interface ArcReflection extends Reflection {
  daysPlayed: number;
  energyArc: string;
  whatBroke: string[];
}

// A completed run, used by the reflection agent and compare mode.
export interface RunResult {
  careerId: string;
  finalState: DayState;
  transcript: Array<{ beatId: string; choiceId: string; choiceLabel: string }>;
  arcDay?: number;
  energyTimeline?: EnergySnapshot[];
}
