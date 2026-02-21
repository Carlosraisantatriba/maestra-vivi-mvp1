import { NextResponse } from "next/server";
import { getSupabaseServerClient } from "@/lib/supabase/server";

export async function GET(req: Request) {
  const supabase = getSupabaseServerClient();
  const { searchParams } = new URL(req.url);
  const childId = searchParams.get("child_id") ?? "demo-child";

  const { data: sessions } = await supabase
    .from("sessions")
    .select("id, subject, created_at")
    .eq("child_id", childId)
    .order("created_at", { ascending: false })
    .limit(200);

  const sessionIds = (sessions ?? []).map((s) => s.id);
  const { data: attempts } = sessionIds.length
    ? await supabase.from("attempts").select("session_id, is_correct").in("session_id", sessionIds)
    : { data: [] as Array<{ session_id: string; is_correct: boolean | null }> };

  const accuracyBySubject: Record<string, number> = { math: 0, language: 0, english: 0 };

  for (const subject of ["math", "language", "english"] as const) {
    const subjectSessionIds = (sessions ?? []).filter((s) => s.subject === subject).map((s) => s.id);
    const subjectAttempts = (attempts ?? []).filter(
      (a) => subjectSessionIds.includes(a.session_id) && typeof a.is_correct === "boolean"
    );

    if (subjectAttempts.length > 0) {
      const correct = subjectAttempts.filter((a) => a.is_correct).length;
      accuracyBySubject[subject] = Math.round((correct / subjectAttempts.length) * 100);
    }
  }

  const { data: weakRows } = await supabase
    .from("skill_mastery")
    .select("score, skills(code, name)")
    .eq("child_id", childId)
    .order("score", { ascending: true })
    .limit(5);

  const weakSkills = (weakRows ?? []).map((row: any) => ({
    code: row.skills?.code ?? "",
    name: row.skills?.name ?? "",
    score: row.score
  }));

  const recommendation =
    weakSkills.length > 0
      ? `Reforzar ${weakSkills[0].name} con 10 minutos de práctica adaptativa y una actividad del colegio.`
      : "Mantener práctica corta diaria de 10 minutos.";

  return NextResponse.json({
    overview: {
      total_sessions: sessions?.length ?? 0,
      total_time_minutes: (sessions?.length ?? 0) * 12,
      accuracy_by_subject: accuracyBySubject
    },
    weak_skills: weakSkills,
    recommendation
  });
}
