import { NextResponse } from "next/server";
import { z } from "zod";
import { getTutorResponse } from "@/lib/tutor/service";
import { ensureSession, saveAttempt } from "@/lib/tutor/store";
import { getProfileIdFromRequest } from "@/lib/api/context";

const schema = z.object({
  procedure_text: z.string().min(1),
  participants: z.enum(["child", "parent", "both"]).default("child"),
  subject: z.enum(["math", "language", "english"]).default("math"),
  session_id: z.string().uuid().optional(),
  has_image: z.boolean().optional()
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
      promptFile: "task_procedure_check.md",
      participants: body.participants,
      subject: body.subject,
      userMessage: `Revisá el procedimiento y encontrá el primer error:\n${body.procedure_text}`,
      hasImage: Boolean(body.has_image)
    });

    await saveAttempt({
      sessionId,
      inputType: body.has_image ? "photo_procedure" : "text",
      promptContext: { procedure_text: body.procedure_text },
      modelResponse: tutor,
      isCorrect: tutor.status.type === "correct",
      errorTag: tutor.status.type
    });

    return NextResponse.json({ tutor, session_id: sessionId });
  } catch (error) {
    return NextResponse.json({ error: "procedure_check_failed", detail: String(error) }, { status: 400 });
  }
}
