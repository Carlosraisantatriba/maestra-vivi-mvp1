import { openai } from "@/lib/openai";
import { env } from "@/lib/env";

export async function moderateText(input: string): Promise<{ flagged: boolean; reason: string }> {
  if (!input.trim()) {
    return { flagged: false, reason: "" };
  }

  const result = await openai.moderations.create({
    model: env.moderationModel,
    input
  });

  const first = result.results[0];
  return {
    flagged: first?.flagged ?? false,
    reason: first?.categories
      ? Object.entries(first.categories)
          .filter(([, flagged]) => flagged)
          .map(([label]) => label)
          .join(", ")
      : ""
  };
}
