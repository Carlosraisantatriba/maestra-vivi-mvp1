import { NextResponse } from "next/server";
import { z } from "zod";
import { getTutorResponse } from "@/lib/tutor/service";
import { ensureSession, saveAttempt, applyMasteryDelta } from "@/lib/tutor/store";
import { getProfileIdFromRequest } from "@/lib/api/context";
import { sanitizeIncorrectTutorResponse } from "@/lib/tutor/policy";

const schema = z.object({
  statement: z.string().min(1),
  answer: z.string().min(1),
  participants: z.enum(["child", "parent", "both"]).default("child"),
  subject: z.enum(["math", "language", "english"]).default("math"),
  session_id: z.string().uuid().optional()
});

export async function POST(req: Request) {
  try {
    const body = schema.parse(await req.json());
    const childId = getProfileIdFromRequest();

    const sessionId = await ensureSession({
      sessionId: body.session_id,
      childId,
      mode: "task",
      participants: body.participants,
      subject: body.subject
    });

    const tutor = await getTutorResponse({
      mode: "task",
      participants: body.participants,
      subject: body.subject,
      userMessage: `Consigna: ${body.statement}\nRespuesta del alumno: ${body.answer}`
    });

    const forced = sanitizeIncorrectTutorResponse(tutor);

    await saveAttempt({
      sessionId,
      inputType: "text",
      promptContext: { statement: body.statement, answer: body.answer },
      modelResponse: forced,
      isCorrect: forced.status.type === "correct",
      errorTag: forced.status.type
    });

    await applyMasteryDelta({
      childId,
      skillCode: forced.skills[0]?.code,
      isCorrect: forced.status.type === "correct"
    });

    return NextResponse.json({ tutor: forced, session_id: sessionId });
  } catch (error) {
    return NextResponse.json({ error: "answer_check_failed", detail: String(error) }, { status: 400 });
  }
}
