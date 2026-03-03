import { randomUUID } from "node:crypto";
import path from "node:path";
import { NextResponse } from "next/server";
import { z } from "zod";
import { getProfileIdFromRequest, getRoleFromRequest } from "@/lib/api/context";
import { getSupabaseServerClient } from "@/lib/supabase/server";

const schema = z.object({
  subject: z.enum(["math", "language", "english"]),
  week_number: z.coerce.number().int().min(1).max(40),
  type: z.enum(["tarea", "lectura", "dictado", "practica"]),
  title: z.string().trim().optional().default(""),
  child_id: z.string().optional()
});

const allowedMime = new Set([
  "application/pdf",
  "image/jpeg",
  "image/png",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
]);

function deriveTitle(file: File, explicitTitle: string): string {
  if (explicitTitle) return explicitTitle;
  const base = file.name.replace(/\.[^.]+$/, "").trim();
  return base || "Material del colegio";
}

function deriveExt(file: File): string {
  const ext = path.extname(file.name).replace(".", "").toLowerCase();
  if (ext) return ext;
  if (file.type === "application/pdf") return "pdf";
  if (file.type === "image/jpeg") return "jpg";
  if (file.type === "image/png") return "png";
  if (file.type.includes("wordprocessingml.document")) return "docx";
  return "bin";
}

export async function POST(req: Request) {
  try {
    if (getRoleFromRequest() !== "parent") {
      return NextResponse.json(
        { error: "forbidden", message: "Solo un adulto puede subir material." },
        { status: 403 }
      );
    }

    const supabase = getSupabaseServerClient();
    const formData = await req.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json({ error: "validation", message: "Archivo obligatorio." }, { status: 400 });
    }

    if (!allowedMime.has(file.type)) {
      return NextResponse.json(
        { error: "validation", message: "Formato no permitido. Usá PDF, JPG, PNG o DOCX." },
        { status: 400 }
      );
    }

    const parsed = schema.parse({
      subject: formData.get("subject"),
      week_number: formData.get("week_number"),
      type: formData.get("type"),
      title: formData.get("title"),
      child_id: formData.get("child_id")
    });

    const parentId = getProfileIdFromRequest();
    const childId = parsed.child_id || "demo-child";
    const fileExt = deriveExt(file);
    const objectKey = `${parentId}/${childId}/${randomUUID()}.${fileExt}`;

    const upload = await supabase.storage.from("library").upload(objectKey, file, {
      upsert: false,
      contentType: file.type
    });

    if (upload.error) {
      return NextResponse.json({ error: "upload_failed", detail: upload.error.message }, { status: 500 });
    }

    const { data, error } = await supabase
      .from("library_items")
      .insert({
        parent_id: parentId,
        child_id: childId,
        subject: parsed.subject,
        week_number: parsed.week_number,
        week_label: `Semana ${parsed.week_number}`,
        type: parsed.type,
        title: deriveTitle(file, parsed.title),
        file_path: objectKey,
        file_type: file.type,
        ingestion_status: "pending"
      })
      .select("id")
      .single();

    if (error) {
      return NextResponse.json({ error: "db_insert_failed", detail: error.message }, { status: 500 });
    }

    return NextResponse.json({ id: data.id }, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "validation", message: "Revisá materia, semana y tipo.", fields: error.flatten() },
        { status: 400 }
      );
    }

    return NextResponse.json({ error: "upload_failed", detail: String(error) }, { status: 500 });
  }
}
