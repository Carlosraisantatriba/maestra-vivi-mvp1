import { NextResponse } from "next/server";
import { z } from "zod";
import { getTutorResponse } from "@/lib/tutor/service";
import { ensureSession, saveAttempt } from "@/lib/tutor/store";
import { getProfileIdFromRequest } from "@/lib/api/context";

const schema = z.object({
  text: z.string().min(1),
  participants: z.enum(["child", "parent", "both"]).default("child")
});

export async function POST(req: Request) {
  try {
    const body = schema.parse(await req.json());
    const childId = getProfileIdFromRequest();
    const sessionId = await ensureSession({ childId, mode: "reading", participants: body.participants, subject: "language" });

    const tutor = await getTutorResponse({
      mode: "reading",
      participants: body.participants,
      subject: "language",
      userMessage: `Texto para lectura:\n${body.text}`
    });

    await saveAttempt({
      sessionId,
      inputType: "doc",
      promptContext: { text: body.text.slice(0, 500) },
      modelResponse: tutor,
      isCorrect: null,
      errorTag: tutor.status.type
    });

    return NextResponse.json({ tutor, session_id: sessionId });
  } catch (error) {
    return NextResponse.json({ error: "reading_failed", detail: String(error) }, { status: 400 });
  }
}
