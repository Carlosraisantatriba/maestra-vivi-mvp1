import { describe, expect, it, vi } from "vitest";

vi.mock("@/lib/api/context", () => ({
  getRoleFromRequest: () => "parent",
  getProfileIdFromRequest: () => "demo-parent"
}));

function buildSupabaseMock() {
  const rows = [
    {
      id: "item-1",
      title: "Guía de fracciones",
      subject: "math",
      week_number: 3,
      type: "tarea",
      file_type: "application/pdf",
      ingestion_status: "ready",
      created_at: new Date().toISOString()
    }
  ];

  const queryResult = Promise.resolve({ data: rows, error: null });

  const queryBuilder = {
    select: vi.fn(() => queryBuilder),
    order: vi.fn(() => queryBuilder),
    eq: vi.fn(() => queryBuilder),
    then: queryResult.then.bind(queryResult)
  };

  return {
    from: vi.fn(() => queryBuilder)
  };
}

vi.mock("@/lib/supabase/server", () => ({
  getSupabaseServerClient: () => buildSupabaseMock()
}));

describe("GET /api/library/list", () => {
  it("responde 200 con estructura esperada", async () => {
    const { GET } = await import("@/app/api/library/list/route");

    const response = await GET(new Request("http://localhost/api/library/list?subject=math&week_number=3&type=tarea"));
    const json = await response.json();

    expect(response.status).toBe(200);
    expect(Array.isArray(json.items)).toBe(true);
    expect(json.items[0]).toMatchObject({
      id: expect.any(String),
      title: expect.any(String),
      subject: "math",
      week_number: 3,
      type: "tarea"
    });
  });
});
