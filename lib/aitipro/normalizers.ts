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
  const cleaned = String(value).replace(/[^\d,.-]/g, "");
  const comma = cleaned.lastIndexOf(",");
  const dot = cleaned.lastIndexOf(".");
  const normalized =
    comma > dot
      ? cleaned.replace(/\./g, "").replace(",", ".")
      : cleaned.replace(/,/g, "");
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
