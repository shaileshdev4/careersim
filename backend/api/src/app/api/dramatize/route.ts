import { NextRequest, NextResponse } from "next/server";
import { getCareer } from "@careersim/engine";
import { getBeat, initState } from "@careersim/engine";
import { dramatizeBeat, makeAnthropicTransport } from "@careersim/engine";
import { fallbackDramatization } from "@careersim/engine";
import { DayState } from "@careersim/engine";

// Beat dramatization endpoint.
// Body: { careerId, beatId, state }
// Returns: DramatizedBeat. ALWAYS 200 with a usable result -if anything is
// off (no key, bad input, model failure), it returns the authored fallback so
// the client never has to branch on errors. Engine-first, demo-safe.
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

  // No key configured -> authored fallback, still a 200.
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
