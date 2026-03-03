import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import { getSupabaseServerClient } from "@/lib/supabase/server";
import { getRoleFromRequest, type AppRole } from "@/lib/api/context";

export type LibraryAuthContext = {
  role: AppRole;
  userId: string;
  parentId: string;
};

export type LibraryAuthResult =
  | { ok: true; data: LibraryAuthContext }
  | { ok: false; status: number; error: string; message: string };

export async function resolveLibraryAuthContext(): Promise<LibraryAuthResult> {
  const authClient = createRouteHandlerClient({ cookies });
  const { data, error } = await authClient.auth.getUser();
  const user = data.user;

  if (error || !user) {
    return {
      ok: false,
      status: 401,
      error: "unauthorized",
      message: "Sesión inválida o vencida."
    };
  }

  const role = getRoleFromRequest();
  if (role === "parent") {
    return {
      ok: true,
      data: { role, userId: user.id, parentId: user.id }
    };
  }

  const supabase = getSupabaseServerClient();
  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("parent_id")
    .eq("id", user.id)
    .maybeSingle();

  if (profileError) {
    return {
      ok: false,
      status: 500,
      error: "profile_lookup_failed",
      message: profileError.message
    };
  }

  if (!profile?.parent_id) {
    return {
      ok: false,
      status: 403,
      error: "child_without_parent",
      message: "El perfil niño no tiene parent_id asociado."
    };
  }

  return {
    ok: true,
    data: { role, userId: user.id, parentId: profile.parent_id }
  };
}
