import {
  Career,
  Reflection,
  RunResult,
  TensionLean,
  ArcReflection,
} from "./types";
import { CAREERS } from "./data";
import { formatClock, getBeat } from "./scenario";
import { whatBroke, buildEnergyTimeline } from "./arc";

// ============================================================================
// REFLECTION AGENT (deterministic)
// ----------------------------------------------------------------------------
// Reads the run's leanLog and turns it into a fit debrief. Deterministic so
// the demo's payoff moment is reliable; an optional LLM pass can later
// *rephrase* this (never recompute it) for warmth -same engine-owns-truth
// contract as the scenario engine.
// ============================================================================

export function reflect(career: Career, run: RunResult): Reflection {
  const log = run.finalState.leanLog;

  const leans: TensionLean[] = career.tensions.map((tension) => {
    const entries = log.filter((l) => l.tensionId === tension.id);
    const count = entries.length;
    // poleA = +1, poleB = -1
    const sum = entries.reduce((acc, e) => acc + (e.pole === "A" ? 1 : -1), 0);
    const score = count === 0 ? 0 : sum / count;
    return { tension, score, count };
  });

  // Sort by strength of lean (only tensions actually exercised).
  const exercised = leans
    .filter((l) => l.count > 0)
    .sort((a, b) => Math.abs(b.score) - Math.abs(a.score));

  const pattern = buildPattern(exercised, run.finalState);
  const fitSignals = buildFitSignals(exercised, career, run);
  const adjacent = buildAdjacent(career, exercised);
  const moments = buildMoments(career, run);

  return {
    leans: exercised.length ? exercised : leans,
    pattern,
    fitSignals,
    adjacent,
    moments,
    caveat:
      "This reads your choices in one simulated day, not your aptitude. It's a mirror for reflection, not a verdict -the point is to notice what pulled at you.",
  };
}

/** Reflect across a full multi-day arc using the accumulated lean log. */
export function reflectArc(career: Career, days: RunResult[]): ArcReflection {
  if (days.length === 0) {
    const empty = reflect(career, {
      careerId: career.id,
      finalState: { clock: 0, energy: 0, meters: {}, leanLog: [], visited: [] },
      transcript: [],
    });
    return {
      ...empty,
      daysPlayed: 0,
      energyArc: "",
      whatBroke: [],
    };
  }

  const combined: RunResult = {
    careerId: career.id,
    finalState: days[days.length - 1].finalState,
    transcript: days.flatMap((d) => d.transcript),
  };
  const base = reflect(career, combined);

  const startE = days[0].energyTimeline?.[0]?.energyAfter ?? 100;
  const endE = days[days.length - 1].finalState.energy;
  let energyArc: string;
  if (endE < startE - 20) {
    energyArc = `Across ${days.length} days your reserves kept draining - you ended lower than you started. The cost compounded.`;
  } else if (endE > startE) {
    energyArc = `You actually recovered some ground by the end - either you protected yourself, or the arc let up.`;
  } else {
    energyArc = `Energy held roughly steady across the arc - you found a sustainable rhythm, or you're running on habit.`;
  }

  const allBroke = days.flatMap((d) =>
    whatBroke(career, d.energyTimeline ?? buildEnergyTimeline(career, d)),
  );

  return {
    ...base,
    daysPlayed: days.length,
    energyArc,
    whatBroke: allBroke.slice(0, 4),
  };
}

function buildMoments(career: Career, run: RunResult): string[] {
  return run.transcript.map((t) => {
    const beat = getBeat(career, t.beatId);
    const time = beat ? formatClock(beat.clockAnchor) : "";
    const label =
      t.choiceLabel.length > 70
        ? `${t.choiceLabel.slice(0, 70)}…`
        : t.choiceLabel;
    return time ? `${time} - you chose: "${label}"` : `You chose: "${label}"`;
  });
}

export function playStyleLabel(career: Career, run: RunResult): string {
  let energyCost = 0;
  let minutes = 0;
  let n = 0;
  for (const t of run.transcript) {
    const beat = getBeat(career, t.beatId);
    const choice = beat?.choices.find((c) => c.id === t.choiceId);
    if (!choice) continue;
    n += 1;
    energyCost += -(choice.delta.energy ?? 0);
    minutes += choice.delta.advanceMinutes;
  }
  if (n === 0) return "mixed pacing";
  const avgEnergy = energyCost / n;
  const avgMin = minutes / n;
  if (avgEnergy >= 10) return "high-intensity - you pushed hard at most turns";
  if (avgMin >= 42) return "methodical - you took your time at each decision";
  if (avgMin <= 22) return "rushed - you moved fast through the day";
  return "balanced - mixed pacing across the day";
}

function poleName(l: TensionLean): string {
  return l.score >= 0 ? l.tension.poleA : l.tension.poleB;
}

function strengthWord(score: number): string {
  const a = Math.abs(score);
  if (a >= 0.8) return "consistently";
  if (a >= 0.4) return "mostly";
  return "slightly";
}

function buildPattern(
  exercised: TensionLean[],
  state: { energy: number },
): string {
  if (exercised.length === 0) {
    return "You moved through the day without a strong, repeated pattern -worth running it again and noticing what you reach for under pressure.";
  }
  const top = exercised[0];
  const lead = `You ${strengthWord(top.score)} leaned toward ${lower(poleName(top))} over ${lower(
    top.score >= 0 ? top.tension.poleB : top.tension.poleA,
  )}.`;

  let second = "";
  if (exercised[1]) {
    const s = exercised[1];
    second = ` When it mattered, you also chose ${lower(poleName(s))}.`;
  }

  const energyNote =
    state.energy <= 30
      ? " You ran yourself close to empty to do it -the day cost you something real."
      : state.energy >= 70
        ? " You also protected your own reserves along the way."
        : "";

  return lead + second + energyNote;
}

function buildFitSignals(
  exercised: TensionLean[],
  career: Career,
  run: RunResult,
): string[] {
  const out: string[] = [];
  for (const l of exercised.slice(0, 3)) {
    const pole = poleName(l);
    out.push(
      `Drawn to "${pole}" within the tension of ${l.tension.label.toLowerCase()} -${lower(l.tension.description)}`,
    );
  }
  // A grounded, career-specific closing signal.
  const m = run.finalState.meters;
  const lowest = Object.entries(m).sort((a, b) => a[1] - b[1])[0];
  const meterDef = career.meters.find((md) => md.id === lowest[0]);
  if (meterDef && lowest[1] <= 35) {
    out.push(
      `By day's end your "${meterDef.label}" ran low -the part of this job that would quietly wear on you is real and worth weighing.`,
    );
  }
  return out;
}

// Hand-authored adjacency graph: where each lean realistically points.
const ADJACENCY: Record<
  string,
  Array<{ careerId: string; when: (pole: string) => boolean; reason: string }>
> = {
  surgeon: [
    {
      careerId: "analyst",
      when: (p) => p === "Pushing through",
      reason:
        "Another high-pressure, hierarchy-heavy world that rewards grinding through -without the bodies on the line.",
    },
    {
      careerId: "engineer",
      when: (p) => p === "Protecting yourself",
      reason:
        "A field with the same problem-solving pull but far more control over your own hours and pace.",
    },
  ],
  engineer: [
    {
      careerId: "surgeon",
      when: (p) => p === "Get it right",
      reason:
        "A craft where 'get it right' carries the highest possible stakes -if you want your precision to matter viscerally.",
    },
    {
      careerId: "analyst",
      when: (p) => p === "Sync up",
      reason:
        "A people-facing, deadline-driven role if the heads-down solitude felt more isolating than freeing.",
    },
  ],
  teacher: [
    {
      careerId: "surgeon",
      when: (p) => p === "Give everything",
      reason:
        "Another vocation that runs on people who care too much -with structure and clearer stakes.",
    },
    {
      careerId: "engineer",
      when: (p) => p === "Protect yourself",
      reason:
        "A role with real boundaries and quiet, if the constant emotional performance drained you.",
    },
  ],
  analyst: [
    {
      careerId: "engineer",
      when: (p) => p === "Your life",
      reason:
        "Comparable analytical work and pay potential, with dramatically more autonomy over your time.",
    },
    {
      careerId: "surgeon",
      when: (p) => p === "The job",
      reason:
        "If the all-in intensity energized you, a path where the sacrifice buys something life-and-death.",
    },
  ],
  nurse: [
    {
      careerId: "surgeon",
      when: (p) => p === "Thoroughness",
      reason:
        "Same life-and-death stakes with a different seat at the table - if triage under pressure felt right.",
    },
    {
      careerId: "teacher",
      when: (p) => p === "Protect yourself",
      reason:
        "Another caring profession where boundaries are the skill nobody teaches you.",
    },
  ],
  journalist: [
    {
      careerId: "analyst",
      when: (p) => p === "Verification",
      reason:
        "Another deadline-driven desk job - if you liked chasing truth under time pressure.",
    },
    {
      careerId: "engineer",
      when: (p) => p === "Your angle",
      reason:
        "Deep solo work with autonomy, if the editor battles drained you more than the reporting.",
    },
  ],
  socialworker: [
    {
      careerId: "teacher",
      when: (p) => p === "The person",
      reason:
        "Another caring profession built on showing up for people - with even heavier systems.",
    },
    {
      careerId: "nurse",
      when: (p) => p === "Act now",
      reason:
        "Front-line crisis response if you want safety decisions with faster feedback loops.",
    },
  ],
  uxdesigner: [
    {
      careerId: "engineer",
      when: (p) => p === "Research",
      reason:
        "Build the things you spec - if you want the ambiguity to end in shipped code.",
    },
    {
      careerId: "journalist",
      when: (p) => p === "Your vision",
      reason:
        "Story and narrative craft if you liked owning the angle but want less editor warfare.",
    },
  ],
};

function buildAdjacent(
  career: Career,
  exercised: TensionLean[],
): Reflection["adjacent"] {
  const rules = ADJACENCY[career.id] ?? [];
  const poles = new Set(exercised.map(poleName));
  const poleArr = Array.from(poles);
  const matches = rules.filter((r) => poleArr.some((p) => r.when(p)));
  const chosen = (matches.length ? matches : rules).slice(0, 2);
  return chosen
    .filter((r) => CAREERS[r.careerId])
    .map((r) => ({ careerId: r.careerId, reason: r.reason }));
}

const lower = (s: string) => s.charAt(0).toLowerCase() + s.slice(1);

// ============================================================================
// COMPARE SYNTHESIS -the data behind the demo's peak moment.
// Given two completed runs, surface the felt CONTRAST: tempo, how depleting
// each day was, and the different decision-textures. This is descriptive, not
// prescriptive -it names what was different, the player feels the rest.
// ============================================================================
export interface CompareResult {
  a: { careerId: string; title: string; texture: string; energyLeft: number };
  b: { careerId: string; title: string; texture: string; energyLeft: number };
  /** One-line contrast headline. */
  headline: string;
  /** Specific axis contrasts. */
  contrasts: string[];
  playStyleA: string;
  playStyleB: string;
}

export function compareRuns(
  careerA: Career,
  runA: RunResult,
  careerB: Career,
  runB: RunResult,
): CompareResult {
  const eA = runA.finalState.energy;
  const eB = runB.finalState.energy;
  const reflA = reflect(careerA, runA);
  const reflB = reflect(careerB, runB);

  const contrasts: string[] = [];

  // Tempo contrast (authored per-career).
  if (Math.abs(careerA.mood.tempo - careerB.mood.tempo) >= 0.25) {
    const fast = careerA.mood.tempo > careerB.mood.tempo ? careerA : careerB;
    const slow = fast === careerA ? careerB : careerA;
    contrasts.push(
      `${fast.title} runs ${fast.mood.texture}; ${slow.title} runs ${slow.mood.texture}. The rhythm of the two days is not the same kind of hard.`,
    );
  }

  // Depletion contrast.
  if (Math.abs(eA - eB) >= 15) {
    const drained = eA < eB ? careerA : careerB;
    const drainedE = Math.min(eA, eB);
    contrasts.push(
      `One day left you far more depleted: ${drained.title} ended at ${drainedE}/100 energy. Where a day spends you matters as much as what it pays.`,
    );
  }

  // Decision-texture contrast (top lean of each).
  const topA = reflA.leans.find((l) => l.count > 0);
  const topB = reflB.leans.find((l) => l.count > 0);
  if (topA && topB) {
    contrasts.push(
      `In ${careerA.title} the day kept asking you about ${topA.tension.label.toLowerCase()}; in ${careerB.title} it was ${topB.tension.label.toLowerCase()}. Different jobs press on different parts of you.`,
    );
  }

  const playStyleA = playStyleLabel(careerA, runA);
  const playStyleB = playStyleLabel(careerB, runB);
  if (playStyleA !== playStyleB) {
    contrasts.push(
      `As ${careerA.title} you played ${playStyleA}; as ${careerB.title} you played ${playStyleB}.`,
    );
  }

  const headline = `${careerA.title} vs. ${careerB.title}: same you, two very different days.`;

  return {
    a: {
      careerId: careerA.id,
      title: careerA.title,
      texture: careerA.mood.texture,
      energyLeft: eA,
    },
    b: {
      careerId: careerB.id,
      title: careerB.title,
      texture: careerB.mood.texture,
      energyLeft: eB,
    },
    headline,
    contrasts,
    playStyleA,
    playStyleB,
  };
}
