import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

const docPagePath = path.join(process.cwd(), "app/(platform)/docs/[id]/page.tsx");
const sourceRoutePath = path.join(process.cwd(), "app/(platform)/docs/[id]/source/route.ts");

describe("central documents preview", () => {
  it("renders a PDF preview route like supplier invoices", () => {
    expect(fs.existsSync(sourceRoutePath)).toBe(true);

    const page = fs.readFileSync(docPagePath, "utf-8");
    const route = fs.readFileSync(sourceRoutePath, "utf-8");

    expect(page).toContain("documentPreviewUrl");
    expect(page).toContain("/docs/${doc.id}/source#toolbar=0&navpanes=0&view=FitH");
    expect(page).toContain("<iframe");
    expect(page).toContain("Abrir PDF");
    expect(page).not.toContain("Pré-visualização completa indisponível neste piloto");

    expect(route).toContain('Content-Type": "application/pdf"');
    expect(route).toContain("createDemoDocumentPdf");
    expect(route).toContain("X-Lloretrans-Preview");
    expect(route).toContain("generated-from-document");
  });
});
