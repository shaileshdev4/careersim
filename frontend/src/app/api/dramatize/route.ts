import { NextRequest, NextResponse } from "next/server";
import { getCareer } from "@careersim/engine";
import { getBeat, initState } from "@careersim/engine";
import { dramatizeBeat, makeAnthropicTransport } from "@careersim/engine";
import { fallbackDramatization } from "@careersim/engine";
import { DayState } from "@careersim/engine";

/** Anthropic call can take up to 6s; allow headroom on Vercel serverless. */
export const maxDuration = 15;
export const runtime = "nodejs";

// POST /api/dramatize — { careerId, beatId, state } → DramatizedBeat
// Always returns usable text (authored fallback on missing key / model failure).
export async function POST(req: NextRequest) {
  let careerId = "";
  let beatId = "";
  let state: DayState | undefined;
  try {
    const body = await req.json();
    careerId = body.careerId;
    beatId = body.beatId;
    state = body.state;
  } catch {
    return NextResponse.json({ error: "bad body" }, { status: 400 });
  }

  const career = getCareer(careerId);
  if (!career)
    return NextResponse.json({ error: "unknown career" }, { status: 404 });
  const beat = getBeat(career, beatId);
  if (!beat)
    return NextResponse.json({ error: "unknown beat" }, { status: 404 });

  const safeState = state ?? initState(career);
  const apiKey = process.env.ANTHROPIC_API_KEY;

  if (!apiKey) {
    return NextResponse.json(fallbackDramatization(beat));
  }

  const out = await dramatizeBeat(career, beat, safeState, {
    transport: makeAnthropicTransport(apiKey),
    timeoutMs: 6000,
    enabled: true,
  });
  return NextResponse.json(out);
}
