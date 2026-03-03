import { randomUUID } from "node:crypto";
import path from "node:path";
import { NextResponse } from "next/server";
import { resolveLibraryAuthContext } from "@/lib/api/library-auth";
import { getSupabaseServerClient } from "@/lib/supabase/server";

type NormalizedSubject = "math" | "language" | "english";
type NormalizedType = "tarea" | "lectura" | "dictado" | "practica";

const allowedMime = new Set([
  "application/pdf",
  "image/jpeg",
  "image/png",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
]);

class InputError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "InputError";
  }
}

function normalizeToken(value: unknown): string {
  return String(value ?? "")
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "");
}

function normalizeSubject(value: unknown): NormalizedSubject {
  const token = normalizeToken(value);
  if (token === "math" || token === "matematica") return "math";
  if (token === "language" || token === "lengua") return "language";
  if (token === "english" || token === "ingles") return "english";
  throw new InputError("Materia inválida. Elegí Matemática, Lengua o Inglés.");
}

function normalizeType(value: unknown): NormalizedType {
  const token = normalizeToken(value);
  if (token === "tarea") return "tarea";
  if (token === "lectura") return "lectura";
  if (token === "dictado") return "dictado";
  if (token === "practica") return "practica";
  throw new InputError("Tipo inválido. Elegí Tarea, Lectura, Dictado o Práctica.");
}

function parseWeekNumber(value: unknown): number {
  if (typeof value === "number" && Number.isInteger(value) && value >= 1 && value <= 40) return value;
  const token = String(value ?? "").trim();
  const direct = Number.parseInt(token, 10);
  if (Number.isInteger(direct) && direct >= 1 && direct <= 40) return direct;
  const extracted = token.match(/\d{1,2}/)?.[0];
  if (!extracted) throw new InputError("Semana inválida. Usá un valor entre 1 y 40.");
  const normalized = Number.parseInt(extracted, 10);
  if (!Number.isInteger(normalized) || normalized < 1 || normalized > 40) {
    throw new InputError("Semana inválida. Usá un valor entre 1 y 40.");
  }
  return normalized;
}

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
    const auth = await resolveLibraryAuthContext();
    if (!auth.ok) {
      console.error("[library/upload] auth_error", { error: auth.error, message: auth.message });
      return NextResponse.json({ error: auth.error, message: auth.message }, { status: auth.status });
    }

    if (auth.data.role !== "parent") {
      console.error("[library/upload] forbidden", { role: auth.data.role });
      return NextResponse.json(
        { error: "forbidden", message: "Solo un adulto puede subir material." },
        { status: 403 }
      );
    }

    const supabase = getSupabaseServerClient();
    const formData = await req.formData();
    const file = formData.get("file") as File | null;
    const rawPayload = {
      subject: formData.get("subject"),
      week_number: formData.get("week_number"),
      type: formData.get("type"),
      title: formData.get("title"),
      child_id: formData.get("child_id")
    };

    console.info("[library/upload] payload", rawPayload);

    if (!file) {
      console.error("[library/upload] validation_error", { payload: rawPayload, error: "Archivo obligatorio." });
      return NextResponse.json({ error: "validation", message: "Archivo obligatorio." }, { status: 400 });
    }

    if (!allowedMime.has(file.type)) {
      console.error("[library/upload] validation_error", {
        payload: rawPayload,
        error: `Formato no permitido: ${file.type}`
      });
      return NextResponse.json(
        { error: "validation", message: "Formato no permitido. Usá PDF, JPG, PNG o DOCX." },
        { status: 400 }
      );
    }

    const subject = normalizeSubject(rawPayload.subject);
    const weekNumber = parseWeekNumber(rawPayload.week_number);
    const type = normalizeType(rawPayload.type);
    const title = String(rawPayload.title ?? "").trim();
    const childIdInput = String(rawPayload.child_id ?? "").trim();

    const parentId = auth.data.parentId;
    const childId = childIdInput || auth.data.userId;
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
        subject,
        week_number: weekNumber,
        week_label: `Semana ${weekNumber}`,
        type,
        title: deriveTitle(file, title),
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
    if (error instanceof InputError) {
      console.error("[library/upload] validation_error", { error: error.message });
      return NextResponse.json({ error: "validation", message: error.message }, { status: 400 });
    }

    const detail = error instanceof Error ? `${error.message}\n${error.stack ?? ""}` : String(error);
    console.error("[library/upload] unhandled_error", { error: detail });
    return NextResponse.json({ error: "upload_failed", detail: String(error) }, { status: 500 });
  }
}
