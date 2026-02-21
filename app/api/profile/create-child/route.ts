import { NextResponse } from "next/server";
import { z } from "zod";
import { getSupabaseServerClient } from "@/lib/supabase/server";
import { getProfileIdFromRequest } from "@/lib/api/context";

const schema = z.object({
  display_name: z.string().min(1),
  grade: z.string().default("3ro")
});

export async function POST(req: Request) {
  try {
    const supabase = getSupabaseServerClient();
    const parentId = getProfileIdFromRequest();
    const body = schema.parse(await req.json());

    const id = crypto.randomUUID();
    const { data, error } = await supabase
      .from("profiles")
      .insert({ id, role: "child", parent_id: parentId, display_name: body.display_name, grade: body.grade })
      .select("id, display_name, grade")
      .single();

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ child: data }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: "invalid_request", detail: String(error) }, { status: 400 });
  }
}
