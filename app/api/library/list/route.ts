import { NextResponse } from "next/server";
import { z } from "zod";
import { getProfileIdFromRequest, getRoleFromRequest } from "@/lib/api/context";
import { getSupabaseServerClient } from "@/lib/supabase/server";

const querySchema = z.object({
  subject: z.enum(["math", "language", "english"]).optional(),
  week_number: z.coerce.number().int().min(1).max(40).optional(),
  type: z.enum(["tarea", "lectura", "dictado", "practica"]).optional()
});

export async function GET(req: Request) {
  const supabase = getSupabaseServerClient();
  const role = getRoleFromRequest();
  const profileId = getProfileIdFromRequest();
  const { searchParams } = new URL(req.url);

  const parsed = querySchema.safeParse({
    subject: searchParams.get("subject") || undefined,
    week_number: searchParams.get("week_number") || undefined,
    type: searchParams.get("type") || undefined
  });

  if (!parsed.success) {
    return NextResponse.json({ error: "invalid_query", detail: parsed.error.flatten() }, { status: 400 });
  }

  let query = supabase
    .from("library_items")
    .select("id, title, subject, week_number, type, file_type, ingestion_status, created_at")
    .order("created_at", { ascending: false });

  if (role === "parent") {
    query = query.eq("parent_id", profileId);
  } else {
    query = query.eq("child_id", profileId);
  }

  if (parsed.data.subject) query = query.eq("subject", parsed.data.subject);
  if (parsed.data.week_number) query = query.eq("week_number", parsed.data.week_number);
  if (parsed.data.type) query = query.eq("type", parsed.data.type);

  const { data, error } = await query;
  if (error) return NextResponse.json({ error: "query_failed", detail: error.message }, { status: 500 });

  return NextResponse.json({ items: data ?? [] });
}
