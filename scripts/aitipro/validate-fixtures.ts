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
