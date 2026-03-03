import { getSupabaseServerClient } from "@/lib/supabase/server";
import type { AppRole } from "@/lib/api/context";

export type LibraryIdentity = {
  role: AppRole;
  userId: string;
  parentId: string;
};

export type LibraryIdentityResult =
  | { ok: true; data: LibraryIdentity }
  | { ok: false; status: number; error: string; message: string };

export async function resolveLibraryIdentityByUserId(userId: string): Promise<LibraryIdentityResult> {
  const supabase = getSupabaseServerClient();
  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("role, parent_id")
    .eq("id", userId)
    .maybeSingle();

  if (profileError) {
    return {
      ok: false,
      status: 500,
      error: "profile_lookup_failed",
      message: profileError.message
    };
  }

  const role = profile?.role as AppRole | undefined;
  if (!role) {
    return {
      ok: false,
      status: 403,
      error: "profile_missing",
      message: "Perfil no encontrado. Volvé a ingresar y completá tu perfil."
    };
  }

  if (role === "parent") {
    return {
      ok: true,
      data: { role, userId, parentId: userId }
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
    data: { role, userId, parentId: profile.parent_id }
  };
}
