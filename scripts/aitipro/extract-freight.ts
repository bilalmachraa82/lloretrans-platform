import fs from "node:fs";
import path from "node:path";
import * as XLSX from "xlsx";
import { displayPlate, normalizeRegularization, normalizeText, parseEuro, parseExcelDate } from "@/lib/aitipro/normalizers";
import { type AitiproFreightLoad, isInternalLloretrans } from "@/lib/freight/excel-model";

const SOURCE = "/Users/bilal/Downloads/AITIPRO/Cargas Aluguer.xlsx";
const OUT_DIR = path.join(process.cwd(), "fixtures", "aitipro");

function cell(row: Record<string, unknown>, key: string): unknown {
  if (key in row) return row[key];
  const match = Object.keys(row).find((candidate) => candidate.trim() === key);
  return match ? row[match] : null;
}

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
    cmrNumber: normalizeText(cell(row, "Nº CMR")),
    supplierInvoiceNumber: normalizeText(cell(row, "Nº FATURA FORNECEDOR")),
    responsible: normalizeText(cell(row, "RESPONSÁVEL")),
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
