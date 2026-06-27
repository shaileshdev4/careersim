import { NextRequest, NextResponse } from "next/server";
import {
  getCareer,
  getBeat,
  mentorReply,
  mentorBusyMessage,
  makeAnthropicTransport,
} from "@careersim/engine";

export const maxDuration = 15;
export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const career = getCareer(body.careerId);
    if (!career)
      return NextResponse.json({ error: "unknown career" }, { status: 404 });
    const beat = getBeat(career, body.beatId);
    if (!beat)
      return NextResponse.json({ error: "unknown beat" }, { status: 404 });
    const mentor = career.mentor;
    if (!mentor)
      return NextResponse.json({ error: "no mentor" }, { status: 404 });

    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) {
      return NextResponse.json({
        reply: mentorBusyMessage(mentor),
        ok: false,
      });
    }

    const out = await mentorReply(
      career,
      beat,
      mentor,
      {
        recentTranscript: body.recentTranscript ?? "",
        scene: body.scene ?? beat.scene,
        choiceLabel: body.choiceLabel ?? "",
        consequence: body.consequence ?? "",
        userQuestion: body.userQuestion ?? "",
      },
      {
        transport: makeAnthropicTransport(apiKey),
        timeoutMs: 6000,
        enabled: true,
      },
    );

    if (!out.ok) {
      return NextResponse.json({
        reply: mentorBusyMessage(mentor),
        ok: false,
      });
    }
    return NextResponse.json({ reply: out.reply, ok: true, source: "model" });
  } catch {
    return NextResponse.json({ reply: "", ok: false }, { status: 400 });
  }
}
