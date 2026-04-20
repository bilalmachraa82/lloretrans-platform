import fs from "node:fs";
import path from "node:path";
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
const pdfParse = require("pdf-parse") as (buffer: Buffer) => Promise<{ text: string; numpages: number; info: Record<string, unknown> }>;

const FIXTURE_DIR = path.join(process.cwd(), "fixtures", "real-invoices");
const OUT_DIR = path.join(process.cwd(), "fixtures", "extracted");

interface ExtractedInvoice {
  filename: string;
  rawText: string;
  numPages: number;
  info: Record<string, unknown>;
  heuristics: {
    possibleSupplierName: string | null;
    possibleTaxId: string | null;
    possibleInvoiceNumber: string | null;
    possibleTotal: number | null;
    possiblePlate: string | null;
    possibleDate: string | null;
  };
}

function extractTaxId(text: string): string | null {
  const match = text.match(/\b(?:NIF|N[ÚU]mero\s+de\s+Contribuinte|NIPC)[:\s]*([0-9]{9})\b/i);
  if (match) return match[1];
  const simple = text.match(/\b(PT\s*)?([0-9]{9})\b/);
  return simple ? simple[2] : null;
}

function extractInvoiceNumber(text: string): string | null {
  const patterns = [
    /(?:Factura|Fatura|Invoice)\s*(?:n\.?o\.?|nº|N\.?º|No\.?)\s*[:.]?\s*([A-Z0-9\/\-\s]{3,25})/i,
    /FT\s*[A-Z0-9]*[\s\/\-]*([0-9]{4,})/,
    /N\.?º\s*([0-9]{4,})/,
  ];
  for (const p of patterns) {
    const m = text.match(p);
    if (m) return m[1].trim().replace(/\s+/g, " ");
  }
  return null;
}

function extractTotal(text: string): number | null {
  const patterns = [
    /(?:Total\s+(?:a\s+Pagar|Geral|Factura|Fatura)|Total\s+EUR)[:\s]*([0-9]{1,3}(?:[.\s][0-9]{3})*(?:,[0-9]{2}))/i,
    /Total[:\s]+([0-9]{1,3}(?:[.\s][0-9]{3})*(?:,[0-9]{2}))\s*(?:EUR|€)/i,
    /([0-9]{1,3}(?:[.\s][0-9]{3})*,[0-9]{2})\s*(?:€|EUR)\s*$/m,
  ];
  for (const p of patterns) {
    const m = text.match(p);
    if (m) {
      const n = m[1].replace(/\./g, "").replace(/\s/g, "").replace(",", ".");
      const v = Number(n);
      if (!Number.isNaN(v)) return v;
    }
  }
  return null;
}

function extractPlate(text: string): string | null {
  const patterns = [
    /\b([A-Z]{2}-[0-9]{2}-[A-Z]{2})\b/,
    /\b([0-9]{2}-[A-Z]{2}-[0-9]{2})\b/,
    /\b([A-Z]{2}-[0-9]{2}-[0-9]{2})\b/,
    /\b([0-9]{2}-[0-9]{2}-[A-Z]{2})\b/,
  ];
  for (const p of patterns) {
    const m = text.match(p);
    if (m) return m[1];
  }
  return null;
}

function extractDate(text: string): string | null {
  const patterns = [
    /\b([0-9]{2}[\/\-\.][0-9]{2}[\/\-\.][0-9]{4})\b/,
    /\b([0-9]{4}[\/\-\.][0-9]{2}[\/\-\.][0-9]{2})\b/,
  ];
  for (const p of patterns) {
    const m = text.match(p);
    if (m) return m[1];
  }
  return null;
}

function extractSupplierName(text: string, filename: string): string | null {
  const firstLines = text.split("\n").slice(0, 10).join(" ");
  const knownSuppliers = [
    "Moeve Pro", "Policalço", "Selcar", "Create Business", "Prevrod",
    "Popapneus", "Dieselplace", "Pneuser", "Lubrigaz", "Eurocamiones",
    "Tecnicauto", "Autocares", "Gasóleos",
  ];
  for (const s of knownSuppliers) {
    if (firstLines.toLowerCase().includes(s.toLowerCase())) return s;
  }
  const cleanFirst = text.split("\n").find((l) => l.trim().length > 5 && !/factura|invoice/i.test(l));
  return cleanFirst ? cleanFirst.trim().slice(0, 60) : null;
}

async function main(): Promise<void> {
  if (!fs.existsSync(FIXTURE_DIR)) {
    console.error(`Missing fixture dir: ${FIXTURE_DIR}`);
    process.exit(1);
  }
  fs.mkdirSync(OUT_DIR, { recursive: true });

  const files = fs
    .readdirSync(FIXTURE_DIR)
    .filter((f) => f.toLowerCase().endsWith(".pdf"))
    .sort();

  const results: ExtractedInvoice[] = [];

  for (const f of files) {
    const full = path.join(FIXTURE_DIR, f);
    const buffer = fs.readFileSync(full);
    try {
      const parsed = await pdfParse(buffer);
      const text = parsed.text;
      const heuristics = {
        possibleSupplierName: extractSupplierName(text, f),
        possibleTaxId: extractTaxId(text),
        possibleInvoiceNumber: extractInvoiceNumber(text),
        possibleTotal: extractTotal(text),
        possiblePlate: extractPlate(text),
        possibleDate: extractDate(text),
      };
      const record: ExtractedInvoice = {
        filename: f,
        rawText: text,
        numPages: parsed.numpages,
        info: parsed.info,
        heuristics,
      };
      results.push(record);
      fs.writeFileSync(
        path.join(OUT_DIR, f.replace(/\.pdf$/i, ".json")),
        JSON.stringify(record, null, 2),
      );
      console.log(`✓ ${f} → ${heuristics.possibleSupplierName ?? "?"} · ${heuristics.possibleTotal ?? "?"} EUR`);
    } catch (err) {
      console.error(`✗ ${f}:`, err instanceof Error ? err.message : err);
    }
  }

  fs.writeFileSync(
    path.join(OUT_DIR, "_index.json"),
    JSON.stringify(
      results.map((r) => ({
        filename: r.filename,
        heuristics: r.heuristics,
      })),
      null,
      2,
    ),
  );

  console.log(`\n✓ Extracted ${results.length} invoices → ${OUT_DIR}/`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
