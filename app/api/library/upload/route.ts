import { NextResponse } from "next/server";
import { getSupabaseServerClient } from "@/lib/supabase/server";
import { getProfileIdFromRequest } from "@/lib/api/context";

export async function POST(req: Request) {
  try {
    const supabase = getSupabaseServerClient();
    const formData = await req.formData();
    let file = formData.get("file") as File | null;
    const textContent = String(formData.get("text_content") ?? "");
    const title = String(formData.get("title") ?? "");
    const subject = String(formData.get("subject") ?? "language");
    const weekLabel = String(formData.get("week_label") ?? "Semana 1");

    if (!file && textContent) {
      file = new File([textContent], `${title || "dictado"}.txt`, { type: "text/plain" });
    }

    if (!file || !title) {
      return NextResponse.json({ error: "file_and_title_required" }, { status: 400 });
    }

    const parentId = getProfileIdFromRequest();
    const safeName = `${Date.now()}-${file.name.replace(/\s+/g, "-")}`;
    const filePath = `${parentId}/${safeName}`;

    const upload = await supabase.storage.from("library").upload(filePath, file, {
      upsert: true,
      contentType: file.type
    });

    if (upload.error) return NextResponse.json({ error: upload.error.message }, { status: 500 });

    const { data, error } = await supabase
      .from("library_items")
      .insert({
        parent_id: parentId,
        subject,
        week_label: weekLabel,
        title,
        file_path: filePath,
        file_type: file.type || "application/octet-stream",
        ingestion_status: "pending"
      })
      .select("id")
      .single();

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    return NextResponse.json({ id: data.id, file_path: filePath }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: "upload_failed", detail: String(error) }, { status: 500 });
  }
}
