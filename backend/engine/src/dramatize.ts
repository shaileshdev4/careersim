import { Beat, Career, DayState } from "./types";
import {
  DramatizedBeat,
  buildRequest,
  buildSystemPrompt,
  buildUserPrompt,
  fallbackDramatization,
  validateResponse,
} from "./generate";

// ============================================================================
// DRAMATIZATION ORCHESTRATOR
// ----------------------------------------------------------------------------
// Wraps the contract end-to-end with the two guarantees that make live
// generation safe for a demo:
//   1. TIMEOUT -a slow/hanging model call can never stall the scene.
//   2. FALLBACK -any failure (network, timeout, invalid output) silently
//      returns the authored beat. The player never sees a broken scene.
// The transport is injected, so this is fully testable offline (no network).
// ============================================================================

export type Transport = (args: {
  system: string;
  user: string;
  signal?: AbortSignal;
}) => Promise<string>;

export interface DramatizeOptions {
  transport?: Transport; // omit -> always fallback (engine-only mode)
  timeoutMs?: number; // default 6000
  enabled?: boolean; // master switch; false -> always fallback
}

export async function dramatizeBeat(
  career: Career,
  beat: Beat,
  state: DayState,
  opts: DramatizeOptions = {},
): Promise<DramatizedBeat> {
  const { transport, timeoutMs = 6000, enabled = true } = opts;

  if (!enabled || !transport) {
    return fallbackDramatization(beat);
  }

  const req = buildRequest(career, beat, state);
  const system = buildSystemPrompt();
  const user = buildUserPrompt(req);

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const raw = await transport({ system, user, signal: controller.signal });
    const result = validateResponse(raw, beat);
    if (result.ok && result.dramatized) {
      return result.dramatized;
    }
    // Validation failed -> authored fallback. (Optionally log result.reason.)
    return fallbackDramatization(beat);
  } catch {
    return fallbackDramatization(beat);
  } finally {
    clearTimeout(timer);
  }
}

// ---------------------------------------------------------------------------
// A real Anthropic transport, used by the server route. Kept here so the
// contract + transport live together; the route just wires the API key.
// ---------------------------------------------------------------------------
export function makeAnthropicTransport(
  apiKey: string,
  model = "claude-sonnet-4-6",
): Transport {
  return async ({ system, user, signal }) => {
    const res = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "content-type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model,
        max_tokens: 600,
        system,
        messages: [{ role: "user", content: user }],
      }),
      signal,
    });
    if (!res.ok) throw new Error(`anthropic ${res.status}`);
    const data = await res.json();
    const text = Array.isArray(data?.content)
      ? data.content
          .filter((b: { type?: string }) => b?.type === "text")
          .map((b: { text?: string }) => b.text ?? "")
          .join("\n")
      : "";
    return text;
  };
}
