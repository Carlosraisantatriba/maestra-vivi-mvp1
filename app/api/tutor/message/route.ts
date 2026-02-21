import { NextResponse } from "next/server";
import { z } from "zod";
import { getTutorResponse } from "@/lib/tutor/service";

const schema = z.object({
  mode: z.enum(["task", "practice", "reading", "dictation"]),
  message: z.string(),
  participants: z.enum(["child", "parent", "both"]).default("child"),
  subject: z.enum(["math", "language", "english"]).optional()
});

export async function POST(req: Request) {
  try {
    const body = schema.parse(await req.json());
    const tutor = await getTutorResponse({
      mode: body.mode,
      userMessage: body.message,
      participants: body.participants,
      subject: body.subject
    });

    return NextResponse.json({ tutor });
  } catch (error) {
    return NextResponse.json({ error: "invalid_request", detail: String(error) }, { status: 400 });
  }
}
