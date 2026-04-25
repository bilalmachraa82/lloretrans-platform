import fs from "node:fs";
import path from "node:path";
import * as XLSX from "xlsx";
import { displayPlate, normalizeText, parseEuro } from "@/lib/aitipro/normalizers";
import { type FuelProvider } from "@/lib/fuel/provider-model";

const ROOT = "/Users/bilal/Downloads/AITIPRO/Combustível";
const OUT_DIR = path.join(process.cwd(), "fixtures", "aitipro");

interface FuelTransactionFixture {
  provider: FuelProvider;
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

function rows(file: string): Record<string, unknown>[] {
  const workbook = XLSX.readFile(path.join(ROOT, file), { cellDates: true });
  return XLSX.utils.sheet_to_json<Record<string, unknown>>(workbook.Sheets.FE, {
    defval: null,
    raw: false,
  });
}

function rowArrays(file: string): unknown[][] {
  const workbook = XLSX.readFile(path.join(ROOT, file), { cellDates: true });
  return XLSX.utils.sheet_to_json<unknown[]>(workbook.Sheets.FE, {
    header: 1,
    defval: null,
    raw: false,
  });
}

function parseNumber(value: unknown): number | null {
  return parseEuro(value);
}

function parseOdometer(value: unknown): number | null {
  const parsed = parseNumber(value);
  return parsed == null ? null : Math.round(parsed);
}

function parseDate(value: unknown): string | null {
  const text = normalizeText(value);
  if (!text) return null;
  const monthMap: Record<string, string> = {
    jan: "01",
    fev: "02",
    mar: "03",
    abr: "04",
    mai: "05",
    jun: "06",
    jul: "07",
    ago: "08",
    set: "09",
    out: "10",
    nov: "11",
    dez: "12",
  };
  const pt = text.match(/^(\d{1,2})-([a-zç]{3})-(\d{4})\s+(\d{2}:\d{2})$/i);
  if (pt) return `${pt[3]}-${monthMap[pt[2].toLowerCase()] ?? "01"}-${pt[1].padStart(2, "0")}T${pt[4]}:00`;

  const dmy = text.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})(?:\s+(\d{1,2}:\d{2}(?::\d{2})?))?$/);
  if (dmy) return `${dmy[3]}-${dmy[2].padStart(2, "0")}-${dmy[1].padStart(2, "0")}T${(dmy[4] ?? "00:00:00").padEnd(8, ":00")}`;

  const mdyShort = text.match(/^(\d{1,2})\/(\d{1,2})\/(\d{2})(?:\s+(\d{1,2}:\d{2}))?$/);
  if (mdyShort) return `20${mdyShort[3]}-${mdyShort[1].padStart(2, "0")}-${mdyShort[2].padStart(2, "0")}T${mdyShort[4] ?? "00:00"}:00`;

  const date = new Date(text);
  return Number.isNaN(date.getTime()) ? null : date.toISOString();
}

function parseRepsolDate(dateValue: unknown, timeValue: unknown): string | null {
  const date = normalizeText(dateValue);
  if (!date || !/^\d{8}$/.test(date)) return null;
  const time = normalizeText(timeValue)?.padStart(4, "0") ?? "0000";
  return `${date.slice(0, 4)}-${date.slice(4, 6)}-${date.slice(6, 8)}T${time.slice(0, 2)}:${time.slice(2, 4)}:00`;
}

function source(file: string): string {
  return file.normalize("NFC");
}

const transactions: FuelTransactionFixture[] = [];

for (const [index, row] of rows("Cepsa/transacciones-cepsa-19-03-2026.xlsx").entries()) {
  transactions.push({
    provider: "cepsa",
    sourceFile: source("Cepsa/transacciones-cepsa-19-03-2026.xlsx"),
    sourceRow: index + 2,
    plate: displayPlate(row.Matricula),
    occurredAt: parseDate(row["Fecha y hora"]),
    product: normalizeText(row.Concepto),
    liters: parseNumber(row["Litros / Unidades"]),
    totalEur: parseNumber(row["Importe Operación"]),
    odometerKm: parseOdometer(row["Kilómetros"]),
    cardNumber: normalizeText(row.Tarjeta),
    invoiceNumber: normalizeText(row.Factura),
    station: normalizeText(row.Lugar),
    country: normalizeText(row.Pais),
    driverRaw: null,
  });
}

for (const [index, row] of rows("repsol/Cópia de Operaciones202602.xls").entries()) {
  transactions.push({
    provider: "repsol",
    sourceFile: source("repsol/Cópia de Operaciones202602.xls"),
    sourceRow: index + 2,
    plate: displayPlate(row.MATRICULA),
    occurredAt: parseRepsolDate(row.FEC_OPERAC, row.HOR_OPERAC),
    product: normalizeText(row.DES_PRODU),
    liters: parseNumber(row.NUM_LITROS),
    totalEur: parseNumber(row.IMPORTE),
    odometerKm: parseOdometer(row.KILOMETROS),
    cardNumber: normalizeText(row.NUM_TARJET),
    invoiceNumber: normalizeText(row.NUM_FACTUR),
    station: normalizeText(row.NOM_ESTABL),
    country: normalizeText(row.POB_ESTABL),
    driverRaw: normalizeText(row.CONDUCTOR),
  });
}

for (const file of [
  "Radius velocity/Lloretrans, Unipessoal Lda (195621001) - Transactions (28).xlsx",
  "Radius velocity/Lloretrans, Unipessoal Lda (195621001) - Transactions (29).xlsx",
]) {
  let currentPlate: string | null = null;
  for (const [index, row] of rows(file).entries()) {
    const group = normalizeText(row["Grupo de cartões"]);
    if (group) currentPlate = displayPlate(group.split(" - ")[0]);
    if (!row["Data Hora"] || !row.Produto || !row.Quantidade) continue;
    transactions.push({
      provider: "radius_velocity",
      sourceFile: source(file),
      sourceRow: index + 2,
      plate: currentPlate,
      occurredAt: parseDate(row["Data Hora"]),
      product: normalizeText(row.Produto),
      liters: parseNumber(row.Quantidade),
      totalEur: parseNumber(row["Líquido"]),
      odometerKm: parseOdometer(row.Quilometragem),
      cardNumber: normalizeText(row["Identificador do cartão"]),
      invoiceNumber: normalizeText(row["Número da fatura"]),
      station: normalizeText(row["Nome do posto"]),
      country: normalizeText(row["País"]),
      driverRaw: null,
    });
  }
}

for (const [index, row] of rows("interno/Transactions.xls").entries()) {
  transactions.push({
    provider: "bomba_interna",
    sourceFile: source("interno/Transactions.xls"),
    sourceRow: index + 2,
    plate: displayPlate(row.LicensePlate),
    occurredAt: parseDate(row["Date/time"]),
    product: normalizeText(row.Article),
    liters: parseNumber(row.Quantity),
    totalEur: parseNumber(row.Amount),
    odometerKm: parseOdometer(row.Odometer),
    cardNumber: normalizeText(row["Card Nb."]),
    invoiceNumber: normalizeText(row.Number),
    station: normalizeText(row.Station),
    country: normalizeText(row.Customer),
    driverRaw: normalizeText(row.Driver),
  });
}

const frotcomRows = rowArrays("Frotcom/Cópia de LLORETRANS_Mar.xlsx").slice(1);
for (const [index, row] of frotcomRows.entries()) {
  transactions.push({
    provider: "frotcom_fee",
    sourceFile: source("Frotcom/Cópia de LLORETRANS_Mar.xlsx"),
    sourceRow: index + 2,
    plate: displayPlate(row[0]),
    occurredAt: null,
    product: "Mensalidade/equipamento Frotcom",
    liters: null,
    totalEur: parseEuro(row[18]),
    odometerKm: null,
    cardNumber: null,
    invoiceNumber: null,
    station: null,
    country: normalizeText(row[1]),
    driverRaw: null,
  });
}

const summary = {
  providers: Object.fromEntries(
    ["cepsa", "repsol", "radius_velocity", "bomba_interna", "frotcom_fee"].map((provider) => {
      const providerRows = transactions.filter((transaction) => transaction.provider === provider);
      return [provider, {
        rows: providerRows.length,
        totalLiters: Math.round(providerRows.reduce((sum, row) => sum + (row.liters ?? 0), 0) * 100) / 100,
        totalEur: Math.round(providerRows.reduce((sum, row) => sum + (row.totalEur ?? 0), 0) * 100) / 100,
      }];
    }),
  ),
};

fs.mkdirSync(OUT_DIR, { recursive: true });
fs.writeFileSync(path.join(OUT_DIR, "fuel-transactions.json"), `${JSON.stringify(transactions, null, 2)}\n`);
fs.writeFileSync(path.join(OUT_DIR, "fuel-summary.json"), `${JSON.stringify(summary, null, 2)}\n`);
console.log(`Extracted ${transactions.length} fuel rows`);
