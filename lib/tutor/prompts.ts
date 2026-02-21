import { promises as fs } from "node:fs";
import path from "node:path";

export async function loadPrompt(name: string): Promise<string> {
  const filePath = path.join(process.cwd(), "prompts", name);
  return fs.readFile(filePath, "utf8");
}
