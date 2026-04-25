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
