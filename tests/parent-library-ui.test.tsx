import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";

vi.mock("@/components/top-nav", () => ({
  TopNav: () => null
}));

describe("/parent/library UI", () => {
  it("renderiza estado vacío sin romper", async () => {
    const { default: ParentLibraryPage } = await import("@/app/parent/library/page");

    const html = renderToStaticMarkup(<ParentLibraryPage />);
    expect(html).toContain("Biblioteca del colegio");
  });
});
