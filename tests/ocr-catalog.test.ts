import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

describe("OCR catalog", () => {
  it("does not expose obsolete demo supplier names", () => {
    const files = [
      "app/(platform)/ocr/upload/page.tsx",
      "README.md",
      "docs/superpowers/specs/2026-04-19-mvp-b-ocr-invoices.md",
    ];
    const staleSuppliers = [
      ["Moe", "ve"].join(""),
      ["Diesel", "place"].join(""),
      ["Euro", "camiones"].join(""),
      ["Tecn", "icauto"].join(""),
      ["Lubri", "gaz"].join(""),
    ];
    const joined = files.map((file) => fs.readFileSync(path.join(process.cwd(), file), "utf-8")).join("\n");
    for (const supplier of staleSuppliers) {
      expect(joined.toLowerCase()).not.toContain(supplier.toLowerCase());
    }
  });

  it("catalog entries point to existing fixture PDFs", () => {
    const catalog = JSON.parse(fs.readFileSync(path.join(process.cwd(), "fixtures", "extracted", "_catalog.json"), "utf-8")) as {
      entries: Array<{ fixtureFilename: string; supplier: { name: string } }>;
    };
    for (const entry of catalog.entries) {
      expect(fs.existsSync(path.join(process.cwd(), "fixtures", "real-invoices", entry.fixtureFilename))).toBe(true);
      expect(entry.supplier.name.length).toBeGreaterThan(3);
    }
  });
});
