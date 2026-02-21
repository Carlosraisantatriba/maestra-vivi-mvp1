import { NextResponse } from "next/server";
import { z } from "zod";
import { getTutorResponse } from "@/lib/tutor/service";
import { ensureSession, saveAttempt } from "@/lib/tutor/store";
import { getProfileIdFromRequest } from "@/lib/api/context";

const schema = z.object({
  text: z.string().min(1),
  participants: z.enum(["child", "parent", "both"]).default("child"),
  subject: z.enum(["language", "english"]).default("language")
});

export async function POST(req: Request) {
  try {
    const body = schema.parse(await req.json());
    const childId = getProfileIdFromRequest();
    const sessionId = await ensureSession({ childId, mode: "dictation", participants: body.participants, subject: body.subject });

    const tutor = await getTutorResponse({
      mode: "dictation",
      participants: body.participants,
      subject: body.subject,
      userMessage: `Corregí este dictado y devolvé 1-2 errores por vuelta:\n${body.text}`
    });

    await saveAttempt({
      sessionId,
      inputType: "photo_result",
      promptContext: { text: body.text.slice(0, 500) },
      modelResponse: tutor,
      isCorrect: tutor.status.type === "correct",
      errorTag: tutor.status.type
    });

    return NextResponse.json({ tutor, session_id: sessionId });
  } catch (error) {
    return NextResponse.json({ error: "dictation_failed", detail: String(error) }, { status: 400 });
  }
}
