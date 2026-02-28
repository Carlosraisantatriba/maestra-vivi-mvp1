import { NextResponse } from "next/server";
import { getSupabaseServerClient } from "@/lib/supabase/server";

export async function GET(_: Request, { params }: { params: { id: string } }) {
  const supabase = getSupabaseServerClient();

  const { data: item, error } = await supabase
    .from("library_items")
    .select("id, title, subject, week_label, ingestion_status, file_type")
    .eq("id", params.id)
    .single();

  if (error || !item) return NextResponse.json({ error: "not_found" }, { status: 404 });

  const { data: skillRows } = await supabase
    .from("library_item_skills")
    .select("confidence, skills(code)")
    .eq("library_item_id", params.id);

  type SkillJoin = { code?: string } | Array<{ code?: string }> | null;
  type SkillRow = { confidence: number; skills: SkillJoin };

  const skills = ((skillRows ?? []) as SkillRow[]).map((row) => {
    const relation = Array.isArray(row.skills) ? row.skills[0] : row.skills;
    return { code: relation?.code ?? "", confidence: row.confidence };
  });

  return NextResponse.json({ item: { ...item, skills } });
}
