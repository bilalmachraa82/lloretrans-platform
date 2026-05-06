# Lloretrans Evidence Realignment Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Realign `lloretrans-platform` with the real Éder/AITIPRO evidence pack so the commercial demo shows Lloretrans' actual workflow, data shapes, rules, and open dependencies.

**Architecture:** Treat `/Users/bilal/Downloads/AITIPRO` as the evidence source and convert it into typed, versioned demo fixtures under `fixtures/aitipro/`. Seed the DB from those fixtures, then adapt MVP B/D/E/F UI and proposal copy to consume the same source of truth instead of stale hard-coded text or synthetic-only data.

**Tech Stack:** Next.js 15 App Router, TypeScript, Drizzle/Neon Postgres, Vitest, `tsx` scripts, `xlsx` for Excel ingestion, Poppler/PDF tooling for audit verification.

---

## Scope

This plan targets `lloretrans-platform`. `lloretrans-app` is left untouched unless a later task explicitly asks to realign the separate diagnostic portal.

The end state is a presentation-ready demo, not production live integration. Live APIs remain feature-flagged; real evidence is imported as demo fixtures and clearly labelled as such.

## Source Evidence

- `/Users/bilal/Downloads/AITIPRO/Cargas Aluguer.xlsx`
- `/Users/bilal/Downloads/AITIPRO/Viaturas Grupo.xlsx`
- `/Users/bilal/Downloads/AITIPRO/Relação de todos os carros Lloretrans.xlsx`
- `/Users/bilal/Downloads/AITIPRO/Combustível/**`
- `/Users/bilal/Downloads/AITIPRO/Fatura*.pdf`
- `/Users/bilal/Downloads/AITIPRO/Folha de Obra.pdf`
- `/Users/bilal/Downloads/AITIPRO/Tabela de códigos.pdf`
- `/Users/bilal/Downloads/AITIPRO/CMR.jpeg`
- `/Users/bilal/Downloads/AITIPRO/Guia Receção.jpeg`
- `/Users/bilal/Downloads/AITIPRO/Guia Transporte.jpeg`
- `/Users/bilal/Downloads/AITIPRO/Ticket Frio.jpeg`

Known audit baselines that must be preserved in tests:

- Freight Excel: 306 dated loads, 299 rows with buy/sell prices, 26 transporters, 41 clients, 86 routes, 135 `LLORETRANS` loads, sell sum `135222.72`, buy sum `137022.72`, margin sum `-1800.00`.
- Fuel evidence: Cepsa `1261` rows, Frotcom monthly service file `181` rows, Radius `96` transactions across two files, internal pump `629` rows, Repsol `175` rows.
- Fleet evidence: `Viaturas Grupo.xlsx` Lloretrans sheet `127` active source rows; `Relação de todos os carros Lloretrans.xlsx` has `68` drivers with contacts and `56` vehicle-list rows.

## File Structure

Create:

- `fixtures/aitipro/source-manifest.json` - file inventory, SHA-256 hashes, source kind, intended MVP usage, privacy class.
- `fixtures/aitipro/freight-loads.json` - normalized rows from `Cargas Aluguer.xlsx`.
- `fixtures/aitipro/freight-summary.json` - deterministic summary totals used by tests and UI evidence cards.
- `fixtures/aitipro/vehicles.json` - normalized tractors, trailers, light vehicles, group ownership, GPS status.
- `fixtures/aitipro/drivers.json` - driver names/contact metadata with an explicit redaction mode.
- `fixtures/aitipro/fuel-transactions.json` - normalized Cepsa/Repsol/Radius/internal-pump records.
- `fixtures/aitipro/fuel-summary.json` - deterministic provider totals and row counts.
- `fixtures/aitipro/document-samples.json` - CMR/guia/ticket sample metadata.
- `fixtures/aitipro/service-codes.json` - canonical S/L/I/C/T code list from `Tabela de códigos.pdf`.
- `fixtures/aitipro/workshop-checklist.json` - canonical 17-item checklist from `Folha de Obra.pdf`.
- `scripts/aitipro/hash-files.ts` - build manifest from raw evidence.
- `scripts/aitipro/extract-freight.ts` - parse freight Excel.
- `scripts/aitipro/extract-vehicles.ts` - parse fleet/driver Excel files.
- `scripts/aitipro/extract-fuel.ts` - parse fuel Excel files.
- `scripts/aitipro/build-service-fixtures.ts` - write manual PDF-derived service/checklist fixtures.
- `scripts/aitipro/validate-fixtures.ts` - enforce baseline counts and stale-copy guardrails.
- `lib/aitipro/normalizers.ts` - plate, date, money, and text normalization helpers.
- `lib/freight/excel-model.ts` - types and helpers for the real freight workflow.
- `lib/fuel/provider-model.ts` - provider names and source-specific display helpers.
- `tests/aitipro-fixtures.test.ts`
- `tests/freight-real-workflow.test.ts`
- `tests/fuel-real-import.test.ts`
- `tests/ocr-catalog.test.ts`
- `tests/workshop-real-codes.test.ts`
- `tests/static-copy-guard.test.ts`

Modify:

- `package.json` and `package-lock.json` - add `xlsx`; add fixture build scripts.
- `db/schema.ts` - add freight/fuel fields needed by real Excel rows.
- `drizzle/*.sql` - generated migration.
- `scripts/seed.ts` - seed from `fixtures/aitipro/*` instead of synthetic-only freight/fuel/fleet data.
- `fixtures/extracted/_catalog.json` - regenerate from the actual invoice set.
- `app/(platform)/ocr/upload/page.tsx` - render invoice fixture options from `_catalog.json`.
- `app/(platform)/bolsa/page.tsx`
- `app/(platform)/bolsa/new/page.tsx`
- `app/(platform)/bolsa/[id]/page.tsx`
- `app/(platform)/bolsa/commissions/page.tsx`
- `app/(platform)/bolsa/actions.ts`
- `app/(platform)/fuel/page.tsx`
- `app/(platform)/fuel/[plate]/page.tsx`
- `app/(platform)/oficina/new/wizard.tsx`
- `app/(platform)/admin/page.tsx`
- `app/(platform)/admin/service-codes/page.tsx`
- `app/page.tsx`
- `app/proposta/page.tsx`
- `README.md`
- `docs/superpowers/specs/*.md`
- `docs/superpowers/plans/2026-04-19-*.md`

---

### Task 1: Safety Branch And Evidence Freeze

**Files:**
- Create: `fixtures/aitipro/source-manifest.json`
- Create: `scripts/aitipro/hash-files.ts`
- Modify: `package.json`

- [ ] **Step 1: Create a working branch**

Run:

```bash
git checkout -b feat/aitipro-realignment
```

Expected: `git branch --show-current` prints `feat/aitipro-realignment`.

- [ ] **Step 2: Install Excel parser**

Run:

```bash
npm install xlsx
```

Expected: `package.json` and `package-lock.json` include `xlsx`.

- [ ] **Step 3: Add manifest script**

Create `scripts/aitipro/hash-files.ts`:

```ts
import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";

const SOURCE_ROOT = "/Users/bilal/Downloads/AITIPRO";
const OUT = path.join(process.cwd(), "fixtures", "aitipro", "source-manifest.json");

const usageByName = (name: string): string[] => {
  const lower = name.toLowerCase();
  if (lower.includes("cargas aluguer")) return ["MVP E"];
  if (lower.includes("combusti") || lower.includes("cepsa") || lower.includes("repsol") || lower.includes("radius") || lower.includes("transactions")) return ["MVP D"];
  if (lower.includes("viaturas") || lower.includes("carros")) return ["Admin", "MVP A", "MVP D", "MVP E", "MVP F"];
  if (lower.includes("fatura")) return ["MVP B"];
  if (lower.includes("folha de obra")) return ["MVP F"];
  if (lower.includes("tabela")) return ["MVP B", "MVP F"];
  if (lower.includes("cmr") || lower.includes("guia") || lower.includes("ticket")) return ["MVP C"];
  return ["audit"];
};

const privacyByName = (name: string): "commercial" | "pii" | "financial" | "operational" => {
  const lower = name.toLowerCase();
  if (lower.includes("motoristas") || lower.includes("carros") || lower.includes("viaturas")) return "pii";
  if (lower.includes("fatura") || lower.includes("combusti") || lower.includes("cargas")) return "financial";
  if (lower.includes("cmr") || lower.includes("guia") || lower.includes("ticket")) return "operational";
  return "commercial";
};

function walk(dir: string): string[] {
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    if (entry.name === ".DS_Store") return [];
    const full = path.join(dir, entry.name);
    return entry.isDirectory() ? walk(full) : [full];
  });
}

const files = walk(SOURCE_ROOT).sort().map((fullPath) => {
  const buffer = fs.readFileSync(fullPath);
  const relativePath = path.relative(SOURCE_ROOT, fullPath);
  return {
    relativePath,
    extension: path.extname(fullPath).toLowerCase(),
    bytes: buffer.byteLength,
    sha256: crypto.createHash("sha256").update(buffer).digest("hex"),
    usage: usageByName(relativePath),
    privacyClass: privacyByName(relativePath),
  };
});

fs.mkdirSync(path.dirname(OUT), { recursive: true });
fs.writeFileSync(OUT, `${JSON.stringify({ sourceRoot: SOURCE_ROOT, generatedAt: new Date().toISOString(), files }, null, 2)}\n`);
console.log(`Wrote ${files.length} evidence files to ${OUT}`);
```

- [ ] **Step 4: Add package scripts**

Modify `package.json` scripts:

```json
"aitipro:manifest": "tsx scripts/aitipro/hash-files.ts",
"aitipro:extract:freight": "tsx scripts/aitipro/extract-freight.ts",
"aitipro:extract:vehicles": "tsx scripts/aitipro/extract-vehicles.ts",
"aitipro:extract:fuel": "tsx scripts/aitipro/extract-fuel.ts",
"aitipro:extract:service": "tsx scripts/aitipro/build-service-fixtures.ts",
"aitipro:validate": "tsx scripts/aitipro/validate-fixtures.ts",
"aitipro:build-fixtures": "npm run aitipro:manifest && npm run aitipro:extract:freight && npm run aitipro:extract:vehicles && npm run aitipro:extract:fuel && npm run aitipro:extract:service && npm run aitipro:validate"
```

- [ ] **Step 5: Run manifest**

Run:

```bash
npm run aitipro:manifest
```

Expected: output says `Wrote 26 evidence files`.

- [ ] **Step 6: Commit evidence freeze**

Run:

```bash
git add package.json package-lock.json scripts/aitipro/hash-files.ts fixtures/aitipro/source-manifest.json
git commit -m "chore: freeze aitipro evidence manifest"
```

---

### Task 2: Shared Normalizers And Fixture Validation

**Files:**
- Create: `lib/aitipro/normalizers.ts`
- Create: `scripts/aitipro/validate-fixtures.ts`
- Create: `tests/aitipro-fixtures.test.ts`

- [ ] **Step 1: Add normalizers**

Create `lib/aitipro/normalizers.ts`:

```ts
export function normalizePlate(value: unknown): string | null {
  if (value == null) return null;
  const raw = String(value).trim().toUpperCase();
  if (!raw || raw === "-" || raw === "." || raw === "NAN") return null;
  const compact = raw.replace(/[^A-Z0-9]/g, "");
  if (compact.length < 5) return null;
  return compact;
}

export function displayPlate(value: unknown): string | null {
  const compact = normalizePlate(value);
  if (!compact) return null;
  if (compact.length === 6) return `${compact.slice(0, 2)}-${compact.slice(2, 4)}-${compact.slice(4)}`;
  return String(value).trim().toUpperCase().replace(/\s+/g, "-");
}

export function parseEuro(value: unknown): number | null {
  if (value == null || value === "") return null;
  if (typeof value === "number" && Number.isFinite(value)) return Math.round(value * 100) / 100;
  const normalized = String(value).replace(/\s/g, "").replace(/\./g, "").replace(",", ".");
  const parsed = Number(normalized);
  return Number.isFinite(parsed) ? Math.round(parsed * 100) / 100 : null;
}

export function normalizeText(value: unknown): string | null {
  if (value == null) return null;
  const text = String(value).trim().replace(/\s+/g, " ");
  return text.length > 0 ? text : null;
}

export function normalizeRegularization(value: unknown): "R" | "NR" | null {
  const text = normalizeText(value)?.toUpperCase() ?? "";
  if (text.startsWith("R -")) return "R";
  if (text.startsWith("NR -")) return "NR";
  return null;
}

export function parseExcelDate(value: unknown): string | null {
  if (value instanceof Date && value.getFullYear() >= 2020) return value.toISOString().slice(0, 10);
  const text = normalizeText(value);
  if (!text) return null;
  const date = new Date(text);
  return Number.isNaN(date.getTime()) || date.getFullYear() < 2020 ? null : date.toISOString().slice(0, 10);
}
```

- [ ] **Step 2: Add validation script**

Create `scripts/aitipro/validate-fixtures.ts`:

```ts
import fs from "node:fs";
import path from "node:path";

function readJson<T>(relativePath: string): T {
  return JSON.parse(fs.readFileSync(path.join(process.cwd(), relativePath), "utf-8")) as T;
}

function assertEqual(actual: unknown, expected: unknown, label: string): void {
  if (actual !== expected) throw new Error(`${label}: expected ${expected}, got ${actual}`);
}

const freightSummary = readJson<{
  loads: number;
  priceRows: number;
  uniqueTransporters: number;
  uniqueClients: number;
  uniqueRoutes: number;
  internalLloretransLoads: number;
  sellSum: number;
  buySum: number;
  marginSum: number;
}>("fixtures/aitipro/freight-summary.json");

assertEqual(freightSummary.loads, 306, "freight loads");
assertEqual(freightSummary.priceRows, 299, "freight price rows");
assertEqual(freightSummary.uniqueTransporters, 26, "freight unique transporters");
assertEqual(freightSummary.uniqueClients, 41, "freight unique clients");
assertEqual(freightSummary.uniqueRoutes, 86, "freight unique routes");
assertEqual(freightSummary.internalLloretransLoads, 135, "freight Lloretrans loads");
assertEqual(freightSummary.sellSum, 135222.72, "freight sell sum");
assertEqual(freightSummary.buySum, 137022.72, "freight buy sum");
assertEqual(freightSummary.marginSum, -1800, "freight margin sum");

const fuelSummary = readJson<{ providers: Record<string, { rows: number }> }>("fixtures/aitipro/fuel-summary.json");
assertEqual(fuelSummary.providers.cepsa.rows, 1261, "Cepsa rows");
assertEqual(fuelSummary.providers.frotcom_fee.rows, 181, "Frotcom fee rows");
assertEqual(fuelSummary.providers.radius_velocity.rows, 96, "Radius rows");
assertEqual(fuelSummary.providers.bomba_interna.rows, 629, "Internal pump rows");
assertEqual(fuelSummary.providers.repsol.rows, 175, "Repsol rows");

console.log("AITIPRO fixtures validated");
```

- [ ] **Step 3: Add failing test shell**

Create `tests/aitipro-fixtures.test.ts`:

```ts
import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

function readFixture<T>(name: string): T {
  return JSON.parse(fs.readFileSync(path.join(process.cwd(), "fixtures", "aitipro", name), "utf-8")) as T;
}

describe("AITIPRO evidence fixtures", () => {
  it("preserves audited freight baselines", () => {
    const summary = readFixture<Record<string, number>>("freight-summary.json");
    expect(summary.loads).toBe(306);
    expect(summary.priceRows).toBe(299);
    expect(summary.uniqueTransporters).toBe(26);
    expect(summary.uniqueClients).toBe(41);
    expect(summary.uniqueRoutes).toBe(86);
    expect(summary.internalLloretransLoads).toBe(135);
    expect(summary.sellSum).toBe(135222.72);
    expect(summary.buySum).toBe(137022.72);
    expect(summary.marginSum).toBe(-1800);
  });

  it("preserves audited fuel baselines", () => {
    const summary = readFixture<{ providers: Record<string, { rows: number }> }>("fuel-summary.json");
    expect(summary.providers.cepsa.rows).toBe(1261);
    expect(summary.providers.frotcom_fee.rows).toBe(181);
    expect(summary.providers.radius_velocity.rows).toBe(96);
    expect(summary.providers.bomba_interna.rows).toBe(629);
    expect(summary.providers.repsol.rows).toBe(175);
  });
});
```

- [ ] **Step 4: Run test and validate expected failure**

Run:

```bash
npm test -- tests/aitipro-fixtures.test.ts
```

Expected: FAIL because the fixture JSON files do not exist yet.

- [ ] **Step 5: Commit**

Run:

```bash
git add lib/aitipro/normalizers.ts scripts/aitipro/validate-fixtures.ts tests/aitipro-fixtures.test.ts
git commit -m "test: define aitipro fixture baselines"
```

---

### Task 3: Extract Freight Excel Into Real Fixtures

**Files:**
- Create: `scripts/aitipro/extract-freight.ts`
- Create: `fixtures/aitipro/freight-loads.json`
- Create: `fixtures/aitipro/freight-summary.json`
- Create: `lib/freight/excel-model.ts`
- Test: `tests/freight-real-workflow.test.ts`

- [ ] **Step 1: Add real freight model**

Create `lib/freight/excel-model.ts`:

```ts
export type FreightPaymentRegularization = "R" | "NR" | null;

export interface AitiproFreightLoad {
  sourceRow: number;
  tractorPlate: string | null;
  trailerPlate: string | null;
  transporter: string;
  carrierKind: "internal_lloretrans" | "external_transporter";
  date: string | null;
  client: string;
  origin: string;
  destination: string;
  priceClientEur: number | null;
  paidTransporterEur: number | null;
  marginEur: number | null;
  customerInvoiceNumber: string | null;
  observations: string | null;
  cmrNumber: string | null;
  supplierInvoiceNumber: string | null;
  responsible: string | null;
  serviceValueEur: number | null;
  paymentRegularization: FreightPaymentRegularization;
  paymentMonth: string | null;
  rawInvoiceNumber2: string | null;
}

export function isInternalLloretrans(transporter: string): boolean {
  return transporter.trim().toUpperCase() === "LLORETRANS";
}
```

- [ ] **Step 2: Add extractor**

Create `scripts/aitipro/extract-freight.ts`:

```ts
import fs from "node:fs";
import path from "node:path";
import * as XLSX from "xlsx";
import { displayPlate, normalizeRegularization, normalizeText, parseEuro, parseExcelDate } from "@/lib/aitipro/normalizers";
import { type AitiproFreightLoad, isInternalLloretrans } from "@/lib/freight/excel-model";

const SOURCE = "/Users/bilal/Downloads/AITIPRO/Cargas Aluguer.xlsx";
const OUT_DIR = path.join(process.cwd(), "fixtures", "aitipro");

const workbook = XLSX.readFile(SOURCE, { cellDates: true });
const sheet = workbook.Sheets.Folha1;
const rows = XLSX.utils.sheet_to_json<Record<string, unknown>>(sheet, {
  range: 3,
  defval: null,
  raw: false,
});

const loads: AitiproFreightLoad[] = rows.flatMap((row, index) => {
  const transporter = normalizeText(row.TRANSPORTADOR);
  const client = normalizeText(row.CLIENTE);
  const origin = normalizeText(row.CARGA);
  const destination = normalizeText(row.DESCARGA);
  const date = parseExcelDate(row.DATA);
  if (!transporter || !client || !origin || !destination) return [];

  const priceClientEur = parseEuro(row["PREÇO CLIENTE"]);
  const paidTransporterEur = parseEuro(row["PAGO TRANSPORTADOR"]);
  const marginEur =
    priceClientEur == null || paidTransporterEur == null
      ? null
      : Math.round((priceClientEur - paidTransporterEur) * 100) / 100;

  return [{
    sourceRow: index + 5,
    tractorPlate: displayPlate(row.VIATURA),
    trailerPlate: displayPlate(row.REBOQUE),
    transporter,
    carrierKind: isInternalLloretrans(transporter) ? "internal_lloretrans" : "external_transporter",
    date,
    client,
    origin,
    destination,
    priceClientEur,
    paidTransporterEur,
    marginEur,
    customerInvoiceNumber: normalizeText(row["Nº FATURA"]),
    observations: normalizeText(row.OBS),
    cmrNumber: normalizeText(row["Nº CMR"]),
    supplierInvoiceNumber: normalizeText(row["Nº FATURA FORNECEDOR"]),
    responsible: normalizeText(row.RESPONSÁVEL),
    serviceValueEur: parseEuro(row["VALOR SERVIÇO"]),
    paymentRegularization: normalizeRegularization(row["Regularização de pagamentos"]),
    paymentMonth: normalizeText(row["MÊS DE PAGAMENTO"]),
    rawInvoiceNumber2: normalizeText(row["Nº FATURA_1"] ?? row["Nº FATURA.1"]),
  }];
});

const priced = loads.filter((load) => load.priceClientEur != null && load.paidTransporterEur != null);
const routes = new Set(loads.map((load) => `${load.origin} -> ${load.destination}`));
const summary = {
  loads: loads.length,
  priceRows: priced.length,
  uniqueTransporters: new Set(loads.map((load) => load.transporter.trim())).size,
  uniqueClients: new Set(loads.map((load) => load.client.trim())).size,
  uniqueRoutes: routes.size,
  internalLloretransLoads: loads.filter((load) => load.carrierKind === "internal_lloretrans").length,
  sellSum: Math.round(priced.reduce((sum, load) => sum + (load.priceClientEur ?? 0), 0) * 100) / 100,
  buySum: Math.round(priced.reduce((sum, load) => sum + (load.paidTransporterEur ?? 0), 0) * 100) / 100,
  marginSum: Math.round(priced.reduce((sum, load) => sum + (load.marginEur ?? 0), 0) * 100) / 100,
};

fs.mkdirSync(OUT_DIR, { recursive: true });
fs.writeFileSync(path.join(OUT_DIR, "freight-loads.json"), `${JSON.stringify(loads, null, 2)}\n`);
fs.writeFileSync(path.join(OUT_DIR, "freight-summary.json"), `${JSON.stringify(summary, null, 2)}\n`);
console.log(`Extracted ${loads.length} freight rows`);
```

- [ ] **Step 3: Add workflow test**

Create `tests/freight-real-workflow.test.ts`:

```ts
import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import type { AitiproFreightLoad } from "@/lib/freight/excel-model";

const loads = JSON.parse(
  fs.readFileSync(path.join(process.cwd(), "fixtures", "aitipro", "freight-loads.json"), "utf-8"),
) as AitiproFreightLoad[];

describe("real freight workflow", () => {
  it("keeps Excel-specific operational fields", () => {
    const withCmr = loads.find((load) => load.cmrNumber);
    expect(withCmr).toMatchObject({
      transporter: expect.any(String),
      client: expect.any(String),
      origin: expect.any(String),
      destination: expect.any(String),
      cmrNumber: expect.any(String),
    });
  });

  it("models Lloretrans loads without requiring an external supplier", () => {
    const internal = loads.filter((load) => load.carrierKind === "internal_lloretrans");
    expect(internal).toHaveLength(135);
    expect(internal.some((load) => load.tractorPlate && load.trailerPlate)).toBe(true);
  });

  it("shows the audited margin reality instead of fabricated SaaS margin", () => {
    const priced = loads.filter((load) => load.marginEur != null);
    const margin = Math.round(priced.reduce((sum, load) => sum + (load.marginEur ?? 0), 0) * 100) / 100;
    expect(margin).toBe(-1800);
  });
});
```

- [ ] **Step 4: Run extractor**

Run:

```bash
npm run aitipro:extract:freight
```

Expected: `Extracted 306 freight rows`.

- [ ] **Step 5: Run tests**

Run:

```bash
npm test -- tests/freight-real-workflow.test.ts tests/aitipro-fixtures.test.ts
```

Expected: PASS for freight assertions; fuel assertions still fail until Task 5 creates fuel fixtures.

- [ ] **Step 6: Commit**

Run:

```bash
git add scripts/aitipro/extract-freight.ts lib/freight/excel-model.ts fixtures/aitipro/freight-loads.json fixtures/aitipro/freight-summary.json tests/freight-real-workflow.test.ts
git commit -m "feat: extract real freight workflow fixtures"
```

---

### Task 4: Extract Fleet And Driver Fixtures

**Files:**
- Create: `scripts/aitipro/extract-vehicles.ts`
- Create: `fixtures/aitipro/vehicles.json`
- Create: `fixtures/aitipro/drivers.json`

- [ ] **Step 1: Add vehicle extractor**

Create `scripts/aitipro/extract-vehicles.ts` with parsers for `Viaturas Grupo.xlsx` sheets `Lloretrans`, `GPP`, `Chaveiro`, and `Relação de todos os carros Lloretrans.xlsx` sheets `Motoristas`, `Viaturas-Motoristas`, `Viaturas`.

The output object shape must be:

```ts
interface VehicleFixture {
  plate: string;
  source: "viaturas_grupo_lloretrans" | "viaturas_grupo_gpp" | "chaveiro" | "relacao_lloretrans";
  companyRaw: string | null;
  driverRaw: string | null;
  trailerPlate: string | null;
  brand: string | null;
  model: string | null;
  category: string | null;
  gps: "SIM" | "NÃO" | null;
  active: boolean;
}

interface DriverFixture {
  name: string;
  contactRaw: string | null;
  source: "relacao_motoristas" | "relacao_viaturas_motoristas";
}
```

Implementation rules:

- Normalize plates with `displayPlate()`.
- Keep `driverRaw` names for local demo, but do not show contacts in UI by default.
- Preserve `gps` exactly as `SIM`/`NÃO` where present.
- Mark `VENDIDO` and `Inativo` rows as `active: false`.

- [ ] **Step 2: Run extractor**

Run:

```bash
npm run aitipro:extract:vehicles
```

Expected:

- `fixtures/aitipro/vehicles.json` includes at least `127` Lloretrans vehicle-source rows.
- `fixtures/aitipro/drivers.json` includes `68` relation-driver rows.

- [ ] **Step 3: Add tests**

Extend `tests/aitipro-fixtures.test.ts`:

```ts
it("preserves audited fleet baselines", () => {
  const vehicles = readFixture<Array<{ source: string; gps: string | null }>>("vehicles.json");
  const drivers = readFixture<Array<{ name: string; contactRaw: string | null }>>("drivers.json");
  expect(vehicles.filter((v) => v.source === "viaturas_grupo_lloretrans").length).toBeGreaterThanOrEqual(127);
  expect(drivers.length).toBeGreaterThanOrEqual(68);
  expect(vehicles.some((v) => v.gps === "SIM")).toBe(true);
  expect(vehicles.some((v) => v.gps === "NÃO")).toBe(true);
});
```

- [ ] **Step 4: Commit**

Run:

```bash
git add scripts/aitipro/extract-vehicles.ts fixtures/aitipro/vehicles.json fixtures/aitipro/drivers.json tests/aitipro-fixtures.test.ts
git commit -m "feat: extract real fleet fixtures"
```

---

### Task 5: Extract Fuel Fixtures And Correct Provider Model

**Files:**
- Create: `scripts/aitipro/extract-fuel.ts`
- Create: `fixtures/aitipro/fuel-transactions.json`
- Create: `fixtures/aitipro/fuel-summary.json`
- Create: `lib/fuel/provider-model.ts`
- Modify: `lib/integrations/fuel-cards/index.ts`
- Test: `tests/fuel-real-import.test.ts`

- [ ] **Step 1: Add provider model**

Create `lib/fuel/provider-model.ts`:

```ts
export const FUEL_PROVIDERS = ["cepsa", "repsol", "radius_velocity", "bomba_interna", "frotcom_fee"] as const;
export type FuelProvider = (typeof FUEL_PROVIDERS)[number];

export const FUEL_PROVIDER_LABELS: Record<FuelProvider, string> = {
  cepsa: "Cepsa",
  repsol: "Repsol",
  radius_velocity: "Radius Velocity",
  bomba_interna: "Bomba interna",
  frotcom_fee: "Frotcom mensalidades",
};

export function isConsumptionProvider(provider: FuelProvider): boolean {
  return provider !== "frotcom_fee";
}
```

- [ ] **Step 2: Add fuel extractor**

Create `scripts/aitipro/extract-fuel.ts`.

Output record shape:

```ts
interface FuelTransactionFixture {
  provider: "cepsa" | "repsol" | "radius_velocity" | "bomba_interna" | "frotcom_fee";
  sourceFile: string;
  sourceRow: number;
  plate: string | null;
  occurredAt: string | null;
  product: string | null;
  liters: number | null;
  totalEur: number | null;
  odometerKm: number | null;
  cardNumber: string | null;
  invoiceNumber: string | null;
  station: string | null;
  country: string | null;
  driverRaw: string | null;
}
```

Parser requirements:

- Cepsa: read `Matricula`, `Fecha y hora`, `Concepto`, `Litros / Unidades`, `Importe Operación`, `Factura`, `Lugar`, `Pais`, `Tarjeta`.
- Repsol: read `MATRICULA`, `FEC_OPERAC`, `HOR_OPERAC`, `DES_PRODU`, `NUM_LITROS`, `IMPORTE`, `NUM_FACTUR`, `NOM_ESTABL`, `POB_ESTABL`, `KILOMETROS`, `CONDUCTOR`.
- Radius: carry forward group header plate from rows like `BQ59GV - 195621 - ...`; transaction rows use `Data Hora`, `Produto`, `Quantidade`, `Líquido`, `Número da fatura`, `Nome do posto`, `País`, `Identificador do cartão`.
- Internal pump: read `LicensePlate`, `Date/time`, `Article`, `Quantity`, `Amount`, `Odometer`, `Driver`, `Card Nb.`, `Station`, `Customer`.
- Frotcom file: classify rows as `frotcom_fee`, set `liters: null`, and never treat it as CANBUS consumption.

- [ ] **Step 3: Add tests**

Create `tests/fuel-real-import.test.ts`:

```ts
import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { isConsumptionProvider } from "@/lib/fuel/provider-model";

const transactions = JSON.parse(
  fs.readFileSync(path.join(process.cwd(), "fixtures", "aitipro", "fuel-transactions.json"), "utf-8"),
) as Array<{ provider: string; liters: number | null; totalEur: number | null }>;

describe("real fuel import", () => {
  it("keeps real provider names", () => {
    expect(new Set(transactions.map((row) => row.provider))).toEqual(
      new Set(["cepsa", "repsol", "radius_velocity", "bomba_interna", "frotcom_fee"]),
    );
  });

  it("does not treat Frotcom billing rows as consumption", () => {
    const frotcomRows = transactions.filter((row) => row.provider === "frotcom_fee");
    expect(frotcomRows).toHaveLength(181);
    expect(frotcomRows.every((row) => row.liters == null)).toBe(true);
    expect(isConsumptionProvider("frotcom_fee")).toBe(false);
  });
});
```

- [ ] **Step 4: Run extractor and tests**

Run:

```bash
npm run aitipro:extract:fuel
npm test -- tests/fuel-real-import.test.ts tests/aitipro-fixtures.test.ts
```

Expected: PASS.

- [ ] **Step 5: Commit**

Run:

```bash
git add scripts/aitipro/extract-fuel.ts fixtures/aitipro/fuel-transactions.json fixtures/aitipro/fuel-summary.json lib/fuel/provider-model.ts lib/integrations/fuel-cards/index.ts tests/fuel-real-import.test.ts tests/aitipro-fixtures.test.ts
git commit -m "feat: extract real fuel provider fixtures"
```

---

### Task 6: Canonical Service Codes And Workshop Checklist Fixtures

**Files:**
- Create: `scripts/aitipro/build-service-fixtures.ts`
- Create: `fixtures/aitipro/service-codes.json`
- Create: `fixtures/aitipro/workshop-checklist.json`
- Modify: `lib/workshop-checklist.ts`
- Modify: `scripts/seed.ts`
- Test: `tests/workshop-real-codes.test.ts`

- [ ] **Step 1: Add service fixture builder**

Create `scripts/aitipro/build-service-fixtures.ts` that writes the exact S/L/I code table:

- `S1` through `S9`
- `L1` through `L8`
- `I0` through `I9`
- operational demo-only `C1` and `T1`, each marked `source: "derived_demo"`

Also write the 17 checklist items:

```json
[
  "Alinhar direção",
  "Embraiagem",
  "Equilibrar rodas",
  "Filtro de ar",
  "Filtro de gasóleo",
  "Filtro de óleo",
  "Inspeção",
  "Lavagem",
  "Luzes",
  "Mudar óleo",
  "Revisão",
  "Serviço Pintura",
  "Sub. Correia distribuição",
  "Substituir Correias",
  "Suspensão",
  "Travões",
  "Velas"
]
```

- [ ] **Step 2: Update workshop code usage**

Modify `app/(platform)/oficina/new/wizard.tsx`:

- Replace stale `S17` template.
- Use L-code templates for internal Lloretrans work orders.
- Keep S-code templates only for external customer vehicles.
- Change service-code filtering from exact `kind === "oficina"` to `kind === "oficina_interna" || kind === "oficina_externa"`.

- [ ] **Step 3: Add tests**

Create `tests/workshop-real-codes.test.ts`:

```ts
import { describe, expect, it } from "vitest";
import { WORKSHOP_CHECKLIST, filterChecklistForService } from "@/lib/workshop-checklist";

describe("workshop real codes", () => {
  it("keeps exactly the 17 paper checklist items", () => {
    expect(WORKSHOP_CHECKLIST).toHaveLength(17);
    expect(WORKSHOP_CHECKLIST.map((item) => item.label)).toContain("Travões");
    expect(WORKSHOP_CHECKLIST.map((item) => item.label)).toContain("Velas");
  });

  it("does not depend on obsolete S17", () => {
    const labels = filterChecklistForService("L7").map((item) => item.label);
    expect(labels).toContain("Travões");
    expect(labels).toContain("Suspensão");
  });
});
```

- [ ] **Step 4: Run**

Run:

```bash
npm run aitipro:extract:service
npm test -- tests/workshop-real-codes.test.ts
```

Expected: PASS.

- [ ] **Step 5: Commit**

Run:

```bash
git add scripts/aitipro/build-service-fixtures.ts fixtures/aitipro/service-codes.json fixtures/aitipro/workshop-checklist.json lib/workshop-checklist.ts app/(platform)/oficina/new/wizard.tsx scripts/seed.ts tests/workshop-real-codes.test.ts
git commit -m "fix: align workshop codes with Eder paper template"
```

---

### Task 7: Fix OCR Catalog And Remove Hard-Coded Old Invoice Labels

**Files:**
- Modify: `fixtures/extracted/_catalog.json`
- Modify: `fixtures/real-invoices/*`
- Modify: `app/(platform)/ocr/upload/page.tsx`
- Modify: `app/(platform)/ocr/upload/actions.ts`
- Create: `tests/ocr-catalog.test.ts`

- [ ] **Step 1: Rebuild invoice source mapping**

Use `fixtures/aitipro/source-manifest.json` to map every `Fatura*.pdf` SHA-256 to the raw filename. Update `fixtures/extracted/_catalog.json` so each entry has:

```json
{
  "sourceFilename": "Fatura 10.pdf",
  "fixtureFilename": "fatura-10-wurth.pdf",
  "supplier": { "name": "Würth Portugal - Técnica de Montagem, Lda.", "taxId": "500302030" },
  "invoice": { "number": "911960997", "totalGross": 542.95 },
  "classification": { "serviceCode": "I8", "workCode": "INT-OFI-LLT" }
}
```

No `_catalog.json` entry may claim a different source file than the hash map proves.

- [ ] **Step 2: Replace hard-coded upload options**

Modify `app/(platform)/ocr/upload/page.tsx` to read `fixtures/extracted/_catalog.json` and render options dynamically:

```tsx
const catalog = JSON.parse(
  await fs.promises.readFile(path.join(process.cwd(), "fixtures", "extracted", "_catalog.json"), "utf-8"),
) as { entries: Array<{ fixtureFilename: string; supplier: { name: string }; invoice: { totalGross: number } }> };
```

Render:

```tsx
{catalog.entries.map((entry) => (
  <option key={entry.fixtureFilename} value={entry.fixtureFilename}>
    {entry.supplier.name} · {formatEur(entry.invoice.totalGross)}
  </option>
))}
```

- [ ] **Step 3: Update upload action field names**

Modify `app/(platform)/ocr/upload/actions.ts` so it accepts `fixtureFilename` from the new catalog and no longer assumes old `doc147...` filenames only.

- [ ] **Step 4: Add stale label test**

Create `tests/ocr-catalog.test.ts`:

```ts
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
    const joined = files.map((file) => fs.readFileSync(path.join(process.cwd(), file), "utf-8")).join("\n");
    expect(joined).not.toMatch(/Moeve|Dieselplace|Eurocamiones|Tecnicauto|Lubrigaz/i);
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
```

- [ ] **Step 5: Run tests**

Run:

```bash
npm test -- tests/ocr-catalog.test.ts
```

Expected: PASS.

- [ ] **Step 6: Commit**

Run:

```bash
git add fixtures/extracted/_catalog.json fixtures/real-invoices app/(platform)/ocr/upload/page.tsx app/(platform)/ocr/upload/actions.ts tests/ocr-catalog.test.ts README.md docs/superpowers/specs/2026-04-19-mvp-b-ocr-invoices.md
git commit -m "fix: align OCR fixtures with real invoice catalog"
```

---

### Task 8: Schema Migration For Real Freight And Fuel Fields

**Files:**
- Modify: `db/schema.ts`
- Create: `drizzle/0002_aitipro_realignment.sql`

- [ ] **Step 1: Extend freight schema**

Modify `freightLoads` in `db/schema.ts`:

```ts
supplierId: text("supplier_id").references(() => suppliers.id),
carrierName: text("carrier_name"),
carrierKind: text("carrier_kind").default("external_transporter").notNull(),
trailerPlate: text("trailer_plate"),
sourceRow: integer("source_row"),
customerInvoiceNumber: text("customer_invoice_number"),
supplierInvoiceNumber: text("supplier_invoice_number"),
cmrNumber: text("cmr_number"),
paymentRegularization: text("payment_regularization"),
paymentMonth: text("payment_month"),
serviceValueEur: doublePrecision("service_value_eur"),
```

Keep existing fields for app compatibility:

- `priceBuy`
- `priceSell`
- `margin`
- `marginPct`
- `state`

- [ ] **Step 2: Extend fuel schema**

Modify `fuelFills`:

```ts
product: text("product"),
stationCountry: text("station_country"),
providerInvoiceNumber: text("provider_invoice_number"),
sourceFile: text("source_file"),
sourceRow: integer("source_row"),
driverNameRaw: text("driver_name_raw"),
```

- [ ] **Step 3: Generate migration**

Run:

```bash
npm run db:generate
```

Expected: new Drizzle migration with nullable columns and `supplier_id` no longer `NOT NULL`.

- [ ] **Step 4: Commit**

Run:

```bash
git add db/schema.ts drizzle
git commit -m "feat(db): support real aitipro freight and fuel fields"
```

---

### Task 9: Seed From Real Fixtures

**Files:**
- Modify: `scripts/seed.ts`
- Modify: `scripts/reset.ts`

- [ ] **Step 1: Seed service codes from fixture**

In `scripts/seed.ts`, replace hard-coded service code array with:

```ts
const serviceCodes = JSON.parse(
  fs.readFileSync(path.join(process.cwd(), "fixtures", "aitipro", "service-codes.json"), "utf-8"),
) as Array<{ code: string; label: string; description: string; kind: string }>;
await db.insert(schema.serviceCodes).values(serviceCodes);
```

- [ ] **Step 2: Seed vehicles and drivers from fixtures**

Use `fixtures/aitipro/vehicles.json` and `drivers.json`.

Rules:

- Insert real Lloretrans plates first.
- Use group/company mapping from raw company name.
- `isInternal = companyRaw` contains `Lloretrans`.
- `hasCanbus = gps === "SIM"` only as a demo proxy; UI must label this as GPS availability, not confirmed CANBUS.

- [ ] **Step 3: Seed clients and transporters from freight fixtures**

From `freight-loads.json`:

- Create clients from unique `client`.
- Create suppliers only for `carrierKind === "external_transporter"`.
- Do not create a supplier row for internal `LLORETRANS`; keep `supplierId: null`, `carrierName: "LLORETRANS"`, `carrierKind: "internal_lloretrans"`.

- [ ] **Step 4: Seed freight loads from Excel fixtures**

For each `AitiproFreightLoad`:

```ts
priceBuy = paidTransporterEur ?? 0;
priceSell = priceClientEur ?? 0;
margin = marginEur ?? 0;
marginPct = priceBuy > 0 ? margin / priceBuy : 0;
state = paymentRegularization === "R" ? "paid" : "client_invoiced";
plate = tractorPlate;
trailerPlate = trailerPlate;
cmrNumber = cmrNumber;
supplierInvoiceNumber = supplierInvoiceNumber;
customerInvoiceNumber = customerInvoiceNumber;
paymentRegularization = paymentRegularization;
paymentMonth = paymentMonth;
serviceValueEur = serviceValueEur;
sourceRow = sourceRow;
```

- [ ] **Step 5: Seed fuel fills from real fuel fixtures**

Insert only records where `provider !== "frotcom_fee"` and `liters != null`.

Rules:

- Match `plate` to `vehicles.plate` or create inactive vehicle row for unmatched real plate.
- Store `sourceFile`, `sourceRow`, `product`, `stationCountry`, `providerInvoiceNumber`, `driverNameRaw`.
- Keep `frotcom_fee` rows out of `fuel_fills`; display their summary via `fixtures/aitipro/fuel-summary.json`.

- [ ] **Step 6: Recompute commissions using real rule**

After freight loads are inserted, compute commissions with `computeCommissionAmount()` instead of direct inline math.

Expected summary:

- External loads with no internal plate are skipped when `requireInternalVehicle` is true.
- Internal `LLORETRANS` loads can get fixed bonus even where margin is zero.
- Negative margin loads produce negative percent component plus fixed bonus; this must be visible in commission detail.

- [ ] **Step 7: Reset DB**

Run:

```bash
npm run db:push
npm run db:seed
```

Expected seed logs include:

- `freight: 306 cargas reais`
- `fuel: real provider transactions`
- `vehicles: real fleet fixtures`

- [ ] **Step 8: Commit**

Run:

```bash
git add scripts/seed.ts scripts/reset.ts
git commit -m "feat(seed): load real aitipro demo fixtures"
```

---

### Task 10: Realign Bolsa UI With Excel Workflow

**Files:**
- Modify: `app/(platform)/bolsa/page.tsx`
- Modify: `app/(platform)/bolsa/new/page.tsx`
- Modify: `app/(platform)/bolsa/[id]/page.tsx`
- Modify: `app/(platform)/bolsa/actions.ts`
- Modify: `app/(platform)/bolsa/commissions/page.tsx`
- Modify: `lib/commission-rule.ts`
- Test: `tests/freight-real-workflow.test.ts`

- [ ] **Step 1: Make table view the default**

In `/bolsa`, default to a dense Excel-like table with columns:

- Data
- Viatura
- Reboque
- Transportador
- Cliente
- Carga
- Descarga
- Preço Cliente
- Pago Transportador
- Margem
- Nº CMR
- Nº Fatura Cliente
- Nº Fatura Fornecedor
- R/NR
- Mês Pagamento

Keep Kanban as secondary view.

- [ ] **Step 2: Add filters**

Add query filters:

- `regularization=R|NR|blank`
- `carrier=internal|external`
- `client=<name>`
- `q=<free text>`

- [ ] **Step 3: Fix new load form**

Replace stale helper text in `app/(platform)/bolsa/new/page.tsx`:

Current bad text:

```tsx
Comissão é calculada ao atingir estado <code>paid</code> (15% default · 18% Éder).
```

New text:

```tsx
Comissão: 20% do lucro total + bónus de €2,50 nacional ou €5 internacional quando a carga usa viatura Lloretrans.
```

Add fields for:

- Reboque
- Transportador
- Nº CMR
- Nº fatura cliente
- Nº fatura fornecedor
- Regularização
- Mês pagamento
- Valor serviço

- [ ] **Step 4: Fix commission preview**

In `app/(platform)/bolsa/[id]/page.tsx`, replace `row.margin * rule.percentOfMargin` with `computeCommissionAmount()` and pass internal plate set.

- [ ] **Step 5: Add real commission tests**

Extend `tests/freight-real-workflow.test.ts`:

```ts
import { computeCommissionAmount } from "@/lib/commission-rule";

it("pays Lloretrans fixed bonus even when margin is zero", () => {
  const result = computeCommissionAmount(
    { margin: 0, marginPct: 0, plate: "BQ-66-GV", origin: "MARL", destination: "ALGOZ" },
    { percentOfMargin: 0.2, fixedBonusNationalEur: 2.5, fixedBonusInternationalEur: 5, requireInternalVehicle: true, minMarginPct: 0 },
    new Set(["BQ-66-GV"]),
  );
  expect(result.eligible).toBe(true);
  expect(result.amountEur).toBe(2.5);
});
```

- [ ] **Step 6: Commit**

Run:

```bash
git add app/(platform)/bolsa lib/commission-rule.ts tests/freight-real-workflow.test.ts
git commit -m "feat(bolsa): align UI with real Excel workflow"
```

---

### Task 11: Realign Fuel UI With Real Provider Evidence

**Files:**
- Modify: `app/(platform)/fuel/page.tsx`
- Modify: `app/(platform)/fuel/[plate]/page.tsx`
- Modify: `app/(platform)/fuel/actions.ts`
- Modify: `lib/fuel/ranking.ts`
- Modify: `lib/integrations/fuel-cards/index.ts`

- [ ] **Step 1: Rename providers everywhere**

Replace:

- `sepsa` with `cepsa`
- `anamor` with `radius_velocity`
- `Frotcom CANBUS` claims with `Frotcom GPS/API por confirmar` unless the data is from simulated `fuel_readings_canbus`.

- [ ] **Step 2: Add evidence card**

On `/fuel`, add a compact evidence card:

```tsx
<Card>
  <CardContent>
    Dados reais carregados: Cepsa 1261 linhas · Repsol 175 · Radius 96 · Bomba interna 629. Frotcom anexo é mensalidade/equipamento, não leitura CANBUS.
  </CardContent>
</Card>
```

- [ ] **Step 3: Show product/source columns**

On `/fuel/[plate]`, add columns:

- Produto
- País
- Fatura fornecedor
- Ficheiro origem

- [ ] **Step 4: Guard anomaly wording**

If no live CANBUS/API is enabled, label anomalies as:

```text
Sinalização demo baseada em abastecimentos + odómetro disponível. Validação final depende da API Frotcom de leitura.
```

- [ ] **Step 5: Commit**

Run:

```bash
git add app/(platform)/fuel lib/fuel lib/integrations/fuel-cards/index.ts
git commit -m "feat(fuel): show real provider evidence"
```

---

### Task 12: Realign Documents Hub With Sample Files

**Files:**
- Create: `fixtures/aitipro/document-samples.json`
- Modify: `app/(platform)/docs/upload/page.tsx`
- Modify: `app/(platform)/docs/actions.ts`
- Modify: `app/(platform)/docs/helpers.ts`

- [ ] **Step 1: Add document sample metadata**

Create `fixtures/aitipro/document-samples.json`:

```json
[
  { "sourceFilename": "CMR.jpeg", "kind": "cmr", "direction": "saida" },
  { "sourceFilename": "Guia Receção.jpeg", "kind": "guia_recepcao", "direction": "entrada" },
  { "sourceFilename": "Guia Transporte.jpeg", "kind": "guia_remessa", "direction": "saida" },
  { "sourceFilename": "Ticket Frio.jpeg", "kind": "ticket_frio", "direction": "saida" }
]
```

- [ ] **Step 2: Improve kind detection**

Update `detectKindFromFilename()` to normalize accents and detect `receção`, `recepcao`, `transporte`, `frio`.

- [ ] **Step 3: Update upload page wording**

Replace simulated-only wording with:

```text
Amostras reais disponíveis: CMR, Guia Receção, Guia Transporte, Ticket Frio. O upload real continua em modo demo; produção liga scanner/pasta de rede a Blob EU.
```

- [ ] **Step 4: Commit**

Run:

```bash
git add fixtures/aitipro/document-samples.json app/(platform)/docs
git commit -m "feat(docs): align hub with real document samples"
```

---

### Task 13: Update Admin Masters And Service Code Screens

**Files:**
- Modify: `app/(platform)/admin/page.tsx`
- Modify: `app/(platform)/admin/vehicles/page.tsx`
- Modify: `app/(platform)/admin/service-codes/page.tsx`
- Modify: `app/(platform)/admin/suppliers/page.tsx`

- [ ] **Step 1: Fix stale service-code description**

Replace `S1/S2/S3/S9/S17 + obra` with:

```text
S1-S9 externos · L1-L8 internos · I0-I9 operações internas
```

- [ ] **Step 2: Show real fleet context**

On `/admin/vehicles`, add columns if available:

- Empresa
- Motorista
- Reboque
- GPS
- Fonte

- [ ] **Step 3: Show supplier/carrier distinction**

On `/admin/suppliers`, clarify:

- OCR suppliers are office invoice suppliers.
- Freight transporters from Excel are carriers for MVP E.
- `LLORETRANS` internal carrier is not an external supplier.

- [ ] **Step 4: Commit**

Run:

```bash
git add app/(platform)/admin
git commit -m "fix(admin): reflect real masters and code families"
```

---

### Task 14: Update Proposal, Landing, README, Specs, And Demo Script

**Files:**
- Modify: `app/proposta/page.tsx`
- Modify: `app/page.tsx`
- Modify: `README.md`
- Modify: `docs/superpowers/specs/2026-04-19-mvp-a-km-validation.md`
- Modify: `docs/superpowers/specs/2026-04-19-mvp-b-ocr-invoices.md`
- Modify: `docs/superpowers/specs/2026-04-19-mvp-d-fuel.md`
- Modify: `docs/superpowers/specs/2026-04-19-mvp-e-bolsa.md`
- Modify: `docs/superpowers/specs/2026-04-19-platform-architecture.md`
- Create: `docs/demo/lloretrans-commercial-demo-script.md`
- Test: `tests/static-copy-guard.test.ts`

- [ ] **Step 1: Add stale-copy guard**

Create `tests/static-copy-guard.test.ts`:

```ts
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
```

- [ ] **Step 2: Update proposal facts**

In `app/proposta/page.tsx`:

- MVP A delivery: `threshold confirmado 3 km`.
- MVP D pain: `Cepsa/Repsol/Radius/bomba interna + Frotcom API pendente`.
- MVP E delivery: `Excel real de 306 cargas, R/NR, CMR, faturas fornecedor/cliente, comissões por regra confirmada`.
- MVP E dependency: `confirmar se PREÇO CLIENTE/PAGO TRANSPORTADOR representam venda/custo para cálculo de lucro, porque Excel mostra margem global -€1.800`.

- [ ] **Step 3: Update README demo script**

In `README.md`, replace old OCR examples with current catalog suppliers, and add a demo order:

1. Admin evidence screen.
2. Bolsa table from Excel.
3. Commission result with zero/negative margin insight.
4. Fuel provider evidence.
5. OCR catalog.
6. Oficina paper checklist.
7. Open questions.

- [ ] **Step 4: Add commercial demo script**

Create `docs/demo/lloretrans-commercial-demo-script.md` with:

- 5-minute version.
- 15-minute version.
- Exact screens.
- What to say.
- What not to overclaim.
- Open questions for Éder:
  - Confirmar sentido de `PREÇO CLIENTE` e `PAGO TRANSPORTADOR`.
  - Confirmar se bónus €2,50/€5 aplica mesmo quando lucro é zero.
  - Confirmar tolerância combustível.
  - Confirmar contacto integrador PHC.
  - Confirmar cobertura digitalização.

- [ ] **Step 5: Run static-copy test**

Run:

```bash
npm test -- tests/static-copy-guard.test.ts
```

Expected: PASS.

- [ ] **Step 6: Commit**

Run:

```bash
git add app/proposta/page.tsx app/page.tsx README.md docs/superpowers/specs docs/demo/lloretrans-commercial-demo-script.md tests/static-copy-guard.test.ts
git commit -m "docs: align commercial story with real Eder evidence"
```

---

### Task 15: End-To-End Verification Gate

**Files:**
- No code changes expected unless verification finds defects.

- [ ] **Step 1: Rebuild all fixtures**

Run:

```bash
npm run aitipro:build-fixtures
```

Expected:

- Manifest says `28` evidence files.
- Freight extraction says `306`.
- Fuel validation passes all row-count baselines.

- [ ] **Step 2: Reset database**

Run:

```bash
npm run db:push
npm run db:seed
```

Expected DB counts:

- `freightLoads = 306`
- `commissionRules = 1`
- `fuelFills >= 2161` minus `frotcom_fee` rows excluded from consumption.
- `vehicles >= 127`
- `suppliers >= 9`

- [ ] **Step 3: Run tests**

Run:

```bash
npm test
```

Expected: PASS, all test files discovered.

- [ ] **Step 4: Run typecheck**

Run:

```bash
npm run build
npm run typecheck
```

Expected: both exit `0`. Build must run before typecheck because this project includes `.next/types/**/*.ts`.

- [ ] **Step 5: Run stale text search**

Run:

```bash
rg -n "Éder 18%|default 15%|15% da margem|default 10 km|S17|Moeve|Dieselplace|Eurocamiones|Anamor|SEPSA" app README.md docs scripts lib tests
```

Expected: no matches except historical notes that explicitly say they are obsolete and not customer-facing.

- [ ] **Step 6: Start dev server**

Run:

```bash
npm run dev
```

Expected: Next serves on `http://localhost:3001`.

- [ ] **Step 7: Manual browser smoke**

Open and verify:

- `/login`
- `/dashboard`
- `/bolsa`
- `/bolsa/commissions`
- `/fuel`
- `/ocr/upload`
- `/oficina/new`
- `/proposta`

Expected:

- No runtime errors.
- Bolsa shows real Excel fields.
- Fuel shows Cepsa/Repsol/Radius/bomba evidence.
- OCR upload options match current catalog.
- Oficina service dropdown is not empty.
- Proposal has no stale 10 km / 18% copy.

- [ ] **Step 8: Commit final verification fixes**

If fixes were needed:

```bash
git add .
git commit -m "fix: close realignment verification gaps"
```

If no fixes were needed:

```bash
git status --short
```

Expected: clean worktree.

---

## Rollout Order

1. Tasks 1-2: evidence and guardrails.
2. Tasks 3-6: fixture extraction.
3. Tasks 7-9: data correctness and seed.
4. Tasks 10-13: MVP UI realignment.
5. Task 14: commercial narrative.
6. Task 15: verification gate.

## Presentation Readiness Definition

The repo is ready for Éder only when all are true:

- Customer-facing copy contains `3 km`, `20% lucro`, `€2,50 nacional`, `€5 internacional`, and no stale `18%/15%/10 km/S17` claims.
- `/bolsa` can show the real Excel workflow, not just synthetic SaaS margin rows.
- `/fuel` shows Cepsa/Repsol/Radius/bomba internal evidence and does not pretend the attached Frotcom file is CANBUS.
- `/ocr/upload` no longer exposes Moeve/Dieselplace/Eurocamiones stale labels.
- `/oficina/new` service-code dropdown works with S/L/I families and the 17-item paper checklist.
- `npm test`, `npm run build`, and post-build `npm run typecheck` pass.

## Self-Review

- Spec coverage: all audited gaps are mapped to tasks: evidence inventory, freight Excel, fleet, fuel, OCR catalog, workshop codes, schema/seed, Bolsa UI, Fuel UI, Docs hub, Admin, proposal/docs, tests, and final verification.
- Placeholder scan: no task uses open-ended `TBD`/`TODO`; each task has concrete files, commands, expected outputs, and acceptance criteria.
- Type consistency: fixture types use stable names: `AitiproFreightLoad`, `FuelProvider`, `VehicleFixture`, `DriverFixture`; seed/UI tasks consume those names consistently.
