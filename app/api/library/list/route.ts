import { NextResponse } from "next/server";
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import { resolveLibraryIdentityByUserId } from "@/lib/api/library-auth";
import { getSupabaseServerClient } from "@/lib/supabase/server";

type NormalizedSubject = "math" | "language" | "english";
type NormalizedType = "tarea" | "lectura" | "dictado" | "practica";

function normalizeToken(value: unknown): string {
  return String(value ?? "")
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "");
}

function normalizeSubject(value: string | null): NormalizedSubject | undefined {
  if (!value) return undefined;
  const token = normalizeToken(value);
  if (token === "math" || token === "matematica") return "math";
  if (token === "language" || token === "lengua") return "language";
  if (token === "english" || token === "ingles") return "english";
  return undefined;
}

function normalizeType(value: string | null): NormalizedType | undefined {
  if (!value) return undefined;
  const token = normalizeToken(value);
  if (token === "tarea") return "tarea";
  if (token === "lectura") return "lectura";
  if (token === "dictado") return "dictado";
  if (token === "practica") return "practica";
  return undefined;
}

function normalizeWeekNumber(value: string | null): number | undefined {
  if (!value) return undefined;
  const token = String(value).trim();
  const direct = Number.parseInt(token, 10);
  if (Number.isInteger(direct) && direct >= 1 && direct <= 40) return direct;
  const extracted = token.match(/\d{1,2}/)?.[0];
  if (!extracted) return undefined;
  const weekNumber = Number.parseInt(extracted, 10);
  if (!Number.isInteger(weekNumber) || weekNumber < 1 || weekNumber > 40) return undefined;
  return weekNumber;
}

export async function GET(req: Request) {
  try {
    const authClient = createRouteHandlerClient({ cookies });
    const {
      data: { user },
      error: authError
    } = await authClient.auth.getUser();
    if (authError || !user) {
      console.error("[library/list] auth_error", { error: authError?.message ?? "user_null" });
      return NextResponse.json({ error: "unauthorized", message: "Sesión inválida o vencida." }, { status: 401 });
    }

    const supabase = getSupabaseServerClient();
    const auth = await resolveLibraryIdentityByUserId(user.id);
    if (!auth.ok) {
      console.error("[library/list] auth_error", { error: auth.error, message: auth.message });
      return NextResponse.json({ error: auth.error, message: auth.message }, { status: auth.status });
    }

    const { role, parentId, userId } = auth.data;
    const { searchParams } = new URL(req.url);
    const rawSubject = searchParams.get("subject");
    const rawWeekNumber = searchParams.get("week_number");
    const rawType = searchParams.get("type");
    const subject = normalizeSubject(rawSubject);
    const weekNumber = normalizeWeekNumber(rawWeekNumber);
    const type = normalizeType(rawType);

    console.info("[library/list] query_params", {
      raw: { subject: rawSubject, week_number: rawWeekNumber, type: rawType },
      normalized: { subject, week_number: weekNumber, type },
      role,
      user_id: userId,
      parent_id: parentId
    });

    let query = supabase
      .from("library_items")
      .select("id, title, subject, week_number, type, file_type, ingestion_status, created_at")
      .order("created_at", { ascending: false });

    if (role === "parent") {
      query = query.eq("parent_id", parentId);
    } else {
      query = query.eq("parent_id", parentId).eq("child_id", userId);
    }

    if (subject) query = query.eq("subject", subject);
    if (weekNumber) query = query.eq("week_number", weekNumber);
    if (type) query = query.eq("type", type);

    const { data, error } = await query;
    if (error) {
      const detail = `${error.message}${error.details ? ` | ${error.details}` : ""}`;
      console.error("[library/list] query_error", { error: detail, stack: (error as { stack?: string }).stack });
      return NextResponse.json({ error: "query_failed", detail }, { status: 500 });
    }

    return NextResponse.json({ items: data ?? [] }, { status: 200 });
  } catch (error) {
    const detail = error instanceof Error ? `${error.message}\n${error.stack ?? ""}` : String(error);
    console.error("[library/list] unhandled_error", { error: detail });
    return NextResponse.json({ error: "query_failed", detail: String(error) }, { status: 500 });
  }
}
