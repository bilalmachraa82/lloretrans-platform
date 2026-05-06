import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

const files = [
  "app/proposta/page.tsx",
  "app/apresentacao/page.tsx",
  "app/page.tsx",
  "app/(auth)/login/page.tsx",
  "app/(platform)/layout.tsx",
  "app/(platform)/dashboard/page.tsx",
  "app/(platform)/bolsa/commissions/page.tsx",
  "app/(platform)/ocr/page.tsx",
  "app/(platform)/ocr/upload/page.tsx",
  "app/(platform)/ocr/upload/actions.ts",
  "app/(platform)/docs/upload/page.tsx",
  "README.md",
  "docs/superpowers/specs/2026-04-19-mvp-b-ocr-invoices.md",
  "docs/superpowers/specs/2026-04-19-mvp-a-km-validation.md",
  "docs/superpowers/specs/2026-04-19-mvp-e-bolsa.md",
  "docs/superpowers/specs/2026-04-19-mvp-f-oficina.md",
  "docs/superpowers/specs/2026-04-19-platform-architecture.md",
  "docs/demo/lloretrans-commercial-demo-script.md",
  "app/(platform)/bolsa/new/page.tsx",
  "app/(platform)/admin/page.tsx",
  "app/(platform)/admin/users/page.tsx",
];

const customerFacingFiles = [
  "app/proposta/page.tsx",
  "app/apresentacao/page.tsx",
  "app/page.tsx",
  "app/(auth)/login/page.tsx",
  "app/(platform)/layout.tsx",
  "app/(platform)/dashboard/page.tsx",
  "app/(platform)/bolsa/commissions/page.tsx",
  "app/(platform)/ocr/page.tsx",
  "app/(platform)/ocr/upload/page.tsx",
  "app/(platform)/ocr/[id]/page.tsx",
  "app/(platform)/docs/[id]/page.tsx",
  "app/(platform)/oficina/[id]/page.tsx",
  "app/(platform)/admin/users/page.tsx",
  "README.md",
  "docs/demo/lloretrans-commercial-demo-script.md",
  "docs/demo/2026-05-07-clarice-eder-demo-success-guide.md",
  "docs/demo/2026-05-07-clarice-eder-demo-success-guide-premium.html",
];

describe("static copy guard", () => {
  it("does not contain old commission or km assumptions", () => {
    const text = files.map((file) => fs.readFileSync(path.join(process.cwd(), file), "utf-8")).join("\n");
    const stalePhrases = [
      ["Éder", "18%"].join(" "),
      ["default", "15%"].join(" "),
      ["15%", "da margem"].join(" "),
      ["default", "10 km"].join(" "),
      ["S", "17"].join(""),
    ];
    for (const phrase of stalePhrases) {
      expect(text.toLowerCase()).not.toContain(phrase.toLowerCase());
    }
  });

  it("does not expose stale demo copy in customer-facing pages", () => {
    const text = customerFacingFiles.map((file) => fs.readFileSync(path.join(process.cwd(), file), "utf-8")).join("\n");
    const stalePhrases = [
      ["240", "cargas"].join(" "),
      ["9 reais", "+ 180 sintéticas"].join(" "),
      ["CANBUS", "× cartões"].join(" "),
      ["Azure", "DI"].join(" "),
      ["State", "machine"].join(" "),
      ["Zero", "dependências US"].join(" "),
      ["sub-processadores", "nos EUA"].join(" "),
    ];
    for (const phrase of stalePhrases) {
      expect(text.toLowerCase()).not.toContain(phrase.toLowerCase());
    }
  });

  it("does not expose prototype or developer jargon in customer-facing pages", () => {
    const text = customerFacingFiles.map((file) => fs.readFileSync(path.join(process.cwd(), file), "utf-8")).join("\n");
    const weakPhrases = [
      "MVP ·",
      "neste MVP",
      "estado de MVP",
      "protótipo",
      "prototipo",
      "Folha de Obra Oficina (PWA)",
      "PWA mobile",
      "quick win",
      "quick wins",
      "stakeholder",
      "pre-seeded",
      "feature flags",
      "audit log append-only",
      "deploy Vercel fra1",
      "fixtures reais",
      "carriers do MVP",
      "template actual",
      "business-hours",
      "Workshop com expert",
      "Demo primeiro",
      "Dashboard diário",
      "Bulk-approve",
      "Upload →",
      "export PHC",
      "mobile-first",
      "work order",
      "5+1",
      "Versão 1.4",
      "pacote 5+1",
    ];

    for (const phrase of weakPhrases) {
      expect(text.toLowerCase()).not.toContain(phrase.toLowerCase());
    }
  });

  it("qualifies PHC references in customer-facing pages", () => {
    const text = customerFacingFiles.map((file) => fs.readFileSync(path.join(process.cwd(), file), "utf-8")).join("\n");
    expect(text).not.toMatch(/\bPHC\b(?! (Advanced|CS|GO))/);
  });

  it("uses confirmed Eder assumptions", () => {
    const proposal = fs.readFileSync(
      path.join(process.cwd(), "audit/pricing/proposta-clarice-fernando.html"),
      "utf-8",
    );
    expect(proposal).toMatch(/3 km/);
    expect(proposal).toMatch(/20%/);
    expect(proposal).toMatch(/2,50|€2\.50|€2,50/);
    expect(proposal).toMatch(/5/);
  });
});
