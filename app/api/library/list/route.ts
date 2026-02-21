import { NextResponse } from "next/server";
import { getSupabaseServerClient } from "@/lib/supabase/server";
import { getProfileIdFromRequest } from "@/lib/api/context";

export async function GET(req: Request) {
  const supabase = getSupabaseServerClient();
  const parentId = getProfileIdFromRequest();
  const { searchParams } = new URL(req.url);

  const subject = searchParams.get("subject");
  const week = searchParams.get("week");

  let query = supabase
    .from("library_items")
    .select("id, title, subject, week_label, ingestion_status, created_at")
    .eq("parent_id", parentId)
    .order("created_at", { ascending: false });

  if (subject) query = query.eq("subject", subject);
  if (week) query = query.eq("week_label", week);

  const { data, error } = await query;
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ items: data ?? [] });
}
