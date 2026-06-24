import { Beat, Career, DayState } from "./types";
import { formatClock } from "./scenario";

// ============================================================================
// GENERATION CONTRACT
// ----------------------------------------------------------------------------
// The model NEVER decides what happens. The engine has already fixed:
//   -which beat fires, its phase, its clock anchor
//   -the choices that exist, their order, and (critically) their StateDeltas
//   -every consequence
// The model is allowed ONE job: rewrite the scene prose and the choice LABELS
// in a fresher, more specific voice, grounded in the career's real material.
// It returns text keyed by the engine's own choice ids. Anything it adds,
// drops, or reorders is rejected and we fall back to the authored text.
//
// This is the "AI proposes words, code verifies the world" guarantee, applied
// to a narrative engine. It is what lets us truthfully say live generation is
// an enhancement, not a dependency.
// ============================================================================

export interface DramatizedBeat {
  scene: string;
  /** Map of choice.id -> rewritten label. Must cover exactly the beat's ids. */
  choiceLabels: Record<string, string>;
  /** Provenance: did this come from the model or the authored fallback? */
  source: "model" | "fallback";
}

// What we send the model: grounding + the FIXED structure it must respect.
export interface GenerationRequest {
  careerTitle: string;
  realityLine: string;
  texture: string;
  grounding: string[]; // short grounded facts the model may draw on
  phase: Beat["phase"];
  clockLabel: string;
  // The engine's fixed scene + choices (ids + authored labels) it must mirror.
  authoredScene: string;
  choices: Array<{ id: string; authoredLabel: string }>;
  // Light state context so the rewrite can reflect the day so far (tone only).
  stateHint: string;
}

// ---------------------------------------------------------------------------
// Build the request from engine state. Pure; no network.
// ---------------------------------------------------------------------------
export function buildRequest(
  career: Career,
  beat: Beat,
  state: DayState,
): GenerationRequest {
  const grounding = career.sources.map((s) => s.grounds);
  const lowMeters = career.meters
    .filter((m) => state.meters[m.id] <= 35)
    .map((m) => m.label.toLowerCase());
  const energyWord =
    state.energy <= 30
      ? "running on empty"
      : state.energy <= 60
        ? "tiring"
        : "still fresh";
  const stateHint =
    `By now they are ${energyWord}` +
    (lowMeters.length ? `, and low on ${lowMeters.join(" and ")}.` : ".");

  return {
    careerTitle: career.title,
    realityLine: career.realityLine,
    texture: career.mood.texture,
    grounding,
    phase: beat.phase,
    clockLabel: formatClock(Math.max(state.clock, beat.clockAnchor)),
    authoredScene: beat.scene,
    choices: beat.choices.map((c) => ({ id: c.id, authoredLabel: c.label })),
    stateHint,
  };
}

// ---------------------------------------------------------------------------
// The system prompt enforces the contract in words; the validator enforces it
// in code. Both exist on purpose.
// ---------------------------------------------------------------------------
export function buildSystemPrompt(): string {
  return [
    "You are a narrative dramatizer for a grounded career-simulation game.",
    "You will be given a scene and a fixed set of choices, each with an id.",
    "Your ONLY task is to rewrite the scene prose and each choice's label so they",
    "feel vivid, specific, and true to the real day-in-the-life material provided.",
    "",
    "Hard rules you must never break:",
    "-Keep the SAME number of choices, with the EXACT same ids.",
    "-Never change what a choice does, its consequence, or its meaning -only its wording.",
    "-Never invent new choices, plot events, or outcomes.",
    "-Stay grounded in the provided real material. Do not glamorize or add drama",
    "  the sources don't support (no TV-style heroics).",
    "-Keep the scene under 90 words and each label under 22 words.",
    "",
    "Respond with ONLY a JSON object, no markdown, no preamble:",
    '{ "scene": "...", "choices": { "<choiceId>": "<label>", ... } }',
  ].join("\n");
}

export function buildUserPrompt(req: GenerationRequest): string {
  const choiceLines = req.choices
    .map((c) => `  -id "${c.id}": ${c.authoredLabel}`)
    .join("\n");
  return [
    `Career: ${req.careerTitle}`,
    `The real, unglamorous truth: ${req.realityLine}`,
    `Felt texture: ${req.texture}`,
    `Grounded material you may draw on:`,
    ...req.grounding.map((g) => `  -${g}`),
    ``,
    `Time of day: ${req.clockLabel} (${req.phase}). ${req.stateHint}`,
    ``,
    `Scene to rewrite:`,
    `  ${req.authoredScene}`,
    ``,
    `Choices to rewrite (keep these exact ids, same meaning):`,
    choiceLines,
    ``,
    `Return the JSON now.`,
  ].join("\n");
}

// ---------------------------------------------------------------------------
// VALIDATOR -the code half of the contract. Rejects any model output that
// would alter the engine's world. On rejection the caller uses the fallback.
// ---------------------------------------------------------------------------
export interface ValidationResult {
  ok: boolean;
  reason?: string;
  dramatized?: DramatizedBeat;
}

export function validateResponse(raw: string, beat: Beat): ValidationResult {
  let parsed: unknown;
  try {
    const cleaned = raw
      .replace(/```json/gi, "")
      .replace(/```/g, "")
      .trim();
    parsed = JSON.parse(cleaned);
  } catch {
    return { ok: false, reason: "not valid JSON" };
  }

  if (typeof parsed !== "object" || parsed === null) {
    return { ok: false, reason: "not an object" };
  }
  const obj = parsed as Record<string, unknown>;
  const scene = obj.scene;
  const choices = obj.choices;

  if (typeof scene !== "string" || scene.trim().length < 10) {
    return { ok: false, reason: "scene missing or too short" };
  }
  if (countWords(scene) > 130) {
    return { ok: false, reason: "scene too long" };
  }
  if (typeof choices !== "object" || choices === null) {
    return { ok: false, reason: "choices missing" };
  }

  const labelMap = choices as Record<string, unknown>;
  const expectedIds = beat.choices.map((c) => c.id).sort();
  const gotIds = Object.keys(labelMap).sort();

  // Contract: EXACTLY the engine's ids -no additions, no omissions.
  if (
    expectedIds.length !== gotIds.length ||
    expectedIds.some((id, i) => id !== gotIds[i])
  ) {
    return {
      ok: false,
      reason: `choice ids mismatch (expected ${expectedIds.join(",")}, got ${gotIds.join(",")})`,
    };
  }

  const choiceLabels: Record<string, string> = {};
  for (const id of expectedIds) {
    const v = labelMap[id];
    if (typeof v !== "string" || v.trim().length < 3) {
      return { ok: false, reason: `label for ${id} invalid` };
    }
    if (countWords(v) > 30) {
      return { ok: false, reason: `label for ${id} too long` };
    }
    choiceLabels[id] = v.trim();
  }

  return {
    ok: true,
    dramatized: { scene: scene.trim(), choiceLabels, source: "model" },
  };
}

// The deterministic fallback: the authored beat, untouched. Always available.
export function fallbackDramatization(beat: Beat): DramatizedBeat {
  const choiceLabels: Record<string, string> = {};
  for (const c of beat.choices) choiceLabels[c.id] = c.label;
  return { scene: beat.scene, choiceLabels, source: "fallback" };
}

function countWords(s: string): number {
  return s.trim().split(/\s+/).filter(Boolean).length;
}
