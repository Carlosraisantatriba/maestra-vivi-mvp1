import { getSupabaseServerClient } from "@/lib/supabase/server";
import type { TutorResponse } from "@/lib/tutor/schema";

export async function ensureSession(input: {
  sessionId?: string;
  childId: string;
  mode: "task" | "practice" | "reading" | "dictation";
  participants: "child" | "parent" | "both";
  subject?: "math" | "language" | "english";
  weekLabel?: string;
}) {
  const supabase = getSupabaseServerClient();

  if (input.sessionId) {
    return input.sessionId;
  }

  const { data, error } = await supabase
    .from("sessions")
    .insert({
      child_id: input.childId,
      mode: input.mode,
      participants: input.participants,
      subject: input.subject,
      week_label: input.weekLabel
    })
    .select("id")
    .single();

  if (error) throw error;
  return data.id as string;
}

export async function saveAttempt(input: {
  sessionId: string;
  skillId?: string;
  inputType: "text" | "voice" | "photo_result" | "photo_procedure" | "doc";
  promptContext: Record<string, unknown>;
  modelResponse: TutorResponse;
  isCorrect: boolean | null;
  errorTag?: string;
}) {
  const supabase = getSupabaseServerClient();
  await supabase.from("attempts").insert({
    session_id: input.sessionId,
    skill_id: input.skillId,
    input_type: input.inputType,
    prompt_context: input.promptContext,
    model_response: input.modelResponse,
    is_correct: input.isCorrect,
    error_tag: input.errorTag
  });
}

export async function applyMasteryDelta(input: {
  childId: string;
  skillCode?: string;
  isCorrect: boolean;
}) {
  if (!input.skillCode) return;
  const supabase = getSupabaseServerClient();

  const { data: skill } = await supabase.from("skills").select("id").eq("code", input.skillCode).maybeSingle();
  if (!skill?.id) return;

  const { data: mastery } = await supabase
    .from("skill_mastery")
    .select("score")
    .eq("child_id", input.childId)
    .eq("skill_id", skill.id)
    .maybeSingle();

  const base = mastery?.score ?? 50;
  const delta = input.isCorrect ? 4 : -3;
  const next = Math.max(0, Math.min(100, base + delta));

  await supabase.from("skill_mastery").upsert({
    child_id: input.childId,
    skill_id: skill.id,
    score: next,
    updated_at: new Date().toISOString()
  });
}
