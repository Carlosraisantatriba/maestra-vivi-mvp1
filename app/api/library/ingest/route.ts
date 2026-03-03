import { NextResponse } from "next/server";
import { z } from "zod";
import { resolveLibraryAuthContext } from "@/lib/api/library-auth";
import { runIngestForItem } from "@/lib/library/ingest";
import { getSupabaseServerClient } from "@/lib/supabase/server";

const schema = z.object({ library_item_id: z.string().uuid() });

export async function POST(req: Request) {
  try {
    const auth = await resolveLibraryAuthContext();
    if (!auth.ok) {
      return NextResponse.json({ error: auth.error, message: auth.message }, { status: auth.status });
    }
    if (auth.data.role !== "parent") {
      return NextResponse.json(
        { error: "forbidden", message: "Solo un adulto puede ejecutar la ingesta." },
        { status: 403 }
      );
    }

    const body = schema.parse(await req.json());
    const supabase = getSupabaseServerClient();
    const { data: item, error: itemError } = await supabase
      .from("library_items")
      .select("parent_id")
      .eq("id", body.library_item_id)
      .single();

    if (itemError || !item) {
      return NextResponse.json({ error: "not_found", message: "Material no encontrado." }, { status: 404 });
    }

    if (item.parent_id !== auth.data.parentId) {
      return NextResponse.json({ error: "forbidden", message: "No autorizado para este material." }, { status: 403 });
    }

    const chunks = await runIngestForItem(body.library_item_id);
    return NextResponse.json({ ok: true, chunks });
  } catch (error) {
    return NextResponse.json({ error: "ingest_failed", detail: String(error) }, { status: 500 });
  }
}
