import { NextResponse } from "next/server";
import { getSupabaseServerClient } from "@/lib/supabase/server";
import { getProfileIdFromRequest, getRoleFromRequest } from "@/lib/api/context";

export async function GET() {
  const supabase = getSupabaseServerClient();
  const id = getProfileIdFromRequest();

  const { data } = await supabase.from("profiles").select("*").eq("id", id).maybeSingle();
  if (!data) {
    return NextResponse.json({
      id,
      role: getRoleFromRequest(),
      display_name: "Demo",
      grade: "3ro"
    });
  }

  return NextResponse.json(data);
}
