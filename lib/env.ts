export const env = {
  supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL ?? "",
  supabaseAnonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "",
  supabaseServiceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY ?? "",
  openAiApiKey: process.env.OPENAI_API_KEY ?? "",
  tutorModel: process.env.TUTOR_MODEL ?? "gpt-5-mini",
  tutorModelHard: process.env.TUTOR_MODEL_HARD ?? "gpt-5.2",
  embeddingModel: process.env.EMBEDDING_MODEL ?? "text-embedding-3-small",
  moderationModel: process.env.MODERATION_MODEL ?? "omni-moderation-latest",
  appLocale: process.env.APP_LOCALE ?? "es-AR"
};

export function hasServerEnv(): boolean {
  return Boolean(env.supabaseUrl && env.supabaseServiceRoleKey && env.openAiApiKey);
}
