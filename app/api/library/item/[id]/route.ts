import { NextResponse } from "next/server";
import { getSupabaseServerClient } from "@/lib/supabase/server";

type SkillJoin = { code?: string } | Array<{ code?: string }> | null;
type SkillRow = { confidence: number; skills: SkillJoin };

export async function GET(_: Request, { params }: { params: { id: string } }) {
  const supabase = getSupabaseServerClient();

  const { data: item, error } = await supabase
    .from("library_items")
    .select("id, title, subject, week_number, type, ingestion_status, file_type, file_path, created_at")
    .eq("id", params.id)
    .single();

  if (error || !item) return NextResponse.json({ error: "not_found" }, { status: 404 });

  const { data: skillRows } = await supabase
    .from("library_item_skills")
    .select("confidence, skills(code)")
    .eq("library_item_id", params.id);

  const skills = ((skillRows ?? []) as SkillRow[]).map((row) => {
    const relation = Array.isArray(row.skills) ? row.skills[0] : row.skills;
    return { code: relation?.code ?? "", confidence: row.confidence };
  });

  const { data: chunks } = await supabase
    .from("library_chunks")
    .select("chunk_text")
    .eq("library_item_id", params.id)
    .order("page_num", { ascending: true })
    .limit(4);

  const extractedText = (chunks ?? []).map((c) => c.chunk_text).join("\n\n").trim();

  const signed = await supabase.storage.from("library").createSignedUrl(item.file_path, 60 * 60);
  const previewUrl = signed.data?.signedUrl ?? null;

  return NextResponse.json({
    item: {
      ...item,
      skills,
      extracted_text: extractedText || null,
      preview_url: previewUrl,
      use_in_task_url: `/child/task?material_id=${item.id}`
    }
  });
}
