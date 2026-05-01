/**
 * Seed Postgres (Neon) para demo Lloretrans × AiTiPro.
 * Fonte principal: fixtures/aitipro/* gerados a partir da pasta de evidência do Éder.
 */
import fs from "node:fs";
import path from "node:path";
import { config } from "dotenv";
import postgres from "postgres";
import { drizzle } from "drizzle-orm/postgres-js";
import * as schema from "../db/schema";
import { computeCommissionAmount } from "../lib/commission-rule";

config({ path: ".env.local" });

const DATABASE_URL = process.env.DATABASE_URL_DIRECT ?? process.env.DATABASE_URL;
if (!DATABASE_URL) throw new Error("DATABASE_URL not set");

const ALL_TABLES_IN_ORDER = [
  "work_order_checklist_answers",
  "work_order_signatures",
  "work_order_photos",
  "work_order_items",
  "work_orders",
  "commissions",
  "commission_rules",
  "client_invoices_freight",
  "supplier_invoices_freight",
  "freight_state_transitions",
  "freight_loads",
  "fuel_anomalies",
  "fuel_fills",
  "fuel_readings_canbus",
  "document_permissions",
  "document_associations",
  "documents",
  "supplier_rules",
  "ocr_extractions",
  "invoice_lines",
  "invoices",
  "km_reconciliations",
  "trips",
  "audit_log",
  "sessions",
  "suppliers",
  "clients",
  "drivers",
  "vehicles",
  "work_codes",
  "service_codes",
  "users",
  "companies",
  "feature_flags",
];

interface ServiceCodeFixture {
  code: string;
  label: string;
  description: string;
  kind: string;
}

interface VehicleFixture {
  plate: string;
  source: string;
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
  source: string;
}

interface FreightFixture {
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
  paymentRegularization: "R" | "NR" | null;
  paymentMonth: string | null;
}

interface FuelFixture {
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

interface CatalogEntry {
  sourceFilename: string;
  fixtureFilename: string;
  filename: string;
  supplier: { name: string; taxId: string; category: string };
  invoice: {
    number: string;
    issuedAt: string;
    dueAt: string;
    totalNet: number;
    totalVat: number;
    totalGross: number;
    currency: string;
    plate: string | null;
  };
  classification: { serviceCode: string; workCode: string; confidence: number };
  lines: Array<{ description: string; quantity: number; unitPrice: number; vatRate: number; total: number; serviceCode: string }>;
}

function id(prefix: string, n: number): string {
  return `${prefix}_${n.toString().padStart(5, "0")}`;
}

function dt(daysAgo: number, hour = 8, min = 0): Date {
  const d = new Date();
  d.setHours(hour, min, 0, 0);
  d.setDate(d.getDate() - daysAgo);
  return d;
}

function readJson<T>(relativePath: string): T {
  return JSON.parse(fs.readFileSync(path.join(process.cwd(), relativePath), "utf-8")) as T;
}

function chunk<T>(arr: T[], n: number): T[][] {
  const out: T[][] = [];
  for (let i = 0; i < arr.length; i += n) out.push(arr.slice(i, i + n));
  return out;
}

function slug(value: string): string {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_|_$/g, "")
    .slice(0, 48);
}

function companyIdFromRaw(companyRaw: string | null): string {
  const text = (companyRaw ?? "").toLowerCase();
  if (text.includes("tomate")) return "co_tdo";
  if (text.includes("cereja")) return "co_cdn";
  if (text.includes("frutas") || text.includes("patricia") || text.includes("pilar")) return "co_fdo";
  return "co_llt";
}

function parseDate(value: string | null): Date | null {
  if (!value) return null;
  const d = new Date(value);
  return Number.isNaN(d.getTime()) ? null : d;
}

function monthPeriod(date: string | null): string {
  return date?.slice(0, 7) ?? new Date().toISOString().slice(0, 7);
}

async function main(): Promise<void> {
  const sql = postgres(DATABASE_URL!, { max: 1, prepare: false });
  const db = drizzle(sql, { schema });

  for (const table of ALL_TABLES_IN_ORDER) {
    await sql.unsafe(`TRUNCATE TABLE "${table}" RESTART IDENTITY CASCADE;`).catch(() => {});
  }
  console.log("✓ Truncated tables");

  const serviceCodeFixtures = readJson<Array<ServiceCodeFixture & { source?: string }>>("fixtures/aitipro/service-codes.json");
  const vehicleFixtures = readJson<VehicleFixture[]>("fixtures/aitipro/vehicles.json");
  const driverFixtures = readJson<DriverFixture[]>("fixtures/aitipro/drivers.json");
  const freightFixtures = readJson<FreightFixture[]>("fixtures/aitipro/freight-loads.json");
  const fuelFixtures = readJson<FuelFixture[]>("fixtures/aitipro/fuel-transactions.json");
  const manifest = readJson<{ files: Array<{ relativePath: string; sha256: string }> }>("fixtures/aitipro/source-manifest.json");
  const catalog = readJson<{ entries: CatalogEntry[] }>("fixtures/extracted/_catalog.json");

  const companies = [
    { id: "co_llt", slug: "lloretrans", name: "Lloretrans, Unipessoal Lda.", taxId: "509750460", group: "patricia-pilar" },
    { id: "co_fdo", slug: "frutas-oeste", name: "Frutas do Oeste, Lda.", taxId: "demo-500333444", group: "patricia-pilar" },
    { id: "co_tdo", slug: "tomate-oeste", name: "Tomate do Oeste, S.A.", taxId: "demo-500555666", group: "patricia-pilar" },
    { id: "co_cdn", slug: "cerejas-norte", name: "Cerejas do Norte, Lda.", taxId: "demo-500777888", group: "patricia-pilar" },
  ];
  await db.insert(schema.companies).values(companies.map((c) => ({ ...c, createdAt: dt(90) })));
  console.log(`✓ ${companies.length} companies`);

  const users = [
    { id: "u_bilal", email: "bilal.machraa@aitipro.com", name: "Bilal Machraa", role: "admin", companyId: null },
    { id: "u_clarice", email: "clarice@lloretrans.pt", name: "Clarice Santos", role: "clarice", companyId: "co_llt" },
    { id: "u_eder", email: "eder@lloretrans.pt", name: "Éder Monteiro", role: "comercial", companyId: "co_llt" },
    { id: "u_miguel", email: "miguel@lloretrans.pt", name: "Miguel Ferreira", role: "comercial", companyId: "co_llt" },
    { id: "u_helio", email: "helio@lloretrans.pt", name: "Hélio Marques", role: "admin", companyId: "co_llt" },
    { id: "u_adm_of", email: "ana.oficina@lloretrans.pt", name: "Ana Almeida", role: "admin_oficina", companyId: "co_llt" },
    { id: "u_adm_fat", email: "rita.fat@lloretrans.pt", name: "Rita Pereira", role: "admin_faturacao", companyId: "co_llt" },
    { id: "u_adm_con", email: "sofia.contas@grupo.pt", name: "Sofia Coelho", role: "admin_contas", companyId: "co_llt" },
    { id: "u_dig", email: "digit@lloretrans.pt", name: "Marta Silva", role: "digitalizacao", companyId: "co_llt" },
    { id: "u_mec1", email: "joao.mec@lloretrans.pt", name: "João Oliveira", role: "mecanico", companyId: "co_llt" },
    { id: "u_mec2", email: "pedro.mec@lloretrans.pt", name: "Pedro Reis", role: "mecanico", companyId: "co_llt" },
  ];
  await db.insert(schema.users).values(users.map((u) => ({ ...u, active: true, createdAt: dt(60) })));
  console.log(`✓ ${users.length} users`);

  const serviceCodes = serviceCodeFixtures.map(({ code, label, description, kind }) => ({ code, label, description, kind }));
  await db.insert(schema.serviceCodes).values(serviceCodes);
  console.log(`✓ ${serviceCodes.length} service codes from fixtures`);

  const workCodes = [
    { code: "INT-OFI-LLT", label: "Oficina interna · Lloretrans", scope: "internal", companyId: "co_llt" },
    { code: "INT-COMB-LLT", label: "Combustível · Lloretrans", scope: "internal", companyId: "co_llt" },
    { code: "INT-ADM-LLT", label: "Administração · Lloretrans", scope: "internal", companyId: "co_llt" },
    { code: "EXT-CLIENTE", label: "Externo · Cliente oficina terceiro", scope: "external", companyId: null },
  ];
  await db.insert(schema.workCodes).values(workCodes);
  console.log(`✓ ${workCodes.length} work codes`);

  const vehiclePriority = (v: VehicleFixture): number =>
    v.source === "viaturas_grupo_lloretrans" ? 0 : v.source === "relacao_lloretrans" ? 1 : v.source === "viaturas_grupo_gpp" ? 2 : 3;
  const seenVehicles = new Set<string>();
  const vehicles: (typeof schema.vehicles.$inferInsert)[] = [];
  for (const fixture of [...vehicleFixtures].sort((a, b) => vehiclePriority(a) - vehiclePriority(b))) {
    if (seenVehicles.has(fixture.plate)) continue;
    seenVehicles.add(fixture.plate);
    const companyId = companyIdFromRaw(fixture.companyRaw);
    vehicles.push({
      id: id("veh", vehicles.length),
      plate: fixture.plate,
      kind: fixture.category ?? "pesado_mercadorias",
      companyId,
      isInternal: (fixture.companyRaw ?? "").toLowerCase().includes("lloretrans"),
      frotcomId: fixture.source,
      hasCanbus: fixture.gps === "SIM",
      active: fixture.active,
      createdAt: dt(90),
    });
  }
  for (const c of chunk(vehicles, 400)) await db.insert(schema.vehicles).values(c);
  console.log(`✓ vehicles: real fleet fixtures (${vehicles.length})`);

  const driverNames = new Map<string, DriverFixture>();
  for (const fixture of driverFixtures) if (!driverNames.has(fixture.name)) driverNames.set(fixture.name, fixture);
  const drivers: (typeof schema.drivers.$inferInsert)[] = [...driverNames.values()].map((fixture, index) => ({
    id: id("drv", index),
    name: fixture.name,
    employeeCode: `AITI-${(index + 1).toString().padStart(4, "0")}`,
    companyId: "co_llt",
    logueTransId: fixture.source,
    active: true,
  }));
  for (const c of chunk(drivers, 400)) await db.insert(schema.drivers).values(c);
  console.log(`✓ drivers: real driver fixtures (${drivers.length})`);

  const clientNames = [...new Set(freightFixtures.map((load) => load.client.trim()))].sort();
  const clients = clientNames.map((name, index) => ({
    id: id("cli", index),
    taxId: null,
    name,
    country: "PT",
    paymentTermsDays: 60,
    phcId: null,
    createdAt: dt(180),
  }));
  await db.insert(schema.clients).values(clients);
  const clientIdByName = new Map(clients.map((client) => [client.name, client.id]));
  console.log(`✓ clients: ${clients.length} from freight Excel`);

  const suppliers: (typeof schema.suppliers.$inferInsert)[] = [];
  const supplierIdByTax = new Map<string, string>();
  for (const entry of catalog.entries) {
    if (supplierIdByTax.has(entry.supplier.taxId)) continue;
    const supplierId = id("sup", suppliers.length);
    supplierIdByTax.set(entry.supplier.taxId, supplierId);
    suppliers.push({
      id: supplierId,
      taxId: entry.supplier.taxId,
      name: entry.supplier.name,
      category: entry.supplier.category,
      defaultServiceCode: entry.classification.serviceCode,
      defaultWorkCode: entry.classification.workCode,
      contactEmail: null,
      createdAt: dt(120),
    });
  }
  const carrierIdByName = new Map<string, string>();
  for (const transporter of [...new Set(freightFixtures.filter((load) => load.carrierKind === "external_transporter").map((load) => load.transporter))].sort()) {
    const supplierId = id("sup", suppliers.length);
    carrierIdByName.set(transporter, supplierId);
    suppliers.push({
      id: supplierId,
      taxId: `carrier:${slug(transporter)}`,
      name: transporter,
      category: "Transportador externo · MVP E",
      defaultServiceCode: "T1",
      defaultWorkCode: "EXT-CLIENTE",
      contactEmail: null,
      createdAt: dt(120),
    });
  }
  for (const c of chunk(suppliers, 400)) await db.insert(schema.suppliers).values(c);
  console.log(`✓ suppliers: ${catalog.entries.length} OCR + ${carrierIdByName.size} freight carriers`);

  await db.insert(schema.featureFlags).values([
    { key: "mvp.a", enabled: true, description: "MVP A · Validação de km" },
    { key: "mvp.b", enabled: true, description: "MVP B · OCR facturas" },
    { key: "mvp.c", enabled: true, description: "MVP C · Digitalização central" },
    { key: "mvp.d", enabled: true, description: "MVP D · Combustível" },
    { key: "mvp.e", enabled: true, description: "MVP E · Bolsa de carga" },
    { key: "mvp.f", enabled: true, description: "MVP F · Oficina PWA" },
    { key: "integration.logue_trans_live", enabled: false, description: "API real Logue Trans" },
    { key: "integration.frotcom_live", enabled: false, description: "API real Frotcom" },
    { key: "integration.phc_live", enabled: false, description: "Integrador PHC" },
  ]);
  console.log("✓ feature flags");

  const commissionRule = {
    id: "cr_default",
    salespersonId: null,
    percentOfMargin: 0.2,
    minMarginPct: 0,
    fixedBonusNationalEur: 2.5,
    fixedBonusInternationalEur: 5,
    requireInternalVehicle: true,
    activeFrom: dt(365),
    activeTo: null,
  };
  await db.insert(schema.commissionRules).values([commissionRule]);
  console.log("✓ commissionRules = 1");

  const vehicleIdByPlate = new Map(vehicles.map((vehicle) => [vehicle.plate, vehicle.id!]));
  const internalPlateSet = new Set(vehicles.filter((vehicle) => vehicle.isInternal).map((vehicle) => vehicle.plate));
  for (const load of freightFixtures) {
    if (load.carrierKind === "internal_lloretrans" && load.tractorPlate) internalPlateSet.add(load.tractorPlate);
  }

  const tripsRows: (typeof schema.trips.$inferInsert)[] = [];
  const reconRows: (typeof schema.kmReconciliations.$inferInsert)[] = [];
  const tripVehicles = vehicles.filter((vehicle) => vehicle.isInternal && vehicle.active).slice(0, 80);
  for (let i = 0; i < Math.min(160, tripVehicles.length * 2); i++) {
    const vehicle = tripVehicles[i % tripVehicles.length]!;
    const startedAt = dt(i % 30, 7 + (i % 8), 10);
    const endedAt = new Date(startedAt.getTime() + 2 * 60 * 60 * 1000);
    const kmGps = 120 + (i % 240);
    const delta = i % 7 === 0 ? 6 : i % 13 === 0 ? 14 : 2;
    const tripId = id("trip", i);
    tripsRows.push({
      id: tripId,
      externalId: `AITI-TRIP-${i}`,
      vehicleId: vehicle.id!,
      driverId: drivers[i % drivers.length]?.id,
      clientId: clients[i % clients.length]?.id,
      origin: "Torres Vedras",
      destination: i % 5 === 0 ? "Madrid" : "Lisboa",
      startedAt,
      endedAt,
      kmDeclared: kmGps + delta,
      kmGps,
      notes: null,
      source: "logue_trans_demo",
    });
    reconRows.push({
      id: id("rec", i),
      tripId,
      kmDeclared: kmGps + delta,
      kmGps,
      deltaKm: delta,
      deltaPct: delta / kmGps,
      thresholdKm: 3,
      state: delta <= 3 ? "green" : delta <= 9 ? "yellow" : "red",
      proposedKm: delta > 3 ? kmGps : null,
      finalKm: null,
      decidedBy: null,
      decidedAt: null,
      decisionReason: null,
      createdAt: startedAt,
      updatedAt: startedAt,
    });
  }
  for (const c of chunk(tripsRows, 400)) await db.insert(schema.trips).values(c);
  for (const c of chunk(reconRows, 400)) await db.insert(schema.kmReconciliations).values(c);
  console.log(`✓ km demo: ${tripsRows.length} trips`);

  const invoiceRows: (typeof schema.invoices.$inferInsert)[] = [];
  const invoiceLineRows: (typeof schema.invoiceLines.$inferInsert)[] = [];
  const ocrRows: (typeof schema.ocrExtractions.$inferInsert)[] = [];
  const supplierRuleRows: (typeof schema.supplierRules.$inferInsert)[] = [];
  catalog.entries.forEach((entry, index) => {
    const invoiceId = id("inv", index);
    const supplierId = supplierIdByTax.get(entry.supplier.taxId)!;
    invoiceRows.push({
      id: invoiceId,
      supplierId,
      supplierNameRaw: entry.supplier.name,
      supplierTaxIdRaw: entry.supplier.taxId,
      invoiceNumber: entry.invoice.number,
      issuedAt: new Date(entry.invoice.issuedAt),
      dueAt: new Date(entry.invoice.dueAt),
      totalNet: entry.invoice.totalNet,
      totalVat: entry.invoice.totalVat,
      totalGross: entry.invoice.totalGross,
      currency: entry.invoice.currency,
      plate: entry.invoice.plate,
      vehicleId: entry.invoice.plate ? vehicleIdByPlate.get(entry.invoice.plate) ?? null : null,
      serviceCode: entry.classification.serviceCode,
      workCode: entry.classification.workCode,
      state: "pending_review",
      confidenceAvg: entry.classification.confidence,
      sourcePath: `/fixtures/real-invoices/${entry.fixtureFilename}`,
      sourceHash: `fixture:${entry.fixtureFilename}`,
      uploadedBy: "u_adm_of",
      createdAt: dt(15 - index),
      updatedAt: dt(15 - index),
    });
    entry.lines.forEach((line, lineIndex) => {
      invoiceLineRows.push({
        id: id(`il_${index}`, lineIndex),
        invoiceId,
        lineNumber: lineIndex + 1,
        description: line.description,
        quantity: line.quantity,
        unitPrice: line.unitPrice,
        vatRate: line.vatRate,
        total: line.total,
        serviceCode: line.serviceCode,
        confidence: 0.95,
      });
    });
    ocrRows.push({
      id: id("ocr", index),
      invoiceId,
      engine: "azure-doc-intel-stub",
      rawText: `[fixture] ${entry.sourceFilename} · ${entry.supplier.name}`,
      rawJson: JSON.stringify(entry),
      confidencePerField: JSON.stringify({ supplier: 0.97, total: 0.98, serviceCode: entry.classification.confidence }),
      createdAt: dt(15 - index),
    });
    supplierRuleRows.push({
      id: id("rule", index),
      supplierId,
      field: "service_code",
      value: entry.classification.serviceCode,
      matchPattern: null,
      learnedFromInvoiceId: invoiceId,
      hitCount: 4,
      createdAt: dt(30),
    });
  });
  for (const c of chunk(invoiceRows, 400)) await db.insert(schema.invoices).values(c);
  for (const c of chunk(invoiceLineRows, 400)) await db.insert(schema.invoiceLines).values(c);
  for (const c of chunk(ocrRows, 400)) await db.insert(schema.ocrExtractions).values(c);
  for (const c of chunk(supplierRuleRows, 400)) await db.insert(schema.supplierRules).values(c);
  console.log(`✓ invoices: ${invoiceRows.length} real OCR fixtures`);

  const docRows: (typeof schema.documents.$inferInsert)[] = [];
  const docPermRows: (typeof schema.documentPermissions.$inferInsert)[] = [];
  const docSamples = [
    { sourceFilename: "CMR.jpeg", kind: "cmr", direction: "saida" },
    { sourceFilename: "Guia Receção.jpeg", kind: "guia_recepcao", direction: "entrada" },
    { sourceFilename: "Guia Transporte.jpeg", kind: "guia_remessa", direction: "saida" },
    { sourceFilename: "Ticket Frio.jpeg", kind: "ticket_frio", direction: "saida" },
  ];
  docSamples.forEach((sample, index) => {
    const manifestFile = manifest.files.find((file) => file.relativePath === sample.sourceFilename);
    const documentId = id("doc", index);
    docRows.push({
      id: documentId,
      kind: sample.kind,
      direction: sample.direction,
      cmrNumber: sample.kind === "cmr" ? "CMR-DEMO" : null,
      plate: tripVehicles[index]?.plate ?? null,
      loadedAt: dt(index + 1),
      deliveredAt: dt(index),
      sourcePath: `/Users/bilal/Downloads/AITIPRO/${sample.sourceFilename}`,
      sourceHash: manifestFile?.sha256 ?? `doc-sample-${index}`,
      ocrText: `${sample.kind} · amostra real`,
      state: index === 1 ? "orphan" : "associated",
      uploadedBy: "u_dig",
      createdAt: dt(index + 1),
    });
    docPermRows.push({ id: id("dperm", index), documentId, companyId: "co_llt", canRead: true, canDownload: true });
  });
  await db.insert(schema.documents).values(docRows);
  await db.insert(schema.documentPermissions).values(docPermRows);
  console.log(`✓ documents: ${docRows.length} real samples`);

  const extraVehicles: (typeof schema.vehicles.$inferInsert)[] = [];
  function ensureFuelVehicle(plate: string | null, provider: string): string {
    const normalizedPlate = plate ?? `SEM-MAT-${provider.toUpperCase().slice(0, 6)}`;
    const existing = vehicleIdByPlate.get(normalizedPlate);
    if (existing) return existing;
    const vehicleId = id("veh_extra", extraVehicles.length);
    const vehicle = {
      id: vehicleId,
      plate: normalizedPlate,
      kind: plate ? "real_fuel_unmatched" : "sem_matricula_no_ficheiro",
      companyId: "co_llt",
      isInternal: Boolean(plate),
      frotcomId: null,
      hasCanbus: false,
      active: false,
      createdAt: dt(90),
    };
    extraVehicles.push(vehicle);
    vehicles.push(vehicle);
    vehicleIdByPlate.set(normalizedPlate, vehicleId);
    return vehicleId;
  }

  const fuelFillsRows: (typeof schema.fuelFills.$inferInsert)[] = [];
  const consumptionFuelRows = fuelFixtures.filter((row) => row.provider !== "frotcom_fee" && row.liters != null);
  for (const row of consumptionFuelRows) {
    const vehicleId = ensureFuelVehicle(row.plate, row.provider);
    const total = row.totalEur ?? 0;
    const liters = row.liters ?? 0;
    fuelFillsRows.push({
      id: id("fill", fuelFillsRows.length),
      vehicleId,
      driverId: null,
      source: row.provider,
      filledAt: parseDate(row.occurredAt) ?? dt(30),
      liters,
      pricePerLiter: liters > 0 ? Math.round((total / liters) * 1000) / 1000 : null,
      totalEur: row.totalEur,
      odometerKm: row.odometerKm,
      cardNumber: row.cardNumber,
      location: row.station,
      externalRef: `${row.provider}:${row.sourceFile}:${row.sourceRow}`,
      product: row.product,
      stationCountry: row.country,
      providerInvoiceNumber: row.invoiceNumber,
      sourceFile: row.sourceFile,
      sourceRow: row.sourceRow,
      driverNameRaw: row.driverRaw,
    });
  }
  if (extraVehicles.length > 0) {
    for (const c of chunk(extraVehicles, 400)) await db.insert(schema.vehicles).values(c);
  }
  for (const c of chunk(fuelFillsRows, 400)) await db.insert(schema.fuelFills).values(c);
  console.log(`✓ fuel: real provider transactions (${fuelFillsRows.length} fills, frotcom_fee excluded)`);

  const freightRows: (typeof schema.freightLoads.$inferInsert)[] = [];
  const freightTransitions: (typeof schema.freightStateTransitions.$inferInsert)[] = [];
  const supplierInvoiceRows: (typeof schema.supplierInvoicesFreight.$inferInsert)[] = [];
  const clientInvoiceRows: (typeof schema.clientInvoicesFreight.$inferInsert)[] = [];
  const commissionRows: (typeof schema.commissions.$inferInsert)[] = [];
  freightFixtures.forEach((load, index) => {
    const loadId = id("load", index);
    const priceBuy = load.paidTransporterEur ?? 0;
    const priceSell = load.priceClientEur ?? 0;
    const margin = load.marginEur ?? 0;
    const marginPct = priceBuy > 0 ? margin / priceBuy : 0;
    const state = load.paymentRegularization === "R" ? "paid" : "client_invoiced";
    const loadedAt = parseDate(load.date);
    const salespersonId = load.responsible?.toLowerCase().includes("miguel") ? "u_miguel" : "u_eder";
    freightRows.push({
      id: loadId,
      reference: `AITI-${load.sourceRow}`,
      salespersonId,
      clientId: clientIdByName.get(load.client)!,
      supplierId: load.carrierKind === "external_transporter" ? carrierIdByName.get(load.transporter) ?? null : null,
      carrierName: load.transporter,
      carrierKind: load.carrierKind,
      trailerPlate: load.trailerPlate,
      sourceRow: load.sourceRow,
      customerInvoiceNumber: load.customerInvoiceNumber,
      supplierInvoiceNumber: load.supplierInvoiceNumber,
      cmrNumber: load.cmrNumber,
      paymentRegularization: load.paymentRegularization,
      paymentMonth: load.paymentMonth,
      serviceValueEur: load.serviceValueEur,
      origin: load.origin,
      destination: load.destination,
      loadedAt,
      deliveredAt: null,
      plate: load.tractorPlate,
      priceBuy,
      priceSell,
      margin,
      marginPct,
      currency: "EUR",
      state,
      notes: load.observations,
      createdAt: loadedAt ?? dt(index % 90),
      updatedAt: loadedAt ?? dt(index % 90),
    });
    freightTransitions.push({
      id: id("ftrans", freightTransitions.length),
      loadId,
      fromState: "scheduled",
      toState: state,
      userId: salespersonId,
      reason: "Seed AITIPRO Excel",
      createdAt: loadedAt ?? dt(index % 90),
    });
    if (load.supplierInvoiceNumber) {
      supplierInvoiceRows.push({
        id: id("fsinv", supplierInvoiceRows.length),
        loadId,
        invoiceNumber: load.supplierInvoiceNumber,
        issuedAt: loadedAt ?? dt(index % 90),
        totalGross: Math.round(priceBuy * 1.23 * 100) / 100,
        deviation: 0,
        deviationPct: 0,
        state: "ok",
        reviewedBy: null,
        reviewedAt: null,
      });
    }
    if (load.customerInvoiceNumber) {
      const issuedAt = loadedAt ?? dt(index % 90);
      clientInvoiceRows.push({
        id: id("fcinv", clientInvoiceRows.length),
        loadId,
        invoiceNumber: load.customerInvoiceNumber,
        issuedAt,
        dueAt: new Date(issuedAt.getTime() + 60 * 86400000),
        totalGross: Math.round(priceSell * 1.23 * 100) / 100,
        paidAt: state === "paid" ? new Date(issuedAt.getTime() + 30 * 86400000) : null,
      });
    }
    const result = computeCommissionAmount(
      { margin, marginPct, plate: load.tractorPlate, origin: load.origin, destination: load.destination },
      commissionRule,
      internalPlateSet,
    );
    if (result.eligible) {
      commissionRows.push({
        id: id("comm", commissionRows.length),
        loadId,
        salespersonId,
        period: monthPeriod(load.date),
        amountEur: result.amountEur,
        ruleId: "cr_default",
        state: state === "paid" ? "paid" : "accrued",
        paidAt: state === "paid" ? dt(10) : null,
      });
    }
  });
  for (const c of chunk(freightRows, 400)) await db.insert(schema.freightLoads).values(c);
  for (const c of chunk(freightTransitions, 400)) await db.insert(schema.freightStateTransitions).values(c);
  for (const c of chunk(supplierInvoiceRows, 400)) await db.insert(schema.supplierInvoicesFreight).values(c);
  for (const c of chunk(clientInvoiceRows, 400)) await db.insert(schema.clientInvoicesFreight).values(c);
  for (const c of chunk(commissionRows, 400)) await db.insert(schema.commissions).values(c);
  console.log(`✓ freight: ${freightRows.length} cargas reais · ${commissionRows.length} comissões`);

  const workOrdersRows: (typeof schema.workOrders.$inferInsert)[] = [];
  const workOrderItemsRows: (typeof schema.workOrderItems.$inferInsert)[] = [];
  const workOrderChecklistRows: (typeof schema.workOrderChecklistAnswers.$inferInsert)[] = [];
  const workshopVehicles = vehicles.filter((vehicle) => vehicle.isInternal && vehicle.active).slice(0, 24);
  workshopVehicles.forEach((vehicle, index) => {
    const workOrderId = id("wo", index);
    const startedAt = dt(index % 30, 8 + (index % 6));
    workOrdersRows.push({
      id: workOrderId,
      reference: `FO-REAL/${(index + 1).toString().padStart(4, "0")}`,
      vehicleId: vehicle.id!,
      mechanicId: index % 2 === 0 ? "u_mec1" : "u_mec2",
      serviceCode: index % 3 === 0 ? "L1" : "L7",
      workCode: "INT-OFI-LLT",
      startedAt,
      endedAt: new Date(startedAt.getTime() + 90 * 60000),
      durationMinutes: 90,
      activeMinutes: 90,
      pausedMinutes: 0,
      summary: `Intervenção ${(index % 3 === 0 ? "L1" : "L7")} em ${vehicle.plate}`,
      state: index % 5 === 0 ? "draft" : "submitted",
      approvedBy: null,
      approvedAt: null,
      exportedAt: null,
      syncVersion: 1,
      createdAt: startedAt,
      updatedAt: startedAt,
    });
    workOrderItemsRows.push({
      id: id("woi", index),
      workOrderId,
      kind: "labour",
      description: "Mão-de-obra oficina",
      partCode: null,
      quantity: 1.5,
      unitPrice: 45,
      total: 67.5,
      sourceInvoiceId: null,
    });
    for (const key of ["travoes", "suspensao"]) {
      workOrderChecklistRows.push({
        id: id("woc", workOrderChecklistRows.length),
        workOrderId,
        itemKey: key,
        substituted: key === "travoes",
        verified: true,
        notes: null,
        createdAt: startedAt,
        updatedAt: startedAt,
      });
    }
  });
  await db.insert(schema.workOrders).values(workOrdersRows);
  await db.insert(schema.workOrderItems).values(workOrderItemsRows);
  await db.insert(schema.workOrderChecklistAnswers).values(workOrderChecklistRows);
  console.log(`✓ workshop: ${workOrdersRows.length} real-fleet work orders`);

  console.log("\n✓ Seed completo.");
  await sql.end();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
