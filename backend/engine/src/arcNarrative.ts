import { Career, RunResult } from "./types";
import { reflectArc } from "./reflect";
import { buildEnergyTimeline } from "./arc";
import { getBeat } from "./scenario";
import { Transport } from "./dramatize";

export interface ArcNarrativeParagraphs {
  paragraphs: [string, string, string];
  headline: string;
  source: "model" | "fallback";
}

export interface ArcNarrativePayload {
  careerTitle: string;
  realityLine: string;
  analysis: ReturnType<typeof reflectArc>;
  dominantLean: string;
  secondaryLean: string;
  finalEnergy: number;
  startEnergy: number;
  minEnergy: number;
  minEnergyDay: number;
  meterSummary: string;
  whatBroke: string;
  standoutChoices: string;
}

export function buildArcNarrativePayload(
  career: Career,
  days: RunResult[],
): ArcNarrativePayload {
  const analysis = reflectArc(career, days);
  const top = analysis.leans[0];
  const second = analysis.leans[1];
  const dominantLean = top
    ? `${top.tension.label}: leaned ${top.score >= 0 ? top.tension.poleA : top.tension.poleB}`
    : "No strong tension pattern";
  const secondaryLean = second
    ? `${second.tension.label}: leaned ${second.score >= 0 ? second.tension.poleA : second.tension.poleB}`
    : "-";

  const startEnergy =
    days[0]?.energyTimeline?.[0]?.energyAfter ??
    days[0]?.finalState.energy ??
    100;
  const finalEnergy = days[days.length - 1]?.finalState.energy ?? startEnergy;

  let minEnergy = 100;
  let minEnergyDay = 1;
  days.forEach((day, i) => {
    const timeline = day.energyTimeline ?? buildEnergyTimeline(career, day);
    for (const snap of timeline) {
      if (snap.energyAfter < minEnergy) {
        minEnergy = snap.energyAfter;
        minEnergyDay = day.arcDay ?? i + 1;
      }
    }
    if (day.finalState.energy < minEnergy) {
      minEnergy = day.finalState.energy;
      minEnergyDay = day.arcDay ?? i + 1;
    }
  });

  const meters = career.meters
    .map((m) => {
      const v = days[days.length - 1]?.finalState.meters[m.id];
      return v != null ? `${m.label} ${Math.round(v)}` : null;
    })
    .filter(Boolean)
    .join(", ");

  const standout = days
    .flatMap((d) => d.transcript)
    .slice(-3)
    .map((t) => {
      const beat = getBeat(career, t.beatId);
      const label =
        t.choiceLabel.length > 60
          ? `${t.choiceLabel.slice(0, 60)}…`
          : t.choiceLabel;
      return beat ? `${beat.phase}: "${label}"` : `"${label}"`;
    })
    .join("; ");

  return {
    careerTitle: career.title,
    realityLine: career.realityLine,
    analysis,
    dominantLean,
    secondaryLean,
    finalEnergy,
    startEnergy,
    minEnergy,
    minEnergyDay,
    meterSummary: meters || "-",
    whatBroke: analysis.whatBroke.join(" · ") || "-",
    standoutChoices: standout || "-",
  };
}

export function buildArcNarrativeSystemPrompt(careerTitle: string): string {
  return `You are writing a personal end-of-week reflection for a teenager who just played a 3-day career arc in a simulation game. They lived a week as a ${careerTitle}.

You will be given a structured analysis of their actual choices and how the week went. Your job is to turn this data into a warm, honest, 3-paragraph reflection written DIRECTLY TO THEM, second person.

Hard rules:
- Use only the data provided. Do not invent choices, scenes, or feelings they didn't have.
- Three paragraphs, 50–70 words each.
- Paragraph 1: what pattern showed up in their choices.
- Paragraph 2: what the week cost them physically/emotionally (use the energy and meter data).
- Paragraph 3: what this might mean, with honest uncertainty. End with one specific thing worth noticing - not a prescription.
- Voice: warm but not flattering. Honest but not cold. Like a thoughtful older sibling who saw the whole week.
- No personality labels. No "you would be a great X." No verdicts.
- Never use the phrase "based on your choices" - show it, don't say it.

Return ONLY the three paragraphs separated by blank lines.`;
}

export function buildArcNarrativeUserPrompt(p: ArcNarrativePayload): string {
  return `Career: ${p.careerTitle}
Career reality: ${p.realityLine}

Arc analysis (computed by engine):
- Dominant tension lean: ${p.dominantLean}
- Secondary lean: ${p.secondaryLean}
- Final energy: ${p.finalEnergy}/100 (started ${p.startEnergy})
- Energy floor across the week: ${p.minEnergy} (during day ${p.minEnergyDay})
- Meters ended: ${p.meterSummary}
- What broke: ${p.whatBroke}
- Standout decisions: ${p.standoutChoices}`;
}

export function fallbackArcNarrative(
  p: ArcNarrativePayload,
): ArcNarrativeParagraphs {
  const a = p.analysis;
  const p1 = a.pattern;
  const p2 = `${a.energyArc} Your energy hit a floor around ${p.minEnergy} on day ${p.minEnergyDay}.`;
  const p3 =
    "Notice what pulled at you when the day got hard - that's the signal this arc is offering, not a verdict on who you should become.";
  const headline =
    p1.split(/[.!?]/)[0]?.trim() ||
    `Your week as a ${p.careerTitle.toLowerCase()}`;
  return {
    paragraphs: [p1, p2, p3],
    headline,
    source: "fallback",
  };
}

function parseParagraphs(raw: string): [string, string, string] | null {
  const parts = raw
    .trim()
    .split(/\n\s*\n/)
    .map((p) => p.trim())
    .filter(Boolean);
  if (parts.length >= 3) {
    return [parts[0], parts[1], parts[2]];
  }
  return null;
}

export async function generateArcNarrative(
  career: Career,
  days: RunResult[],
  opts: {
    transport?: Transport;
    timeoutMs?: number;
    enabled?: boolean;
  } = {},
): Promise<ArcNarrativeParagraphs> {
  const payload = buildArcNarrativePayload(career, days);
  const fallback = fallbackArcNarrative(payload);
  const { transport, timeoutMs = 8000, enabled = true } = opts;

  if (!enabled || !transport || days.length === 0) {
    return fallback;
  }

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const raw = await transport({
      system: buildArcNarrativeSystemPrompt(career.title),
      user: buildArcNarrativeUserPrompt(payload),
      signal: controller.signal,
    });
    const parsed = parseParagraphs(raw);
    if (!parsed) return fallback;
    const headline = parsed[0].split(/[.!?]/)[0]?.trim() || fallback.headline;
    return { paragraphs: parsed, headline, source: "model" };
  } catch {
    return fallback;
  } finally {
    clearTimeout(timer);
  }
}

export function buildArcEnergySeries(
  career: Career,
  days: RunResult[],
): Array<{ day: number; energy: number; label?: string }> {
  const out: Array<{ day: number; energy: number; label?: string }> = [];
  days.forEach((day, i) => {
    const dayNum = day.arcDay ?? i + 1;
    const timeline = day.energyTimeline ?? buildEnergyTimeline(career, day);
    if (timeline.length === 0) {
      out.push({ day: dayNum, energy: day.finalState.energy });
      return;
    }
    timeline.forEach((snap) => {
      out.push({
        day: dayNum + (snap.energyAfter / 100) * 0.15,
        energy: snap.energyAfter,
        label: snap.label,
      });
    });
  });
  return out;
}
