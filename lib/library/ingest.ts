import { openai } from "@/lib/openai";
import { env } from "@/lib/env";
import { getSupabaseServerClient } from "@/lib/supabase/server";

function chunkText(text: string, chunkSize = 900): string[] {
  const normalized = text.replace(/\s+/g, " ").trim();
  if (!normalized) return [];
  const chunks: string[] = [];
  let i = 0;
  while (i < normalized.length) {
    chunks.push(normalized.slice(i, i + chunkSize));
    i += chunkSize;
  }
  return chunks;
}

async function safeExtractText(file: Blob): Promise<string> {
  try {
    return (await file.text()).trim();
  } catch {
    return "";
  }
}

export async function runIngestForItem(libraryItemId: string): Promise<number> {
  const supabase = getSupabaseServerClient();

  const { data: item, error: itemErr } = await supabase
    .from("library_items")
    .select("id, file_path, subject, week_number")
    .eq("id", libraryItemId)
    .single();

  if (itemErr || !item) throw itemErr ?? new Error("item_not_found");

  await supabase.from("library_items").update({ ingestion_status: "processing" }).eq("id", libraryItemId);

  const { data: file } = await supabase.storage.from("library").download(item.file_path);
  const rawText = file ? await safeExtractText(file) : "";
  const chunks = chunkText(rawText);

  await supabase.from("library_chunks").delete().eq("library_item_id", libraryItemId);

  if (chunks.length > 0) {
    for (let index = 0; index < chunks.length; index += 1) {
      const chunk = chunks[index];
      const embedding = await openai.embeddings.create({ model: env.embeddingModel, input: chunk });
      const vector = embedding.data[0]?.embedding ?? [];

      await supabase.from("library_chunks").insert({
        library_item_id: libraryItemId,
        page_num: index + 1,
        chunk_text: chunk,
        embedding: `[${vector.join(",")}]`,
        subject: item.subject,
        week_label: `Semana ${item.week_number}`
      });
    }
  }

  const { data: skills } = await supabase.from("skills").select("id").eq("subject", item.subject).limit(3);
  if (skills?.length) {
    await supabase.from("library_item_skills").delete().eq("library_item_id", libraryItemId);
    await supabase.from("library_item_skills").insert(
      skills.map((skill, index) => ({
        library_item_id: libraryItemId,
        skill_id: skill.id,
        confidence: Math.max(0.5, 0.9 - index * 0.15),
        source: "auto"
      }))
    );
  }

  await supabase.from("library_items").update({ ingestion_status: "ready" }).eq("id", libraryItemId);
  return chunks.length;
}
