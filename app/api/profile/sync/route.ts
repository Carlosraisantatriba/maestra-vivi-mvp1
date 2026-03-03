import { NextResponse } from "next/server";
import { z } from "zod";
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import { upsertProfileForUser } from "@/lib/profile/upsert";

const schema = z.object({
  role: z.enum(["parent", "child"])
});

export async function POST(req: Request) {
  try {
    const authClient = createRouteHandlerClient({ cookies });
    const {
      data: { user },
      error
    } = await authClient.auth.getUser();

    if (error || !user) {
      return NextResponse.json({ error: "unauthorized", message: "Sesión inválida o vencida." }, { status: 401 });
    }

    const body = schema.parse(await req.json());
    await upsertProfileForUser(user.id, user.email ?? null, body.role);

    return NextResponse.json({ ok: true, role: body.role });
  } catch (error) {
    const detail = error instanceof Error ? `${error.message}\n${error.stack ?? ""}` : String(error);
    console.error("[profile/sync] error", { error: detail });
    return NextResponse.json({ error: "profile_sync_failed", detail: String(error) }, { status: 500 });
  }
}
