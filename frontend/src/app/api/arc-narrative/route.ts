import { NextRequest, NextResponse } from "next/server";
import {
  getCareer,
  generateArcNarrative,
  fallbackArcNarrative,
  buildArcNarrativePayload,
  makeAnthropicTransport,
  RunResult,
} from "@careersim/engine";

export const maxDuration = 20;
export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  let careerId = "";
  let days: RunResult[] = [];
  try {
    const body = await req.json();
    careerId = body.careerId;
    days = body.days ?? [];
  } catch {
    return NextResponse.json({ error: "bad body" }, { status: 400 });
  }

  const career = getCareer(careerId);
  if (!career)
    return NextResponse.json({ error: "unknown career" }, { status: 404 });

  const payload = buildArcNarrativePayload(career, days);
  const fallback = fallbackArcNarrative(payload);

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return NextResponse.json(fallback);
  }

  const out = await generateArcNarrative(career, days, {
    transport: makeAnthropicTransport(apiKey),
    timeoutMs: 8000,
    enabled: true,
  });
  return NextResponse.json(out);
}
