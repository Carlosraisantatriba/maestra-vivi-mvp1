import { getSupabaseServerClient } from "@/lib/supabase/server";

export type ProfileRole = "parent" | "child";

type ExistingProfile = {
  parent_id: string | null;
  display_name: string;
  grade: string;
};

function inferDisplayName(email: string | null): string {
  if (!email) return "Usuario";
  const prefix = email.split("@")[0] ?? "Usuario";
  const cleaned = prefix.replace(/[._-]+/g, " ").trim();
  return cleaned ? cleaned.slice(0, 60) : "Usuario";
}

export async function upsertProfileForUser(userId: string, email: string | null, role: ProfileRole) {
  const supabase = getSupabaseServerClient();

  const { data: existing, error: existingError } = await supabase
    .from("profiles")
    .select("parent_id, display_name, grade")
    .eq("id", userId)
    .maybeSingle();

  if (existingError) throw new Error(`profile_lookup_failed: ${existingError.message}`);
  const current = existing as ExistingProfile | null;

  const payload = {
    id: userId,
    role,
    parent_id: role === "parent" ? null : (current?.parent_id ?? null),
    display_name: current?.display_name || inferDisplayName(email),
    grade: current?.grade || "3ro"
  };

  const { error } = await supabase.from("profiles").upsert(payload, { onConflict: "id" });
  if (error) throw new Error(`profile_upsert_failed: ${error.message}`);
}
