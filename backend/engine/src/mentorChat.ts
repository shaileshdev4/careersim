import { Beat, Career, CareerMentor, Choice } from "./types";
import { Transport } from "./dramatize";

const MAX_WORDS = 50;

export interface MentorContext {
  recentTranscript: string;
  scene: string;
  choiceLabel: string;
  consequence: string;
  userQuestion: string;
}

export function buildMentorSystemPrompt(mentor: CareerMentor): string {
  const redLines = mentor.redLines.map((r) => `- ${r}`).join("\n");
  return `You are ${mentor.name}, ${mentor.role} in a career simulation game played by a teenager. They are playing a junior in your field, learning what the work actually feels like.

Voice: ${mentor.voice}

Your job: answer the player's question about the situation they are in RIGHT NOW. You can reference what just happened in the day. You speak in your own voice as this character - not as an AI.

Hard rules:
- 1–3 short sentences, max 50 words total.
- Stay in character. Never break the fourth wall. Never mention you are AI.
- Only answer things a real ${mentor.role} would know about THIS job.
- If asked about anything off-topic (medical advice, the player's real life, the game itself), say one in-character sentence redirecting them to the day's decision.
${redLines}
- Be honest about uncertainty. A real senior says "depends" sometimes.

Return ONLY the dialogue. No stage directions. No name prefix.`;
}

export function buildMentorUserPrompt(
  career: Career,
  beat: Beat,
  ctx: MentorContext,
): string {
  return `Career: ${career.title}
The day so far (last 2 scenes summarized): ${ctx.recentTranscript || "(start of day)"}
Current scene: "${ctx.scene}"
Choice the player just made: "${ctx.choiceLabel}"
Consequence they just saw: "${ctx.consequence}"

Player asks: "${ctx.userQuestion}"`;
}

function trimMentorReply(text: string): string {
  return text
    .trim()
    .replace(/^["']|["']$/g, "")
    .split(/\s+/)
    .slice(0, MAX_WORDS)
    .join(" ");
}

export async function mentorReply(
  career: Career,
  beat: Beat,
  mentor: CareerMentor,
  ctx: MentorContext,
  opts: {
    transport?: Transport;
    timeoutMs?: number;
    enabled?: boolean;
  } = {},
): Promise<{ reply: string; ok: boolean }> {
  const { transport, timeoutMs = 6000, enabled = true } = opts;

  if (!enabled || !transport) {
    return { reply: "", ok: false };
  }

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const raw = await transport({
      system: buildMentorSystemPrompt(mentor),
      user: buildMentorUserPrompt(career, beat, ctx),
      signal: controller.signal,
    });
    const reply = trimMentorReply(raw);
    if (!reply) return { reply: "", ok: false };
    return { reply, ok: true };
  } catch {
    return { reply: "", ok: false };
  } finally {
    clearTimeout(timer);
  }
}

export function mentorBusyMessage(mentor: CareerMentor): string {
  return `${mentor.name} is scrubbing in - try again in a sec`;
}

export function summarizeRecentTranscript(scenes: string[], max = 2): string {
  return scenes
    .slice(-max)
    .map((s, i) => `${i + 1}. ${s.slice(0, 120)}${s.length > 120 ? "…" : ""}`)
    .join(" ");
}
