import { NextResponse } from "next/server";
import { getSupabaseServerClient } from "@/lib/supabase/server";
import { getProfileIdFromRequest } from "@/lib/api/context";
import { ensureSession } from "@/lib/tutor/store";

export async function POST() {
  const childId = getProfileIdFromRequest();
  const supabase = getSupabaseServerClient();

  await ensureSession({ childId, mode: "practice", participants: "child" });

  const { data: weak } = await supabase
    .from("skill_mastery")
    .select("score, skills(code, name)")
    .eq("child_id", childId)
    .order("score", { ascending: true })
    .limit(4);

  const practice = (weak ?? []).map((row: any) => ({
    question: `Practiquemos ${row.skills?.name ?? "este skill"}. ¿Cómo lo resolverías?`,
    expected_answer: "Respuesta abierta guiada",
    hint: `Apuntá a mejorar ${row.skills?.code ?? "skill"}`
  }));

  if (practice.length === 0) {
    practice.push(
      {
        question: "Resolvé: 230 + 145",
        expected_answer: "375",
        hint: "Sumá centenas, decenas y unidades."
      },
      {
        question: "¿Qué quiso decir el personaje principal en el cuento?",
        expected_answer: "Respuesta inferencial breve",
        hint: "Buscá pistas en lo que hizo y dijo."
      }
    );
  }

  return NextResponse.json({ practice });
}
