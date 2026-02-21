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

export async function runIngestForItem(libraryItemId: string): Promise<number> {
  const supabase = getSupabaseServerClient();

  const { data: item, error: itemErr } = await supabase
    .from("library_items")
    .select("id, file_path, subject, week_label")
    .eq("id", libraryItemId)
    .single();

  if (itemErr || !item) {
    throw itemErr ?? new Error("item_not_found");
  }

  await supabase.from("library_items").update({ ingestion_status: "processing" }).eq("id", libraryItemId);

  const { data: file } = await supabase.storage.from("library").download(item.file_path);
  const rawText = file ? await file.text() : "";
  const chunks = chunkText(rawText || "Documento escaneado sin extracción disponible en MVP.");

  await supabase.from("library_chunks").delete().eq("library_item_id", libraryItemId);

  for (let index = 0; index < chunks.length; index += 1) {
    const chunk = chunks[index];
    const embedding = await openai.embeddings.create({
      model: env.embeddingModel,
      input: chunk
    });

    const vector = embedding.data[0]?.embedding ?? [];
    await supabase.from("library_chunks").insert({
      library_item_id: libraryItemId,
      page_num: index + 1,
      chunk_text: chunk,
      embedding: `[${vector.join(",")}]`,
      subject: item.subject,
      week_label: item.week_label
    });
  }

  const { data: skills } = await supabase.from("skills").select("id").eq("subject", item.subject).limit(3);
  if (skills?.length) {
    await supabase.from("library_item_skills").delete().eq("library_item_id", libraryItemId);
    await supabase.from("library_item_skills").insert(
      skills.map((s, i) => ({
        library_item_id: libraryItemId,
        skill_id: s.id,
        confidence: Math.max(0.5, 0.9 - i * 0.15),
        source: "auto"
      }))
    );
  }

  await supabase.from("library_items").update({ ingestion_status: "done" }).eq("id", libraryItemId);
  return chunks.length;
}
