import { NextRequest, NextResponse } from "next/server";
import {
  getCareer,
  getBeat,
  defineTerm,
  makeAnthropicTransport,
  fallbackDefinition,
} from "@careersim/engine";

export const maxDuration = 15;
export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  let careerId = "";
  let beatId = "";
  let term = "";
  try {
    const body = await req.json();
    careerId = body.careerId;
    beatId = body.beatId;
    term = body.term;
  } catch {
    return NextResponse.json({ error: "bad body" }, { status: 400 });
  }

  const career = getCareer(careerId);
  if (!career)
    return NextResponse.json({ error: "unknown career" }, { status: 404 });
  const beat = getBeat(career, beatId);
  if (!beat)
    return NextResponse.json({ error: "unknown beat" }, { status: 404 });

  const glossaryTerm = beat.glossary?.find((g) => g.term === term);
  const fallback = fallbackDefinition(
    glossaryTerm ?? { term, anchor_text: term },
  );

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ definition: fallback, source: "fallback" });
  }

  const out = await defineTerm(career, beat, term, glossaryTerm, {
    transport: makeAnthropicTransport(apiKey),
    timeoutMs: 4000,
    enabled: true,
  });
  return NextResponse.json(out);
}
