import { Beat, Career, GlossaryTerm } from "./types";
import { Transport } from "./dramatize";

const MAX_WORDS = 25;

export function buildDefineSystemPrompt(): string {
  return `You are a domain expert helping a teenager who is playing a career simulation game understand a single specific term that just appeared in a scene.

Given the term, the career, and the surrounding scene context, write ONE sentence (max 25 words) that explains what the term means in the context of this career's daily work. Plain language. No jargon. No analogies that require more knowledge than the term itself.

If the term is about a specific action ("pre-round"), explain what that action is. If it's a place or object ("the list", "the OR"), explain what it is. If it's a role ("the attending", "the MD"), explain who.

Return ONLY the sentence. No preamble. No quotes around it.`;
}

export function buildDefineUserPrompt(
  career: Career,
  beat: Beat,
  term: string,
): string {
  return `Career: ${career.title}
Scene context: "${beat.scene}"
Term to explain: "${term}"`;
}

export function fallbackDefinition(term: GlossaryTerm): string {
  if (term.fallback) return term.fallback;
  return `${term.term} is a term people use in this line of work - tap again when live help is on.`;
}

function trimToWordCap(text: string, max = MAX_WORDS): string {
  const words = text
    .trim()
    .replace(/^["']|["']$/g, "")
    .split(/\s+/);
  if (words.length <= max) return words.join(" ");
  return `${words.slice(0, max).join(" ")}…`;
}

export async function defineTerm(
  career: Career,
  beat: Beat,
  term: string,
  glossaryTerm: GlossaryTerm | undefined,
  opts: {
    transport?: Transport;
    timeoutMs?: number;
    enabled?: boolean;
  } = {},
): Promise<{ definition: string; source: "model" | "fallback" }> {
  const { transport, timeoutMs = 4000, enabled = true } = opts;
  const fallback = fallbackDefinition(
    glossaryTerm ?? { term, anchor_text: term },
  );

  if (!enabled || !transport) {
    return { definition: fallback, source: "fallback" };
  }

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const raw = await transport({
      system: buildDefineSystemPrompt(),
      user: buildDefineUserPrompt(career, beat, term),
      signal: controller.signal,
    });
    const cleaned = trimToWordCap(raw);
    if (!cleaned) return { definition: fallback, source: "fallback" };
    return { definition: cleaned, source: "model" };
  } catch {
    return { definition: fallback, source: "fallback" };
  } finally {
    clearTimeout(timer);
  }
}
