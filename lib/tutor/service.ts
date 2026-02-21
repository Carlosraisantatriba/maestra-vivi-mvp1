import { openai } from "@/lib/openai";
import { TutorResponseSchema, type TutorResponse } from "@/lib/tutor/schema";
import { buildFallbackTutorResponse } from "@/lib/tutor/fallback";
import { selectTutorModel } from "@/lib/tutor/router";
import { moderateText } from "@/lib/tutor/moderation";
import { loadPrompt } from "@/lib/tutor/prompts";
import { enforceParticipantRules } from "@/lib/tutor/participants";

export type TutorMode = "task" | "practice" | "reading" | "dictation";

export type TutorInput = {
  mode: TutorMode;
  participants: "child" | "parent" | "both";
  userMessage: string;
  subject?: string;
  hasImage?: boolean;
  consecutiveFailures?: number;
  promptFile?: string;
};

function cleanJsonFence(text: string): string {
  return text.replace(/^```json\s*/i, "").replace(/```$/i, "").trim();
}

export async function getTutorResponse(input: TutorInput): Promise<TutorResponse> {
  const moderationIn = await moderateText(input.userMessage);
  if (moderationIn.flagged) {
    const base = buildFallbackTutorResponse(input.participants);
    return {
      ...base,
      child_message: "Necesito que una persona adulta continúe esta parte conmigo.",
      safety: { needs_handoff: true, reason: moderationIn.reason || "input_flagged" }
    };
  }

  const promptName =
    input.promptFile ??
    (input.mode === "task"
      ? "task_answer_check.md"
      : input.mode === "reading"
        ? "reading.md"
        : input.mode === "dictation"
          ? "dictation.md"
          : "system_tutor.md");

  const [systemTutor, modePrompt] = await Promise.all([
    loadPrompt("system_tutor.md"),
    loadPrompt(promptName)
  ]);

  const model = selectTutorModel({
    hasImage: Boolean(input.hasImage),
    consecutiveFailures: input.consecutiveFailures ?? 0,
    confidence: 1
  });

  const response = await openai.responses.create({
    model,
    input: [
      {
        role: "system",
        content: `${systemTutor}\n\nPrompt específico:\n${modePrompt}`
      },
      {
        role: "user",
        content: `participants=${input.participants}; subject=${input.subject ?? ""}; message=${input.userMessage}`
      }
    ],
    temperature: 0.3
  });

  const text = response.output_text || "";
  let parsed: TutorResponse;

  try {
    parsed = TutorResponseSchema.parse(JSON.parse(cleanJsonFence(text)));
  } catch {
    parsed = buildFallbackTutorResponse(input.participants);
  }

  const moderationOut = await moderateText(JSON.stringify(parsed));
  if (moderationOut.flagged) {
    return {
      ...parsed,
      child_message: "Para esta parte necesito ayuda de una persona adulta.",
      safety: { needs_handoff: true, reason: moderationOut.reason || "output_flagged" }
    };
  }

  return enforceParticipantRules(input.participants, parsed);
}
