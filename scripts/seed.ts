/**
 * Seed Postgres (Neon) completo para a plataforma Lloretrans × AiTiPro.
 * Determinista — run `npm run db:reset` dá sempre o mesmo dataset.
 *
 * Volumes alinhados com PRD 2026-04-19:
 * - 4 empresas grupo, ~60 viaturas, ~50 motoristas
 * - 30 dias de viagens (~15/dia viatura activa)
 * - 9 facturas reais + ~180 sintéticas em vários estados
 * - ~80 cargas bolsa/mês × 3 meses
 * - ~120 folhas oficina/mês × 3 meses
 * - Abastecimentos diários por viatura
 */
import fs from "node:fs";
import path from "node:path";
import { config } from "dotenv";
import postgres from "postgres";
import { drizzle } from "drizzle-orm/postgres-js";
import * as schema from "../db/schema";

config({ path: ".env.local" });

const DATABASE_URL = process.env.DATABASE_URL_DIRECT ?? process.env.DATABASE_URL;
if (!DATABASE_URL) throw new Error("DATABASE_URL not set");

let rngSeed = 42;
function rng(): number {
  rngSeed = (rngSeed * 1103515245 + 12345) % 2147483647;
  return rngSeed / 2147483647;
}
function rngInt(min: number, max: number): number {
  return Math.floor(rng() * (max - min + 1)) + min;
}
function rngPick<T>(arr: T[]): T {
  return arr[rngInt(0, arr.length - 1)]!;
}
function rngBool(prob: number): boolean {
  return rng() < prob;
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

const ALL_TABLES_IN_ORDER = [
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

async function main(): Promise<void> {
  const sql = postgres(DATABASE_URL!, { max: 1, prepare: false });
  const db = drizzle(sql, { schema });

  // Truncate all tables first
  for (const t of ALL_TABLES_IN_ORDER) {
    await sql.unsafe(`TRUNCATE TABLE "${t}" RESTART IDENTITY CASCADE;`).catch(() => {});
  }
  console.log("✓ Truncated tables");

  // ────────── COMPANIES ──────────
  const companies = [
    { id: "co_llt", slug: "lloretrans", name: "Lloretrans, Unipessoal Lda.", taxId: "500111222", group: "patricia-pilar" },
    { id: "co_fdo", slug: "frutas-oeste", name: "Frutas do Oeste, Lda.", taxId: "500333444", group: "patricia-pilar" },
    { id: "co_tdo", slug: "tomate-oeste", name: "Tomate do Oeste, S.A.", taxId: "500555666", group: "patricia-pilar" },
    { id: "co_cdn", slug: "cerejas-norte", name: "Cerejas do Norte, Lda.", taxId: "500777888", group: "patricia-pilar" },
  ];
  await db.insert(schema.companies).values(companies.map((c) => ({ ...c, createdAt: dt(90) })));
  console.log(`✓ ${companies.length} companies`);

  // ────────── USERS ──────────
  const users = [
    { id: "u_bilal", email: "bilal@aitipro.com", name: "Bilal Machraa", role: "admin", companyId: null },
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
    { id: "u_frutas", email: "patricia@frutasoeste.pt", name: "Patrícia Cardoso", role: "frutas", companyId: "co_fdo" },
  ];
  await db.insert(schema.users).values(users.map((u) => ({ ...u, active: true, createdAt: dt(60) })));
  console.log(`✓ ${users.length} users`);

  // ────────── SERVICE CODES ──────────
  // Fonte real: Tabela fornecida pelo Éder (2026-04-20).
  // Duas gamas distintas:
  //   S1–S9  → serviços prestados a viaturas de CLIENTES (Lloretrans factura-os)
  //   L1–L8  → serviços executados em viaturas INTERNAS Lloretrans (despesa interna)
  //   I0–I9  → operações internas adicionais (renting, tacógrafo, consumíveis, etc.)
  const serviceCodes = [
    // Serviços para veículos de CLIENTES externos
    { code: "S1", label: "Pneus", description: "Pneus, equilibragem, alinhamento (veículo cliente)", kind: "oficina_externa" },
    { code: "S2", label: "Eletricista", description: "Reparação eléctrica (veículo cliente)", kind: "oficina_externa" },
    { code: "S3", label: "Motores de Frio", description: "Compressores, gás, frio (veículo cliente)", kind: "oficina_externa" },
    { code: "S4", label: "Batechapa / Pintura / Fibra", description: "Chapa, pintura, fibra (veículo cliente)", kind: "oficina_externa" },
    { code: "S5", label: "Substituição de Vidros", description: "Vidros (veículo cliente)", kind: "oficina_externa" },
    { code: "S6", label: "Eletrónica e Programação", description: "Diagnóstico, ECU, programação (veículo cliente)", kind: "oficina_externa" },
    { code: "S7", label: "Retificação e Torneiras", description: "Rectificação mecânica (veículo cliente)", kind: "oficina_externa" },
    { code: "S8", label: "Mecânica Geral", description: "Motor, transmissão, travões (veículo cliente)", kind: "oficina_externa" },
    { code: "S9", label: "Inspeção", description: "Inspecção IPO (veículo cliente)", kind: "oficina_externa" },
    // Serviços para veículos INTERNOS Lloretrans (despesa)
    { code: "L1", label: "Serviços de Pneus", description: "Pneus em viatura interna", kind: "oficina_interna" },
    { code: "L2", label: "Serviços de Eletricista", description: "Eléctrica em viatura interna", kind: "oficina_interna" },
    { code: "L3", label: "Serviços de Motores de Frio e Termógrafo", description: "Frio + termógrafo interno", kind: "oficina_interna" },
    { code: "L4", label: "Serviços de Batechapa / Pintura / Fibra", description: "Chapa/pintura interna", kind: "oficina_interna" },
    { code: "L5", label: "Substituição de Vidros", description: "Vidros em viatura interna", kind: "oficina_interna" },
    { code: "L6", label: "Serviços de Retificação e Torneiras", description: "Rectificação mecânica interna", kind: "oficina_interna" },
    { code: "L7", label: "Serviços de Mecânica Geral", description: "Mecânica geral interna", kind: "oficina_interna" },
    { code: "L8", label: "Serviços de Eletrónica e Programação", description: "Electrónica/programação interna", kind: "oficina_interna" },
    // Operações Internas (renting, tacógrafo, consumíveis, etc.)
    { code: "I0", label: "Renting - Serviço de Gestão", description: "Gestão renting frota", kind: "operacao_interna" },
    { code: "I1", label: "Renting - Valor de Aluguer", description: "Aluguer mensal frota", kind: "operacao_interna" },
    { code: "I2", label: "Aferições Tacógrafo", description: "Calibrações e aferições tacógrafo", kind: "operacao_interna" },
    { code: "I3", label: "Outros Fluidos Interno", description: "AdBlue, líquidos, aditivos", kind: "operacao_interna" },
    { code: "I4", label: "Serviços de Manutenções Externas", description: "Manutenções subcontratadas", kind: "operacao_interna" },
    { code: "I5", label: "Serviços ISQ - ATP", description: "Certificação ISQ / ATP frio", kind: "operacao_interna" },
    { code: "I6", label: "Serviços Assistência em Viagem", description: "Socorro em rota", kind: "operacao_interna" },
    { code: "I7", label: "Serviços de Inspeções", description: "IPO frota interna", kind: "operacao_interna" },
    { code: "I8", label: "Consumíveis Veículos", description: "Ferramentas, consumíveis gerais", kind: "operacao_interna" },
    { code: "I9", label: "Serviços Específicos Ocasionais", description: "Catch-all fora da tabela", kind: "operacao_interna" },
    // Códigos fora de oficina (combustível, transporte) — não vêm da tabela Éder mas são usados pela bolsa/combustível
    { code: "C1", label: "Combustível", description: "Gasóleo, AdBlue, cartões frota", kind: "combustivel" },
    { code: "T1", label: "Transporte / Frete", description: "Viagens Lloretrans + bolsa de carga", kind: "transporte" },
  ];
  await db.insert(schema.serviceCodes).values(serviceCodes);
  console.log(`✓ ${serviceCodes.length} service codes (S1-S9 externos · L1-L8 + I0-I9 internos · C1/T1 operacional)`);

  // ────────── WORK CODES ──────────
  // Work codes mapeiam "qual empresa/obra é imputada a despesa".
  // Separado das serviceCodes (serviceCode = tipo serviço · workCode = obra/empresa).
  const workCodes = [
    { code: "INT-OFI-LLT", label: "Oficina interna · Lloretrans", scope: "internal", companyId: "co_llt" },
    { code: "INT-COMB-LLT", label: "Combustível · Lloretrans", scope: "internal", companyId: "co_llt" },
    { code: "INT-ADM-LLT", label: "Administração · Lloretrans", scope: "internal", companyId: "co_llt" },
    { code: "EXT-CLIENTE", label: "Externo · Cliente oficina terceiro", scope: "external", companyId: null },
    { code: "EXT-GP-FDO", label: "Grupo · Frutas do Oeste", scope: "external", companyId: "co_fdo" },
    { code: "EXT-GP-TDO", label: "Grupo · Tomate do Oeste", scope: "external", companyId: "co_tdo" },
    { code: "EXT-GP-CDN", label: "Grupo · Cerejas do Norte", scope: "external", companyId: "co_cdn" },
  ];
  await db.insert(schema.workCodes).values(workCodes);
  console.log(`✓ ${workCodes.length} work codes`);

  // ────────── VEHICLES ──────────
  const VEHICLE_KINDS = ["pesado_mercadorias", "pesado_frigorifico", "semi_reboque", "ligeiro_comercial"];
  const vehicles: (typeof schema.vehicles.$inferInsert)[] = [];
  const plates: string[] = [];
  for (let i = 0; i < 60; i++) {
    const letters1 = String.fromCharCode(65 + rngInt(0, 25)) + String.fromCharCode(65 + rngInt(0, 25));
    const nums = rngInt(10, 99);
    const letters2 = String.fromCharCode(65 + rngInt(0, 25)) + String.fromCharCode(65 + rngInt(0, 25));
    const plate = `${letters1}-${nums.toString().padStart(2, "0")}-${letters2}`;
    plates.push(plate);
    const companyId = i < 45 ? "co_llt" : rngPick(["co_fdo", "co_tdo", "co_cdn"]);
    vehicles.push({
      id: id("veh", i),
      plate,
      kind: rngPick(VEHICLE_KINDS),
      companyId,
      isInternal: companyId === "co_llt",
      frotcomId: `frt_${plate.replace(/-/g, "")}`,
      hasCanbus: rngBool(0.85),
      active: true,
      createdAt: dt(90),
    });
  }
  await db.insert(schema.vehicles).values(vehicles);
  console.log(`✓ ${vehicles.length} vehicles`);

  // ────────── DRIVERS ──────────
  const firstNames = ["António", "João", "Manuel", "José", "Carlos", "Pedro", "Miguel", "Rui", "Nuno", "Paulo"];
  const lastNames = ["Silva", "Santos", "Oliveira", "Rodrigues", "Marques", "Pereira", "Costa", "Ferreira", "Martins", "Fernandes"];
  const drivers: (typeof schema.drivers.$inferInsert)[] = [];
  for (let i = 0; i < 50; i++) {
    drivers.push({
      id: id("drv", i),
      name: `${rngPick(firstNames)} ${rngPick(lastNames)}`,
      employeeCode: `EMP${(1000 + i).toString()}`,
      companyId: "co_llt",
      logueTransId: `lt_drv_${i}`,
      active: true,
    });
  }
  await db.insert(schema.drivers).values(drivers);
  console.log(`✓ ${drivers.length} drivers`);

  // ────────── CLIENTS ──────────
  const clientData = [
    { id: "cli_01", name: "Sonae MC Distribuição", country: "PT", phcId: "PHC001", paymentTermsDays: 60 },
    { id: "cli_02", name: "Grupo Jerónimo Martins", country: "PT", phcId: "PHC002", paymentTermsDays: 60 },
    { id: "cli_03", name: "Lidl Portugal", country: "PT", phcId: "PHC003", paymentTermsDays: 60 },
    { id: "cli_04", name: "Mercadona España", country: "ES", phcId: "PHC004", paymentTermsDays: 75 },
    { id: "cli_05", name: "Carrefour France", country: "FR", phcId: "PHC005", paymentTermsDays: 90 },
    { id: "cli_06", name: "Auchan Polska", country: "PL", phcId: "PHC006", paymentTermsDays: 120 },
    { id: "cli_07", name: "Makro Cash & Carry", country: "PT", phcId: "PHC007", paymentTermsDays: 60 },
    { id: "cli_08", name: "Pingo Doce", country: "PT", phcId: "PHC008", paymentTermsDays: 60 },
  ];
  await db.insert(schema.clients).values(clientData.map((c) => ({ ...c, taxId: null, createdAt: dt(180) })));
  console.log(`✓ ${clientData.length} clients`);

  // ────────── SUPPLIERS (inclui os 9 reais + 4 comuns) ──────────
  const catalogPath = path.join(process.cwd(), "fixtures", "extracted", "_catalog.json");
  const catalog = JSON.parse(fs.readFileSync(catalogPath, "utf-8")) as {
    entries: Array<{
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
      classification: { serviceCode: string; workCode: string; confidence: number; note?: string };
      lines: Array<{ description: string; quantity: number; unitPrice: number; vatRate: number; total: number; serviceCode: string }>;
    }>;
  };

  const supplierMap = new Map<string, string>();
  const supplierRows: (typeof schema.suppliers.$inferInsert)[] = [];
  catalog.entries.forEach((e, i) => {
    const sid = id("sup", i);
    supplierMap.set(e.supplier.taxId, sid);
    supplierRows.push({
      id: sid,
      taxId: e.supplier.taxId,
      name: e.supplier.name,
      category: e.supplier.category,
      defaultServiceCode: e.classification.serviceCode,
      defaultWorkCode: e.classification.workCode,
      contactEmail: `geral@${e.supplier.name.split(" ")[0].toLowerCase()}.pt`,
      createdAt: dt(120),
    });
  });
  await db.insert(schema.suppliers).values(supplierRows);
  console.log(`✓ ${supplierRows.length} suppliers (incluindo 9 reais)`);

  // ────────── FEATURE FLAGS ──────────
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
    { key: "demo.seed_button", enabled: true, description: "Botão resetar demo" },
  ]);
  console.log(`✓ feature flags`);

  // ────────── COMMISSION RULES ──────────
  // Regras reais confirmadas por Éder (email 2026-04-20):
  //   • 20% do lucro total (preçoVenda − preçoCompra)
  //   • +€2,50 por carga NACIONAL feita com carro Lloretrans
  //   • +€5,00 por carga INTERNACIONAL feita com carro Lloretrans
  // Bónus fixos só aplicam se viatura usada for interna (`requireInternalVehicle = true`).
  await db.insert(schema.commissionRules).values([
    {
      id: "cr_default",
      salespersonId: null,
      percentOfMargin: 0.20,
      minMarginPct: 0,
      fixedBonusNationalEur: 2.5,
      fixedBonusInternationalEur: 5.0,
      requireInternalVehicle: true,
      activeFrom: dt(365),
      activeTo: null,
    },
  ]);

  // ────────── TRIPS (30 dias) ──────────
  const internalPlates = vehicles.filter((v) => v.isInternal).map((v) => v.plate);
  const tripsRows: (typeof schema.trips.$inferInsert)[] = [];
  const reconRows: (typeof schema.kmReconciliations.$inferInsert)[] = [];
  // Éder (email 2026-04-20): "No máximo 3 km de margem de erro".
  // Acima disto é amarelo (revisão); acima de 3× threshold é vermelho.
  const THRESHOLD_KM = 3;
  const THRESHOLD_KM_RED = THRESHOLD_KM * 3;
  const ORIGINS = ["Alverca", "Lisboa", "Porto", "Torres Vedras", "Leiria", "Setúbal"];
  const DESTINATIONS = ["Madrid", "Valencia", "Sevilla", "Coimbra", "Braga", "Faro", "Barcelona", "Paris"];

  for (let d = 0; d < 30; d++) {
    const dailyPlates = internalPlates.filter(() => rngBool(0.85));
    dailyPlates.forEach((plate, idx) => {
      const tripsToday = rngInt(1, 3);
      for (let t = 0; t < tripsToday; t++) {
        const startHour = 6 + t * 5 + rngInt(0, 2);
        const startedAt = dt(d, startHour, rngInt(0, 59));
        const duration = rngInt(60, 300);
        const endedAt = new Date(startedAt.getTime() + duration * 60 * 1000);
        const kmGps = rngInt(40, 450);
        let deltaKm = 0;
        const noise = rng();
        if (noise < 0.7) deltaKm = rngInt(-2, 2);
        else if (noise < 0.9) deltaKm = rngInt(4, 9) * (rngBool(0.5) ? 1 : -1);
        else deltaKm = rngInt(10, 40) * (rngBool(0.5) ? 1 : -1);
        const kmDeclared = Math.max(10, kmGps + deltaKm);
        const gpsHasGap = rngBool(0.03);
        const driverMissed = rngBool(0.02);

        const vid = vehicles.find((v) => v.plate === plate)!.id!;
        const tripId = id("trip", tripsRows.length);
        const externalId = `LT-${d}-${idx}-${t}`;

        tripsRows.push({
          id: tripId,
          externalId,
          vehicleId: vid,
          driverId: drivers[rngInt(0, drivers.length - 1)].id!,
          clientId: rngPick(clientData).id,
          origin: rngPick(ORIGINS),
          destination: rngPick(DESTINATIONS),
          startedAt,
          endedAt,
          kmDeclared: driverMissed ? null : kmDeclared,
          kmGps: gpsHasGap ? null : kmGps,
          notes: gpsHasGap ? "GPS perdeu sinal em zona rural" : driverMissed ? "Motorista não lançou na app" : null,
          source: "logue_trans",
        });

        const absDelta = Math.abs(deltaKm);
        const state =
          gpsHasGap || driverMissed
            ? "red"
            : absDelta <= THRESHOLD_KM
              ? "green"
              : absDelta <= THRESHOLD_KM_RED
                ? "yellow"
                : "red";

        reconRows.push({
          id: id("rec", reconRows.length),
          tripId,
          kmDeclared: driverMissed ? null : kmDeclared,
          kmGps: gpsHasGap ? null : kmGps,
          deltaKm: gpsHasGap || driverMissed ? null : deltaKm,
          deltaPct: gpsHasGap || driverMissed ? null : deltaKm / kmGps,
          thresholdKm: THRESHOLD_KM,
          state,
          proposedKm: state === "yellow" ? kmGps : null,
          finalKm: null,
          decidedBy: null,
          decidedAt: null,
          decisionReason: null,
          createdAt: startedAt,
          updatedAt: startedAt,
        });
      }
    });
  }
  const chunk = <T,>(arr: T[], n: number): T[][] => {
    const out: T[][] = [];
    for (let i = 0; i < arr.length; i += n) out.push(arr.slice(i, i + n));
    return out;
  };
  for (const c of chunk(tripsRows, 500)) await db.insert(schema.trips).values(c);
  for (const c of chunk(reconRows, 500)) await db.insert(schema.kmReconciliations).values(c);
  console.log(`✓ ${tripsRows.length} trips + reconciliations`);

  // ────────── INVOICES ──────────
  const invoiceRows: (typeof schema.invoices.$inferInsert)[] = [];
  const invoiceLineRows: (typeof schema.invoiceLines.$inferInsert)[] = [];
  const ocrRows: (typeof schema.ocrExtractions.$inferInsert)[] = [];
  const supplierRuleRows: (typeof schema.supplierRules.$inferInsert)[] = [];

  catalog.entries.forEach((e, i) => {
    const invId = id("inv", i);
    const plateId = e.invoice.plate ? vehicles.find((v) => v.plate === e.invoice.plate)?.id ?? null : null;
    const supplierId = supplierMap.get(e.supplier.taxId)!;

    invoiceRows.push({
      id: invId,
      supplierId,
      supplierNameRaw: e.supplier.name,
      supplierTaxIdRaw: e.supplier.taxId,
      invoiceNumber: e.invoice.number,
      issuedAt: new Date(e.invoice.issuedAt),
      dueAt: new Date(e.invoice.dueAt),
      totalNet: e.invoice.totalNet,
      totalVat: e.invoice.totalVat,
      totalGross: e.invoice.totalGross,
      currency: e.invoice.currency,
      plate: e.invoice.plate,
      vehicleId: plateId,
      serviceCode: e.classification.serviceCode,
      workCode: e.classification.workCode,
      state: "pending_review",
      confidenceAvg: e.classification.confidence,
      sourcePath: `/fixtures/real-invoices/${e.filename}`,
      sourceHash: `real_${i}_${e.invoice.number}`,
      uploadedBy: "u_adm_of",
      createdAt: dt(15 - i),
      updatedAt: dt(15 - i),
    });

    e.lines.forEach((l, ln) => {
      invoiceLineRows.push({
        id: id(`il_real_${i}`, ln),
        invoiceId: invId,
        lineNumber: ln + 1,
        description: l.description,
        quantity: l.quantity,
        unitPrice: l.unitPrice,
        vatRate: l.vatRate,
        total: l.total,
        serviceCode: l.serviceCode,
        confidence: 0.9 + rng() * 0.09,
      });
    });

    ocrRows.push({
      id: id(`ocr_real_${i}`, 0),
      invoiceId: invId,
      engine: "azure-doc-intel-stub",
      rawText: `[scan · fixture catalog] ${e.supplier.name} · ${e.invoice.number}`,
      rawJson: JSON.stringify(e),
      confidencePerField: JSON.stringify({
        supplier: 0.97,
        invoiceNumber: 0.92,
        total: 0.98,
        plate: e.invoice.plate ? 0.85 : 0,
        serviceCode: e.classification.confidence,
      }),
      createdAt: dt(15 - i),
    });

    supplierRuleRows.push({
      id: id(`rule_${i}`, 0),
      supplierId,
      field: "service_code",
      value: e.classification.serviceCode,
      matchPattern: null,
      learnedFromInvoiceId: invId,
      hitCount: rngInt(2, 8),
      createdAt: dt(30),
    });
  });

  for (let m = 0; m < 3; m++) {
    for (let i = 0; i < 60; i++) {
      const entry = rngPick(catalog.entries);
      const sid = supplierMap.get(entry.supplier.taxId)!;
      const invId = id("inv", catalog.entries.length + m * 60 + i);
      const issued = dt(30 * m + i);
      const stateRoll = rng();
      let state: string;
      let approvedBy: string | null = null;
      let approvedAt: Date | null = null;
      let exportedAt: Date | null = null;
      if (stateRoll < 0.6) {
        state = "approved";
        approvedBy = "u_adm_of";
        approvedAt = new Date(issued.getTime() + 2 * 86400000);
        exportedAt = new Date(issued.getTime() + 3 * 86400000);
      } else if (stateRoll < 0.85) {
        state = "pending_review";
      } else {
        state = "pending_ocr";
      }
      const totalNet = 150 + rng() * 4000;
      const totalVat = totalNet * 0.23;
      const plate = rngBool(0.7) ? rngPick(internalPlates) : null;

      invoiceRows.push({
        id: invId,
        supplierId: sid,
        supplierNameRaw: entry.supplier.name,
        supplierTaxIdRaw: entry.supplier.taxId,
        invoiceNumber: `FT ${2026 - m}/SYN/${i.toString().padStart(4, "0")}`,
        issuedAt: issued,
        dueAt: new Date(issued.getTime() + 60 * 86400000),
        totalNet: Math.round(totalNet * 100) / 100,
        totalVat: Math.round(totalVat * 100) / 100,
        totalGross: Math.round((totalNet + totalVat) * 100) / 100,
        currency: "EUR",
        plate,
        vehicleId: plate ? vehicles.find((v) => v.plate === plate)?.id ?? null : null,
        serviceCode: state !== "pending_ocr" ? entry.classification.serviceCode : null,
        workCode: state !== "pending_ocr" ? entry.classification.workCode : null,
        state,
        confidenceAvg: state !== "pending_ocr" ? 0.7 + rng() * 0.25 : null,
        sourcePath: `/synthetic/${invId}.pdf`,
        sourceHash: `syn_${m}_${i}`,
        uploadedBy: "u_adm_of",
        approvedBy,
        approvedAt,
        exportedAt,
        createdAt: issued,
        updatedAt: approvedAt ?? issued,
      });
    }
  }

  for (const c of chunk(invoiceRows, 400)) await db.insert(schema.invoices).values(c);
  for (const c of chunk(invoiceLineRows, 400)) await db.insert(schema.invoiceLines).values(c);
  for (const c of chunk(ocrRows, 400)) await db.insert(schema.ocrExtractions).values(c);
  for (const c of chunk(supplierRuleRows, 400)) await db.insert(schema.supplierRules).values(c);
  console.log(`✓ ${invoiceRows.length} invoices (9 reais + ${invoiceRows.length - 9} sintéticas)`);

  // ────────── DOCUMENTS (MVP C) ──────────
  const docRows: (typeof schema.documents.$inferInsert)[] = [];
  const docAssocRows: (typeof schema.documentAssociations.$inferInsert)[] = [];
  const docPermRows: (typeof schema.documentPermissions.$inferInsert)[] = [];
  const docKinds = ["cmr", "guia_remessa", "guia_recepcao", "ticket_frio", "controlo_tara"];

  tripsRows.slice(0, 400).forEach((t, i) => {
    const kinds = docKinds.slice(0, rngInt(2, 4));
    kinds.forEach((k, ki) => {
      const docId = id("doc", docRows.length);
      const isOrphan = rngBool(0.08);
      const cmrNumber = k === "cmr" ? `CMR-${2026}-${(10000 + i).toString()}` : null;
      docRows.push({
        id: docId,
        kind: k,
        cmrNumber,
        plate: vehicles.find((v) => v.id === t.vehicleId)?.plate,
        loadedAt: t.startedAt,
        deliveredAt: t.endedAt,
        sourcePath: `/uploads/doc_${docId}.pdf`,
        sourceHash: `hash_${docId}`,
        ocrText: `${k} para viagem ${t.externalId}`,
        state: isOrphan ? "orphan" : "associated",
        uploadedBy: "u_dig",
        createdAt: t.startedAt,
      });

      if (!isOrphan) {
        docAssocRows.push({
          id: id("assoc", docAssocRows.length),
          documentId: docId,
          tripId: t.id!,
          confidence: k === "cmr" ? 0.99 : 0.85 + rng() * 0.1,
          method: k === "cmr" ? "cmr_exact" : "plate_date_match",
          confirmedBy: null,
          confirmedAt: null,
          createdAt: t.startedAt,
        });
      }

      docPermRows.push({
        id: id("dperm", docPermRows.length),
        documentId: docId,
        companyId: "co_llt",
        canRead: true,
        canDownload: true,
      });
      if (rngBool(0.3)) {
        docPermRows.push({
          id: id("dperm", docPermRows.length),
          documentId: docId,
          companyId: "co_fdo",
          canRead: true,
          canDownload: true,
        });
      }
    });
  });
  for (const c of chunk(docRows, 400)) await db.insert(schema.documents).values(c);
  for (const c of chunk(docAssocRows, 400)) await db.insert(schema.documentAssociations).values(c);
  for (const c of chunk(docPermRows, 400)) await db.insert(schema.documentPermissions).values(c);
  console.log(`✓ ${docRows.length} documents (${docRows.filter((d) => d.state === "orphan").length} órfãos)`);

  // ────────── FUEL (MVP D) ──────────
  const fuelCanbusRows: (typeof schema.fuelReadingsCanbus.$inferInsert)[] = [];
  const fuelFillsRows: (typeof schema.fuelFills.$inferInsert)[] = [];
  const fuelAnomRows: (typeof schema.fuelAnomalies.$inferInsert)[] = [];

  vehicles.filter((v) => v.hasCanbus).forEach((v, vi) => {
    let km = rngInt(100000, 350000);
    const baselineLper100 = 28 + rng() * 10;
    for (let d = 0; d < 60; d++) {
      const readAt = dt(d, 8);
      const dayKm = rngInt(100, 400);
      km += dayKm;
      const expectedL = (dayKm * baselineLper100) / 100;
      const isAnomaly = d > 20 && rngBool(0.04);
      const actualL = expectedL * (isAnomaly ? 1.25 + rng() * 0.2 : 0.95 + rng() * 0.1);
      fuelCanbusRows.push({
        id: id("canb", fuelCanbusRows.length),
        vehicleId: v.id!,
        readAt,
        odometerKm: km,
        tankLevelPct: 30 + rng() * 60,
        litersConsumed: actualL,
      });
      if (isAnomaly) {
        fuelAnomRows.push({
          id: id("anom", fuelAnomRows.length),
          vehicleId: v.id!,
          kind: "consumption_spike",
          severity: actualL > expectedL * 1.3 ? "high" : "medium",
          detectedAt: readAt,
          windowFrom: dt(d + 1, 0),
          windowTo: readAt,
          expected: expectedL,
          actual: actualL,
          deviationPct: (actualL - expectedL) / expectedL,
          notes: "Consumo acima do baseline da viatura",
          state: rngBool(0.3) ? "resolved" : "open",
          resolvedBy: null,
          resolvedAt: null,
        });
      }
      if (rngBool(0.4)) {
        const providers = ["sepsa", "repsol", "anamor", "bomba_interna"];
        const provider = rngPick(providers);
        const liters = 80 + rng() * 320;
        const ppl = 1.25 + rng() * 0.15;
        fuelFillsRows.push({
          id: id("fill", fuelFillsRows.length),
          vehicleId: v.id!,
          driverId: drivers[rngInt(0, drivers.length - 1)].id!,
          source: provider,
          filledAt: new Date(readAt.getTime() + rngInt(0, 7200) * 1000),
          liters,
          pricePerLiter: ppl,
          totalEur: liters * ppl,
          odometerKm: km,
          cardNumber: `${provider.toUpperCase()}-${(1000 + vi).toString()}`,
          location: rngPick(["A1 Alverca", "A6 Estremoz", "A8 Torres Vedras", "A2 Grândola", "Bomba Lloretrans"]),
          externalRef: `ref_${d}_${vi}_${provider}`,
        });
      }
    }
  });
  for (const c of chunk(fuelCanbusRows, 400)) await db.insert(schema.fuelReadingsCanbus).values(c);
  for (const c of chunk(fuelFillsRows, 400)) await db.insert(schema.fuelFills).values(c);
  for (const c of chunk(fuelAnomRows, 400)) await db.insert(schema.fuelAnomalies).values(c);
  console.log(`✓ fuel: ${fuelCanbusRows.length} canbus · ${fuelFillsRows.length} fills · ${fuelAnomRows.length} anomalias`);

  // ────────── FREIGHT (MVP E) ──────────
  const freightLoads: (typeof schema.freightLoads.$inferInsert)[] = [];
  const freightTrans: (typeof schema.freightStateTransitions.$inferInsert)[] = [];
  const freightSupInv: (typeof schema.supplierInvoicesFreight.$inferInsert)[] = [];
  const freightCliInv: (typeof schema.clientInvoicesFreight.$inferInsert)[] = [];
  const commissionsRows: (typeof schema.commissions.$inferInsert)[] = [];
  const STATES = ["scheduled", "delivered", "supplier_invoiced", "client_invoiced", "paid"];
  // ISO-ish classification para decidir bónus nacional vs internacional.
  const NATIONAL_CITIES = new Set(["Lisboa", "Porto", "Braga", "Coimbra", "Faro", "Setúbal", "Torres Vedras", "Alverca", "Leiria", "Aveiro"]);
  const classifyDestination = (dest: string): "national" | "international" =>
    NATIONAL_CITIES.has(dest) ? "national" : "international";

  for (let m = 0; m < 3; m++) {
    for (let i = 0; i < 80; i++) {
      const salesperson = rngPick(["u_eder", "u_miguel"]);
      const stateIdx = Math.min(STATES.length - 1, Math.max(0, STATES.length - 1 - rngInt(0, m * 2)));
      const state = STATES[stateIdx]!;
      const priceBuy = 800 + rng() * 2500;
      const marginPct = 0.05 + rng() * 0.25;
      const priceSell = Math.round(priceBuy * (1 + marginPct) * 100) / 100;
      const margin = Math.round((priceSell - priceBuy) * 100) / 100;
      const loadId = id("load", freightLoads.length);
      const reference = `CGA-${2026 - m}/${(i + 1).toString().padStart(4, "0")}`;
      const loadedAt = stateIdx >= 1 ? dt(m * 30 + i, 8) : null;
      const deliveredAt = stateIdx >= 1 ? new Date((loadedAt?.getTime() ?? 0) + 2 * 86400000) : null;

      freightLoads.push({
        id: loadId,
        reference,
        salespersonId: salesperson,
        clientId: rngPick(clientData).id,
        supplierId: rngPick(supplierRows).id!,
        origin: rngPick(["Lisboa", "Porto", "Madrid", "Barcelona", "Paris"]),
        destination: rngPick(["Valencia", "Lyon", "Warsaw", "Amsterdam", "Rome"]),
        loadedAt,
        deliveredAt,
        plate: rngBool(0.4) ? rngPick(internalPlates) : null,
        priceBuy: Math.round(priceBuy * 100) / 100,
        priceSell,
        margin,
        marginPct,
        currency: "EUR",
        state,
        notes: null,
        createdAt: dt(m * 30 + i, 6),
        updatedAt: dt(m * 30 + i, 6),
      });

      STATES.slice(1, stateIdx + 1).forEach((to, ti) => {
        freightTrans.push({
          id: id("ftrans", freightTrans.length),
          loadId,
          fromState: STATES[ti]!,
          toState: to,
          userId: salesperson,
          reason: null,
          createdAt: dt(m * 30 + i, 8 + ti),
        });
      });

      if (stateIdx >= 2) {
        const supActual = priceBuy * (rngBool(0.8) ? 1 : 1 + (rng() - 0.5) * 0.1);
        const deviation = Math.round((supActual - priceBuy) * 100) / 100;
        freightSupInv.push({
          id: id("fsinv", freightSupInv.length),
          loadId,
          invoiceNumber: `SUP-${loadId}`,
          issuedAt: dt(m * 30 + i + 10, 14),
          totalGross: Math.round(supActual * 1.23 * 100) / 100,
          deviation,
          deviationPct: deviation / priceBuy,
          state: Math.abs(deviation) > 20 ? "deviation_detected" : "ok",
          reviewedBy: null,
          reviewedAt: null,
        });
      }
      if (stateIdx >= 3) {
        const dueAt = dt(m * 30 + i + 12, 0);
        freightCliInv.push({
          id: id("fcinv", freightCliInv.length),
          loadId,
          invoiceNumber: `CLI-${loadId}`,
          issuedAt: dt(m * 30 + i + 12, 16),
          dueAt,
          totalGross: Math.round(priceSell * 1.23 * 100) / 100,
          paidAt: stateIdx >= 4 ? dt(m * 30 + i + 50, 10) : null,
        });

        // Regra única (Éder): 20% do lucro + bónus fixos se viatura for Lloretrans
        const usedInternalPlate = freightLoads[freightLoads.length - 1]!.plate !== null;
        const destinationScope = classifyDestination(freightLoads[freightLoads.length - 1]!.destination);
        const percentShare = Math.round(margin * 0.2 * 100) / 100;
        const fixedBonus = usedInternalPlate
          ? destinationScope === "international"
            ? 5.0
            : 2.5
          : 0;
        commissionsRows.push({
          id: id("comm", commissionsRows.length),
          loadId,
          salespersonId: salesperson,
          period: `${2026 - m}-${((new Date().getMonth() + 1) % 12 + 1).toString().padStart(2, "0")}`,
          amountEur: Math.round((percentShare + fixedBonus) * 100) / 100,
          ruleId: "cr_default",
          state: stateIdx >= 4 ? "paid" : "accrued",
          paidAt: stateIdx >= 4 ? dt(m * 30 + i + 60, 9) : null,
        });
      }
    }
  }
  for (const c of chunk(freightLoads, 400)) await db.insert(schema.freightLoads).values(c);
  for (const c of chunk(freightTrans, 400)) await db.insert(schema.freightStateTransitions).values(c);
  for (const c of chunk(freightSupInv, 400)) await db.insert(schema.supplierInvoicesFreight).values(c);
  for (const c of chunk(freightCliInv, 400)) await db.insert(schema.clientInvoicesFreight).values(c);
  for (const c of chunk(commissionsRows, 400)) await db.insert(schema.commissions).values(c);
  console.log(`✓ freight: ${freightLoads.length} cargas · ${commissionsRows.length} comissões`);

  // ────────── WORKSHOP (MVP F) ──────────
  const workOrdersRows: (typeof schema.workOrders.$inferInsert)[] = [];
  const workOrderItems: (typeof schema.workOrderItems.$inferInsert)[] = [];
  const workOrderPhotos: (typeof schema.workOrderPhotos.$inferInsert)[] = [];
  const workOrderSignatures: (typeof schema.workOrderSignatures.$inferInsert)[] = [];
  const MECHANICS = ["u_mec1", "u_mec2"];

  for (let m = 0; m < 3; m++) {
    for (let i = 0; i < 120; i++) {
      const vehicle = rngPick(vehicles.filter((v) => v.isInternal));
      const mechanic = rngPick(MECHANICS);
      const serviceCode = rngPick(["S1", "S2", "S3", "S17"]);
      const startedAt = dt(m * 30 + i, 8 + rngInt(0, 8), rngInt(0, 59));
      const duration = rngInt(30, 240);
      const endedAt = new Date(startedAt.getTime() + duration * 60000);
      const state = rngPick(["approved", "submitted", "draft"]);
      const woId = id("wo", workOrdersRows.length);

      workOrdersRows.push({
        id: woId,
        reference: `FO-${2026 - m}/${(i + 1).toString().padStart(4, "0")}`,
        vehicleId: vehicle.id!,
        mechanicId: mechanic,
        serviceCode,
        workCode: "INT-OFI-LLT",
        startedAt,
        endedAt,
        durationMinutes: duration,
        summary: `Intervenção ${serviceCode} em ${vehicle.plate}`,
        state,
        approvedBy: state === "approved" ? "u_adm_of" : null,
        approvedAt: state === "approved" ? new Date(endedAt.getTime() + 86400000) : null,
        exportedAt: state === "approved" ? new Date(endedAt.getTime() + 2 * 86400000) : null,
        syncVersion: 1,
        createdAt: startedAt,
        updatedAt: endedAt,
      });

      const itemCount = rngInt(1, 5);
      for (let it = 0; it < itemCount; it++) {
        const isPart = rngBool(0.5);
        workOrderItems.push({
          id: id(`woi_${m}_${i}`, it),
          workOrderId: woId,
          kind: isPart ? "part" : "labour",
          description: isPart ? `Peça ${rngPick(["filtro óleo", "pastilha travão", "óleo motor", "pneu"])}` : "Mão-de-obra",
          partCode: isPart ? `PT-${rngInt(1000, 9999)}` : null,
          quantity: isPart ? rngInt(1, 4) : duration / 60,
          unitPrice: isPart ? 25 + rng() * 200 : 45,
          total: 0,
        });
      }

      if (state !== "draft" && rngBool(0.7)) {
        ["before", "after"].forEach((stage, si) => {
          workOrderPhotos.push({
            id: id(`wop_${m}_${i}`, si),
            workOrderId: woId,
            stage,
            path: `/uploads/wo/${woId}_${stage}.jpg`,
            capturedAt: new Date(startedAt.getTime() + si * duration * 60000),
          });
        });
        workOrderSignatures.push({
          id: id(`wos_${m}_${i}`, 0),
          workOrderId: woId,
          signerRole: "mechanic",
          signerName: users.find((u) => u.id === mechanic)!.name,
          svgPath: `M 10 50 Q 50 20 100 50 T 200 50`,
          signedAt: endedAt,
        });
      }
    }
  }
  for (const c of chunk(workOrdersRows, 400)) await db.insert(schema.workOrders).values(c);
  for (const c of chunk(workOrderItems, 400)) await db.insert(schema.workOrderItems).values(c);
  for (const c of chunk(workOrderPhotos, 400)) await db.insert(schema.workOrderPhotos).values(c);
  for (const c of chunk(workOrderSignatures, 400)) await db.insert(schema.workOrderSignatures).values(c);
  console.log(`✓ workshop: ${workOrdersRows.length} folhas · ${workOrderItems.length} items · ${workOrderPhotos.length} fotos`);

  console.log(`\n✓ Seed completo.`);
  await sql.end();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
