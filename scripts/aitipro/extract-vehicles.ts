import fs from "node:fs";
import path from "node:path";
import * as XLSX from "xlsx";
import { displayPlate, normalizeText } from "@/lib/aitipro/normalizers";

const GROUP_SOURCE = "/Users/bilal/Downloads/AITIPRO/Viaturas Grupo.xlsx";
const RELATION_SOURCE = "/Users/bilal/Downloads/AITIPRO/Relação de todos os carros Lloretrans.xlsx";
const OUT_DIR = path.join(process.cwd(), "fixtures", "aitipro");

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

function rows(workbook: XLSX.WorkBook, sheetName: string): Record<string, unknown>[] {
  return XLSX.utils.sheet_to_json<Record<string, unknown>>(workbook.Sheets[sheetName], {
    defval: null,
    raw: false,
  });
}

function gpsValue(value: unknown): "SIM" | "NÃO" | null {
  const text = normalizeText(value)?.toUpperCase();
  return text === "SIM" || text === "NÃO" ? text : null;
}

function pushVehicle(vehicles: VehicleFixture[], input: Omit<VehicleFixture, "plate"> & { plate: unknown }): void {
  const plate = displayPlate(input.plate);
  if (!plate) return;
  vehicles.push({ ...input, plate });
}

const groupWorkbook = XLSX.readFile(GROUP_SOURCE, { cellDates: true });
const relationWorkbook = XLSX.readFile(RELATION_SOURCE, { cellDates: true });

const soldPlates = new Set(
  rows(groupWorkbook, "VENDIDO")
    .map((row) => displayPlate(row["Matrícula"]))
    .filter((plate): plate is string => Boolean(plate)),
);

const vehicles: VehicleFixture[] = [];
const drivers: DriverFixture[] = [];

for (const row of rows(groupWorkbook, "Lloretrans")) {
  pushVehicle(vehicles, {
    plate: row["Matrícula"],
    source: "viaturas_grupo_lloretrans",
    companyRaw: "Lloretrans",
    driverRaw: normalizeText(row.CONDUTOR),
    trailerPlate: null,
    brand: normalizeText(row.Marca),
    model: normalizeText(row.Modelo),
    category: normalizeText(row.Categoria),
    gps: gpsValue(row.GPS),
    active: !soldPlates.has(displayPlate(row["Matrícula"]) ?? ""),
  });
}

for (const row of rows(groupWorkbook, "GPP")) {
  pushVehicle(vehicles, {
    plate: row["Matrícula"],
    source: "viaturas_grupo_gpp",
    companyRaw: normalizeText(row.EMPRESA),
    driverRaw: normalizeText(row.CONDUTOR),
    trailerPlate: null,
    brand: normalizeText(row.Marca),
    model: normalizeText(row.Modelo),
    category: normalizeText(row.Categoria),
    gps: gpsValue(row.GPS),
    active: !soldPlates.has(displayPlate(row["Matrícula"]) ?? ""),
  });
}

for (const row of rows(groupWorkbook, "Chaveiro")) {
  const plate = displayPlate(row.Matricula);
  pushVehicle(vehicles, {
    plate: row.Matricula,
    source: "chaveiro",
    companyRaw: normalizeText(row.Empresa),
    driverRaw: null,
    trailerPlate: null,
    brand: normalizeText(row.Marca),
    model: normalizeText(row.Modelo),
    category: normalizeText(row.Categoria),
    gps: null,
    active: normalizeText(row.Inativo)?.toLowerCase() === "ativo" && !soldPlates.has(plate ?? ""),
  });
}

for (const row of rows(relationWorkbook, "Viaturas-Motoristas")) {
  const leftDriver = normalizeText(row.MOTORISTA);
  const rightDriver = normalizeText(row.MOTORISTA_1);
  const leftPlate = displayPlate(row.MATRICULA);
  const rightPlate = displayPlate(row.MATRICULA_1);

  if (leftPlate && !["INTERNACIONAL", "NACIONAL"].includes(leftPlate)) {
    pushVehicle(vehicles, {
      plate: row.MATRICULA,
      source: "relacao_lloretrans",
      companyRaw: "Lloretrans",
      driverRaw: leftDriver,
      trailerPlate: displayPlate(row.REBOQUE),
      brand: null,
      model: null,
      category: null,
      gps: null,
      active: true,
    });
  }

  if (rightPlate && !["INTERNACIONAL", "NACIONAL"].includes(rightPlate)) {
    pushVehicle(vehicles, {
      plate: row.MATRICULA_1,
      source: "relacao_lloretrans",
      companyRaw: "Lloretrans",
      driverRaw: rightDriver,
      trailerPlate: displayPlate(row.REBOQUE_1),
      brand: null,
      model: null,
      category: null,
      gps: null,
      active: true,
    });
  }

  for (const [name, contact] of [[leftDriver, row.Contacto], [rightDriver, null]] as const) {
    if (!name || /^(INTERNACIONAL|NACIONAL)$/i.test(name)) continue;
    drivers.push({
      name,
      contactRaw: normalizeText(contact),
      source: "relacao_viaturas_motoristas",
    });
  }
}

for (const row of rows(relationWorkbook, "Viaturas")) {
  pushVehicle(vehicles, {
    plate: row.MATRICULA,
    source: "relacao_lloretrans",
    companyRaw: "Lloretrans",
    driverRaw: null,
    trailerPlate: null,
    brand: null,
    model: null,
    category: null,
    gps: null,
    active: true,
  });
}

for (const row of rows(relationWorkbook, "Motoristas")) {
  const name = normalizeText(row.Motorista);
  if (!name) continue;
  drivers.push({
    name,
    contactRaw: normalizeText(row.Contacto),
    source: "relacao_motoristas",
  });
}

fs.mkdirSync(OUT_DIR, { recursive: true });
fs.writeFileSync(path.join(OUT_DIR, "vehicles.json"), `${JSON.stringify(vehicles, null, 2)}\n`);
fs.writeFileSync(path.join(OUT_DIR, "drivers.json"), `${JSON.stringify(drivers, null, 2)}\n`);
console.log(`Extracted ${vehicles.length} vehicle rows and ${drivers.length} driver rows`);
