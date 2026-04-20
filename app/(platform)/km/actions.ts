"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { and, between, eq, inArray, isNull } from "drizzle-orm";
import { db } from "@/db/client";
import { kmReconciliations, trips, vehicles, drivers } from "@/db/schema";
import { requireRole } from "@/lib/auth/session";
import { audit } from "@/lib/audit";
import { formatDate } from "@/lib/dates";

const ALLOWED_ROLES = ["admin", "clarice", "admin_faturacao"] as const;

// ─────────────────────────────────────────────────────────────────────────
// Helpers exportados para testes (sem `requireRole`, sem `revalidatePath`)
// ─────────────────────────────────────────────────────────────────────────

interface DecisionResult {
  ok: boolean;
  reconciliationId: string;
  finalKm: number | null;
}

export async function applyApproval(params: {
  reconciliationId: string;
  userId: string;
  finalKm: number | null;
  reason: string | null;
  action: "km.approve" | "km.use_gps" | "km.manual_override" | "km.reject";
}): Promise<DecisionResult> {
  const { reconciliationId, userId, finalKm, reason, action } = params;

  const [before] = await db
    .select()
    .from(kmReconciliations)
    .where(eq(kmReconciliations.id, reconciliationId))
    .limit(1);
  if (!before) throw new Error("reconciliation not found");

  const decidedAt = new Date();
  await db
    .update(kmReconciliations)
    .set({
      finalKm,
      decidedBy: userId,
      decidedAt,
      decisionReason: reason,
      updatedAt: decidedAt,
    })
    .where(eq(kmReconciliations.id, reconciliationId));

  await audit({
    userId,
    action,
    entityType: "km_reconciliation",
    entityId: reconciliationId,
    before: {
      state: before.state,
      finalKm: before.finalKm,
      decidedBy: before.decidedBy,
    },
    after: {
      state: before.state,
      finalKm,
      decidedBy: userId,
    },
    reason,
  });

  return { ok: true, reconciliationId, finalKm };
}

// ─────────────────────────────────────────────────────────────────────────
// Server Actions (chamadas do form)
// ─────────────────────────────────────────────────────────────────────────

function parseNumber(value: FormDataEntryValue | null): number | null {
  if (value == null) return null;
  const s = value.toString().trim().replace(",", ".");
  if (s === "") return null;
  const n = Number(s);
  return Number.isFinite(n) ? n : null;
}

export async function approveReconciliation(formData: FormData): Promise<void> {
  const session = await requireRole([...ALLOWED_ROLES]);
  const reconciliationId = formData.get("reconciliationId")?.toString();
  if (!reconciliationId) throw new Error("reconciliationId required");

  const finalKm = parseNumber(formData.get("finalKm"));
  const reason = formData.get("reason")?.toString().trim() || null;

  const [row] = await db
    .select()
    .from(kmReconciliations)
    .where(eq(kmReconciliations.id, reconciliationId))
    .limit(1);
  if (!row) throw new Error("not found");

  const effectiveKm = finalKm ?? row.kmDeclared ?? row.kmGps ?? null;
  const isOverride =
    effectiveKm != null && row.kmDeclared != null && Math.abs(effectiveKm - row.kmDeclared) > 0.001;

  await applyApproval({
    reconciliationId,
    userId: session.userId,
    finalKm: effectiveKm,
    reason,
    action: isOverride ? "km.manual_override" : "km.approve",
  });

  revalidatePath(`/km/${reconciliationId}`);
  revalidatePath("/km");
}

export async function useGpsValue(formData: FormData): Promise<void> {
  const session = await requireRole([...ALLOWED_ROLES]);
  const reconciliationId = formData.get("reconciliationId")?.toString();
  if (!reconciliationId) throw new Error("reconciliationId required");
  const reason = formData.get("reason")?.toString().trim() || "Administrativa optou por valor GPS (fonte de verdade)";

  const [row] = await db
    .select()
    .from(kmReconciliations)
    .where(eq(kmReconciliations.id, reconciliationId))
    .limit(1);
  if (!row) throw new Error("not found");
  if (row.kmGps == null) throw new Error("GPS indisponível nesta reconciliação");

  await applyApproval({
    reconciliationId,
    userId: session.userId,
    finalKm: row.kmGps,
    reason,
    action: "km.use_gps",
  });

  revalidatePath(`/km/${reconciliationId}`);
  revalidatePath("/km");
}

export async function rejectReconciliation(formData: FormData): Promise<void> {
  const session = await requireRole([...ALLOWED_ROLES]);
  const reconciliationId = formData.get("reconciliationId")?.toString();
  if (!reconciliationId) throw new Error("reconciliationId required");
  const reason = formData.get("reason")?.toString().trim();
  if (!reason) throw new Error("motivo obrigatório para rejeição");

  await applyApproval({
    reconciliationId,
    userId: session.userId,
    finalKm: null,
    reason,
    action: "km.reject",
  });

  revalidatePath(`/km/${reconciliationId}`);
  revalidatePath("/km");
}

export async function bulkApproveGreen(formData: FormData): Promise<void> {
  const session = await requireRole([...ALLOWED_ROLES]);
  const rawIds = formData.get("ids")?.toString() ?? "";
  const ids = rawIds
    .split(",")
    .map((s) => s.trim())
    .filter((s) => s.length > 0);
  if (ids.length === 0) return;

  const eligibles = await db
    .select()
    .from(kmReconciliations)
    .where(
      and(
        inArray(kmReconciliations.id, ids),
        eq(kmReconciliations.state, "green"),
        isNull(kmReconciliations.decidedBy),
      ),
    );

  if (eligibles.length === 0) {
    revalidatePath("/km");
    return;
  }

  for (const row of eligibles) {
    await applyApproval({
      reconciliationId: row.id,
      userId: session.userId,
      finalKm: row.kmDeclared ?? row.kmGps ?? null,
      reason: "Aprovação em lote · Δ dentro do threshold",
      action: "km.approve",
    });
  }

  await audit({
    userId: session.userId,
    action: "km.bulk_approve",
    entityType: "km_reconciliation",
    entityId: eligibles[0].id,
    after: { count: eligibles.length, ids: eligibles.map((r) => r.id) },
    reason: "Aprovação em lote de verdes",
  });

  revalidatePath("/km");
}

// ─────────────────────────────────────────────────────────────────────────
// Export CSV — gera data URL e redirect
// ─────────────────────────────────────────────────────────────────────────

function csvEscape(value: string | number | null | undefined): string {
  if (value == null) return "";
  const s = String(value);
  if (/[";\n\r]/.test(s)) {
    return `"${s.replace(/"/g, '""')}"`;
  }
  return s;
}

function stateLabel(state: string): string {
  if (state === "green") return "Verde (auto)";
  if (state === "yellow") return "Amarela";
  if (state === "red") return "Vermelha";
  return state;
}

export async function exportCsv(formData: FormData): Promise<void> {
  await requireRole([...ALLOWED_ROLES]);
  const fromStr = formData.get("dateFrom")?.toString();
  const toStr = formData.get("dateTo")?.toString();
  if (!fromStr || !toStr) throw new Error("dateFrom / dateTo obrigatórios");

  const dateFrom = new Date(`${fromStr}T00:00:00.000`);
  const dateTo = new Date(`${toStr}T23:59:59.999`);
  if (Number.isNaN(dateFrom.getTime()) || Number.isNaN(dateTo.getTime())) {
    throw new Error("datas inválidas");
  }

  const rows = await db
    .select({
      id: kmReconciliations.id,
      state: kmReconciliations.state,
      kmDeclared: kmReconciliations.kmDeclared,
      kmGps: kmReconciliations.kmGps,
      deltaKm: kmReconciliations.deltaKm,
      thresholdKm: kmReconciliations.thresholdKm,
      finalKm: kmReconciliations.finalKm,
      decidedAt: kmReconciliations.decidedAt,
      decisionReason: kmReconciliations.decisionReason,
      tripExternal: trips.externalId,
      origin: trips.origin,
      destination: trips.destination,
      startedAt: trips.startedAt,
      plate: vehicles.plate,
      driverName: drivers.name,
    })
    .from(kmReconciliations)
    .innerJoin(trips, eq(trips.id, kmReconciliations.tripId))
    .innerJoin(vehicles, eq(vehicles.id, trips.vehicleId))
    .leftJoin(drivers, eq(drivers.id, trips.driverId))
    .where(between(trips.startedAt, dateFrom, dateTo))
    .orderBy(trips.startedAt);

  const headers = [
    "ID",
    "Data",
    "Viagem",
    "Matrícula",
    "Motorista",
    "Origem",
    "Destino",
    "Km declarado",
    "Km GPS",
    "Delta km",
    "Threshold km",
    "Estado",
    "Km final",
    "Decidida em",
    "Motivo",
  ];

  const lines: string[] = [headers.map(csvEscape).join(";")];
  for (const r of rows) {
    lines.push(
      [
        r.id,
        formatDate(r.startedAt),
        r.tripExternal,
        r.plate,
        r.driverName ?? "",
        r.origin ?? "",
        r.destination ?? "",
        r.kmDeclared ?? "",
        r.kmGps ?? "",
        r.deltaKm ?? "",
        r.thresholdKm,
        stateLabel(r.state),
        r.finalKm ?? "",
        r.decidedAt ? formatDate(r.decidedAt) : "",
        r.decisionReason ?? "",
      ]
        .map(csvEscape)
        .join(";"),
    );
  }

  const bom = "\uFEFF";
  const csv = bom + lines.join("\r\n");
  const base64 = Buffer.from(csv, "utf-8").toString("base64");
  const dataUrl = `data:text/csv;charset=utf-8;base64,${base64}`;

  await audit({
    userId: null,
    action: "km.export_csv",
    entityType: "km_reconciliation",
    entityId: "bulk",
    after: { count: rows.length, dateFrom: fromStr, dateTo: toStr },
  });

  redirect(dataUrl);
}
