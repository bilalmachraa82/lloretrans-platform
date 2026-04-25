import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

const files = [
  "app/proposta/page.tsx",
  "app/page.tsx",
  "README.md",
  "docs/superpowers/specs/2026-04-19-mvp-a-km-validation.md",
  "docs/superpowers/specs/2026-04-19-mvp-e-bolsa.md",
  "docs/superpowers/specs/2026-04-19-platform-architecture.md",
  "app/(platform)/bolsa/new/page.tsx",
  "app/(platform)/admin/page.tsx",
];

describe("static copy guard", () => {
  it("does not contain old commission or km assumptions", () => {
    const text = files.map((file) => fs.readFileSync(path.join(process.cwd(), file), "utf-8")).join("\n");
    expect(text).not.toMatch(/Éder 18%|default 15%|15% da margem|default 10 km|S17/i);
  });

  it("uses confirmed Eder assumptions", () => {
    const proposal = fs.readFileSync(path.join(process.cwd(), "app/proposta/page.tsx"), "utf-8");
    expect(proposal).toMatch(/3 km/);
    expect(proposal).toMatch(/20%/);
    expect(proposal).toMatch(/2,50|€2\.50|€2,50/);
    expect(proposal).toMatch(/5/);
  });
});
