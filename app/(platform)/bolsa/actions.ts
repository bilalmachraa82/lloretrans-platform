"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { and, eq, gte, lte } from "drizzle-orm";
import { db } from "@/db/client";
import {
  freightLoads,
  freightStateTransitions,
  supplierInvoicesFreight,
  clientInvoicesFreight,
  commissions,
  commissionRules,
  vehicles,
  suppliers,
} from "@/db/schema";
import { requireRole } from "@/lib/auth/session";
import { audit } from "@/lib/audit";
import { randomId } from "@/lib/utils";
import { canTransition, type FreightState } from "@/lib/freight-state";
import { computeCommissionAmount } from "@/lib/commission-rule";

export async function createLoad(formData: FormData): Promise<void> {
  const session = await requireRole(["admin", "clarice", "comercial"]);

  const clientId = formData.get("clientId")?.toString();
  const supplierId = formData.get("supplierId")?.toString();
  const carrierNameInput = formData.get("carrierName")?.toString().trim() || null;
  const origin = formData.get("origin")?.toString();
  const destination = formData.get("destination")?.toString();
  const plate = formData.get("plate")?.toString() || null;
  const trailerPlate = formData.get("trailerPlate")?.toString().trim() || null;
  const priceBuy = Number(formData.get("priceBuy"));
  const priceSell = Number(formData.get("priceSell"));
  const cmrNumber = formData.get("cmrNumber")?.toString().trim() || null;
  const customerInvoiceNumber = formData.get("customerInvoiceNumber")?.toString().trim() || null;
  const supplierInvoiceNumber = formData.get("supplierInvoiceNumber")?.toString().trim() || null;
  const paymentRegularization = formData.get("paymentRegularization")?.toString().trim() || null;
  const paymentMonth = formData.get("paymentMonth")?.toString().trim() || null;
  const serviceValueRaw = formData.get("serviceValueEur")?.toString();
  const serviceValueEur = serviceValueRaw ? Number(serviceValueRaw) : null;
  const notes = formData.get("notes")?.toString() || null;

  if (!clientId || !origin || !destination) throw new Error("Campos obrigatórios em falta");
  if (!Number.isFinite(priceBuy) || !Number.isFinite(priceSell)) throw new Error("Preços inválidos");
  if (priceBuy <= 0 || priceSell <= 0) throw new Error("Preços têm de ser > 0");
  if (serviceValueEur != null && !Number.isFinite(serviceValueEur)) throw new Error("Valor serviço inválido");

  const margin = Math.round((priceSell - priceBuy) * 100) / 100;
  const marginPct = priceBuy > 0 ? margin / priceBuy : 0;
  const selectedSupplier = supplierId
    ? (await db.select({ name: suppliers.name }).from(suppliers).where(eq(suppliers.id, supplierId)).limit(1))[0]
    : null;
  const carrierName = carrierNameInput ?? selectedSupplier?.name ?? "LLORETRANS";
  const carrierKind = supplierId ? "external_transporter" : "internal_lloretrans";

  const reference = `CGA-${new Date().getFullYear()}/${Date.now().toString().slice(-5)}`;
  const id = randomId("load");
  const now = new Date();

  await db.insert(freightLoads).values({
    id,
    reference,
    salespersonId: session.userId,
    clientId,
    supplierId: supplierId || null,
    carrierName,
    carrierKind,
    trailerPlate,
    customerInvoiceNumber,
    supplierInvoiceNumber,
    cmrNumber,
    paymentRegularization,
    paymentMonth,
    serviceValueEur,
    origin,
    destination,
    priceBuy,
    priceSell,
    margin,
    marginPct,
    currency: "EUR",
    plate,
    notes,
    state: "scheduled",
    createdAt: now,
    updatedAt: now,
  });

  await db.insert(freightStateTransitions).values({
    id: randomId("ftr"),
    loadId: id,
    fromState: "scheduled",
    toState: "scheduled",
    userId: session.userId,
    reason: "Criada",
    createdAt: now,
  });

  await audit({
    userId: session.userId,
    action: "freight.create",
    entityType: "freight_load",
    entityId: id,
    after: { reference, priceBuy, priceSell, margin, marginPct },
  });

  redirect(`/bolsa/${id}`);
}

export async function transitionState(formData: FormData): Promise<void> {
  const session = await requireRole(["admin", "clarice", "comercial", "admin_faturacao"]);
  const loadId = formData.get("loadId")?.toString();
  const toState = formData.get("toState")?.toString() as FreightState | undefined;
  const reason = formData.get("reason")?.toString() || null;
  if (!loadId || !toState) throw new Error("loadId e toState obrigatórios");

  const [load] = await db.select().from(freightLoads).where(eq(freightLoads.id, loadId)).limit(1);
  if (!load) throw new Error("Carga não encontrada");

  if (!canTransition(load.state as FreightState, toState)) {
    throw new Error(`Transição ${load.state} → ${toState} não permitida`);
  }

  if (session.role === "comercial" && load.salespersonId !== session.userId) {
    throw new Error("Não podes alterar cargas de outro comercial");
  }

  const now = new Date();
  await db.update(freightLoads).set({ state: toState, updatedAt: now }).where(eq(freightLoads.id, loadId));
  await db.insert(freightStateTransitions).values({
    id: randomId("ftr"),
    loadId,
    fromState: load.state,
    toState,
    userId: session.userId,
    reason,
    createdAt: now,
  });

  await audit({
    userId: session.userId,
    action: "freight.transition",
    entityType: "freight_load",
    entityId: loadId,
    before: { state: load.state },
    after: { state: toState },
    reason,
  });

  revalidatePath(`/bolsa/${loadId}`);
  revalidatePath("/bolsa");
}

export async function registerSupplierInvoice(formData: FormData): Promise<void> {
  const session = await requireRole(["admin", "admin_faturacao", "admin_contas"]);
  const loadId = formData.get("loadId")?.toString();
  const invoiceNumber = formData.get("invoiceNumber")?.toString();
  const totalGross = Number(formData.get("totalGross"));
  const issuedAtStr = formData.get("issuedAt")?.toString();
  if (!loadId || !invoiceNumber || !issuedAtStr) throw new Error("Campos em falta");
  if (!Number.isFinite(totalGross)) throw new Error("Total inválido");

  const [load] = await db.select().from(freightLoads).where(eq(freightLoads.id, loadId)).limit(1);
  if (!load) throw new Error("Carga não encontrada");

  const expected = load.priceBuy * 1.23;
  const deviation = Math.round((totalGross - expected) * 100) / 100;
  const deviationPct = expected > 0 ? deviation / expected : 0;
  const state = Math.abs(deviationPct) > 0.05 ? "deviation_detected" : "ok";

  await db.insert(supplierInvoicesFreight).values({
    id: randomId("fsinv"),
    loadId,
    invoiceNumber,
    issuedAt: new Date(issuedAtStr),
    totalGross,
    deviation,
    deviationPct,
    state,
    reviewedBy: null,
    reviewedAt: null,
  });

  await audit({
    userId: session.userId,
    action: "freight.register_supplier_invoice",
    entityType: "freight_load",
    entityId: loadId,
    after: { invoiceNumber, totalGross, deviation, state },
  });

  // Auto-transition if at delivered
  if (load.state === "delivered") {
    await db.update(freightLoads).set({ state: "supplier_invoiced", updatedAt: new Date() }).where(eq(freightLoads.id, loadId));
    await db.insert(freightStateTransitions).values({
      id: randomId("ftr"),
      loadId,
      fromState: "delivered",
      toState: "supplier_invoiced",
      userId: session.userId,
      reason: `Factura fornecedor ${invoiceNumber}`,
      createdAt: new Date(),
    });
  }

  revalidatePath(`/bolsa/${loadId}`);
}

export async function registerClientInvoice(formData: FormData): Promise<void> {
  const session = await requireRole(["admin", "admin_faturacao"]);
  const loadId = formData.get("loadId")?.toString();
  const invoiceNumber = formData.get("invoiceNumber")?.toString();
  const totalGross = Number(formData.get("totalGross"));
  const issuedAtStr = formData.get("issuedAt")?.toString();
  const dueAtStr = formData.get("dueAt")?.toString();
  if (!loadId || !invoiceNumber || !issuedAtStr || !dueAtStr) throw new Error("Campos em falta");
  if (!Number.isFinite(totalGross) || totalGross <= 0) throw new Error("Total inválido");
  const issuedAt = new Date(issuedAtStr);
  const dueAt = new Date(dueAtStr);
  if (Number.isNaN(issuedAt.getTime()) || Number.isNaN(dueAt.getTime())) throw new Error("Datas inválidas");

  const [load] = await db.select().from(freightLoads).where(eq(freightLoads.id, loadId)).limit(1);
  if (!load) throw new Error("Carga não encontrada");
  if (load.state !== "supplier_invoiced") {
    throw new Error("Carga tem de estar em supplier_invoiced para emitir factura cliente");
  }

  const existing = await db
    .select({ id: clientInvoicesFreight.id })
    .from(clientInvoicesFreight)
    .where(and(eq(clientInvoicesFreight.loadId, loadId), eq(clientInvoicesFreight.invoiceNumber, invoiceNumber)))
    .limit(1);
  if (existing[0]) throw new Error("Factura cliente já registada para esta carga");

  await db.insert(clientInvoicesFreight).values({
    id: randomId("fcinv"),
    loadId,
    invoiceNumber,
    issuedAt,
    dueAt,
    totalGross,
    paidAt: null,
  });

  await db.update(freightLoads).set({ state: "client_invoiced", updatedAt: new Date() }).where(eq(freightLoads.id, loadId));
  await db.insert(freightStateTransitions).values({
    id: randomId("ftr"),
    loadId,
    fromState: "supplier_invoiced",
    toState: "client_invoiced",
    userId: session.userId,
    reason: `Factura cliente ${invoiceNumber}`,
    createdAt: new Date(),
  });

  await audit({
    userId: session.userId,
    action: "freight.register_client_invoice",
    entityType: "freight_load",
    entityId: loadId,
    after: { invoiceNumber, totalGross },
  });
  revalidatePath(`/bolsa/${loadId}`);
}

export async function markPaid(formData: FormData): Promise<void> {
  const session = await requireRole(["admin", "admin_faturacao", "admin_contas"]);
  const loadId = formData.get("loadId")?.toString();
  if (!loadId) throw new Error("loadId required");

  const [load] = await db.select().from(freightLoads).where(eq(freightLoads.id, loadId)).limit(1);
  if (!load) throw new Error("Carga não encontrada");
  if (load.state !== "client_invoiced") throw new Error("Carga tem de estar em client_invoiced para ser marcada paga");

  const now = new Date();
  await db.update(freightLoads).set({ state: "paid", updatedAt: now }).where(eq(freightLoads.id, loadId));
  await db
    .update(clientInvoicesFreight)
    .set({ paidAt: now })
    .where(eq(clientInvoicesFreight.loadId, loadId));
  await db.insert(freightStateTransitions).values({
    id: randomId("ftr"),
    loadId,
    fromState: "client_invoiced",
    toState: "paid",
    userId: session.userId,
    reason: "Pagamento recebido",
    createdAt: now,
  });

  await audit({
    userId: session.userId,
    action: "freight.mark_paid",
    entityType: "freight_load",
    entityId: loadId,
    before: { state: "client_invoiced" },
    after: { state: "paid" },
  });

  revalidatePath(`/bolsa/${loadId}`);
  revalidatePath("/bolsa");
}

export async function computeCommissions(formData: FormData): Promise<void> {
  const session = await requireRole(["admin", "clarice"]);
  const period = formData.get("period")?.toString();
  if (!period) throw new Error("period required (YYYY-MM)");

  const [yearStr, monthStr] = period.split("-");
  const from = new Date(Number(yearStr), Number(monthStr) - 1, 1);
  const to = new Date(Number(yearStr), Number(monthStr), 0, 23, 59, 59);

  const paidLoads = await db
    .select()
    .from(freightLoads)
    .where(and(eq(freightLoads.state, "paid"), gte(freightLoads.updatedAt, from), lte(freightLoads.updatedAt, to)));

  const rules = await db.select().from(commissionRules);
  const ruleFor = (salespersonId: string) =>
    rules.find((r) => r.salespersonId === salespersonId) ?? rules.find((r) => r.salespersonId == null);

  const internalVehicles = await db
    .select({ plate: vehicles.plate })
    .from(vehicles)
    .where(eq(vehicles.isInternal, true));
  const internalPlates = new Set(internalVehicles.map((v) => v.plate));

  let created = 0;
  let skippedIneligible = 0;
  for (const load of paidLoads) {
    const existing = await db
      .select()
      .from(commissions)
      .where(and(eq(commissions.loadId, load.id), eq(commissions.period, period)))
      .limit(1);
    if (existing[0]) continue;

    const rule = ruleFor(load.salespersonId);
    if (!rule) continue;

    const result = computeCommissionAmount(
      {
        margin: load.margin,
        marginPct: load.marginPct,
        plate: load.plate,
        origin: load.origin,
        destination: load.destination,
      },
      {
        percentOfMargin: rule.percentOfMargin,
        fixedBonusNationalEur: rule.fixedBonusNationalEur,
        fixedBonusInternationalEur: rule.fixedBonusInternationalEur,
        requireInternalVehicle: rule.requireInternalVehicle,
        minMarginPct: rule.minMarginPct ?? 0,
      },
      internalPlates,
    );

    if (!result.eligible) {
      skippedIneligible += 1;
      continue;
    }

    await db.insert(commissions).values({
      id: randomId("comm"),
      loadId: load.id,
      salespersonId: load.salespersonId,
      period,
      amountEur: result.amountEur,
      ruleId: rule.id,
      state: "accrued",
      paidAt: null,
    });
    created += 1;
  }

  await audit({
    userId: session.userId,
    action: "freight.compute_commissions",
    entityType: "freight_period",
    entityId: period,
    after: { created, skippedIneligible, paidLoads: paidLoads.length },
  });

  revalidatePath("/bolsa/commissions");
}

function csvEscape(v: string | number | null | undefined): string {
  if (v == null) return "";
  const s = String(v);
  return /[";\n\r]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
}

export async function exportLoadsCsv(formData: FormData): Promise<void> {
  const session = await requireRole(["admin", "clarice", "comercial", "admin_faturacao"]);
  const fromStr = formData.get("dateFrom")?.toString();
  const toStr = formData.get("dateTo")?.toString();
  const mineOnly = formData.get("mineOnly")?.toString() === "1";

  const conditions = [];
  if (fromStr) conditions.push(gte(freightLoads.createdAt, new Date(`${fromStr}T00:00:00`)));
  if (toStr) conditions.push(lte(freightLoads.createdAt, new Date(`${toStr}T23:59:59`)));
  if (mineOnly || session.role === "comercial")
    conditions.push(eq(freightLoads.salespersonId, session.userId));

  const rows = await db
    .select({
      reference: freightLoads.reference,
      state: freightLoads.state,
      origin: freightLoads.origin,
      destination: freightLoads.destination,
      plate: freightLoads.plate,
      priceBuy: freightLoads.priceBuy,
      priceSell: freightLoads.priceSell,
      margin: freightLoads.margin,
      marginPct: freightLoads.marginPct,
      createdAt: freightLoads.createdAt,
    })
    .from(freightLoads)
    .where(conditions.length ? and(...conditions) : undefined);

  const headers = [
    "Referência",
    "Estado",
    "Origem",
    "Destino",
    "Matrícula",
    "Preço compra",
    "Preço venda",
    "Margem",
    "Margem %",
    "Criada",
  ];
  const lines = [headers.map(csvEscape).join(";")];
  for (const r of rows) {
    lines.push(
      [
        r.reference,
        r.state,
        r.origin,
        r.destination,
        r.plate ?? "",
        r.priceBuy.toFixed(2),
        r.priceSell.toFixed(2),
        r.margin.toFixed(2),
        (r.marginPct * 100).toFixed(1) + "%",
        r.createdAt.toISOString().slice(0, 10),
      ]
        .map(csvEscape)
        .join(";"),
    );
  }
  const csv = "\uFEFF" + lines.join("\r\n");
  const dataUrl = `data:text/csv;charset=utf-8;base64,${Buffer.from(csv, "utf-8").toString("base64")}`;

  await audit({
    userId: session.userId,
    action: "freight.export_csv",
    entityType: "freight_loads",
    entityId: "bulk",
    after: { count: rows.length, dateFrom: fromStr, dateTo: toStr, mineOnly },
  });

  redirect(dataUrl);
}

export async function markCommissionsPaid(formData: FormData): Promise<void> {
  const session = await requireRole(["admin", "clarice"]);
  const period = formData.get("period")?.toString();
  const salespersonId = formData.get("salespersonId")?.toString();
  if (!period || !salespersonId) throw new Error("period e salespersonId obrigatórios");

  const now = new Date();
  await db
    .update(commissions)
    .set({ state: "paid", paidAt: now })
    .where(and(eq(commissions.period, period), eq(commissions.salespersonId, salespersonId), eq(commissions.state, "accrued")));

  await audit({
    userId: session.userId,
    action: "freight.pay_commissions",
    entityType: "freight_period",
    entityId: `${period}:${salespersonId}`,
    after: { paidAt: now.toISOString() },
  });

  revalidatePath("/bolsa/commissions");
}
