import { NextResponse } from "next/server";
import { z } from "zod";
import { runIngestForItem } from "@/lib/library/ingest";

const schema = z.object({ library_item_id: z.string().uuid() });

export async function POST(req: Request) {
  try {
    const body = schema.parse(await req.json());
    const chunks = await runIngestForItem(body.library_item_id);
    return NextResponse.json({ ok: true, chunks });
  } catch (error) {
    return NextResponse.json({ error: "ingest_failed", detail: String(error) }, { status: 500 });
  }
}
