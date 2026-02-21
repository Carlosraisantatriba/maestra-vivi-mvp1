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

  const skills = (skillRows ?? []).map((row: any) => ({ code: row.skills?.code ?? "", confidence: row.confidence }));

  return NextResponse.json({ item: { ...item, skills } });
}
