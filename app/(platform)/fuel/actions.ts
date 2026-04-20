"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { and, between, eq } from "drizzle-orm";
import { db } from "@/db/client";
import { fuelAnomalies, fuelFills, fuelReadingsCanbus, vehicles } from "@/db/schema";
import { requireRole } from "@/lib/auth/session";
import { audit } from "@/lib/audit";
import { formatDate } from "@/lib/dates";

const ROLES = ["admin", "clarice"] as const;

export async function resolveAnomaly(formData: FormData): Promise<void> {
  const session = await requireRole([...ROLES]);
  const id = formData.get("anomalyId")?.toString();
  const reason = formData.get("reason")?.toString().trim();
  if (!id) throw new Error("anomalyId required");
  if (!reason) throw new Error("motivo obrigatório");

  const [before] = await db.select().from(fuelAnomalies).where(eq(fuelAnomalies.id, id)).limit(1);
  if (!before) throw new Error("not found");

  await db
    .update(fuelAnomalies)
    .set({ state: "resolved", resolvedBy: session.userId, resolvedAt: new Date(), notes: reason })
    .where(eq(fuelAnomalies.id, id));

  await audit({
    userId: session.userId,
    action: "fuel.anomaly_resolve",
    entityType: "fuel_anomaly",
    entityId: id,
    before: { state: before.state },
    after: { state: "resolved" },
    reason,
  });

  revalidatePath("/fuel");
  revalidatePath(`/fuel/${before.vehicleId}`);
}

export async function reopenAnomaly(formData: FormData): Promise<void> {
  const session = await requireRole([...ROLES]);
  const id = formData.get("anomalyId")?.toString();
  const reason = formData.get("reason")?.toString().trim() || "Reaberta para investigação";
  if (!id) throw new Error("anomalyId required");

  const [before] = await db.select().from(fuelAnomalies).where(eq(fuelAnomalies.id, id)).limit(1);
  if (!before) throw new Error("not found");

  await db
    .update(fuelAnomalies)
    .set({ state: "open", resolvedBy: null, resolvedAt: null })
    .where(eq(fuelAnomalies.id, id));

  await audit({
    userId: session.userId,
    action: "fuel.anomaly_reopen",
    entityType: "fuel_anomaly",
    entityId: id,
    before: { state: before.state },
    after: { state: "open" },
    reason,
  });

  revalidatePath("/fuel");
}

function csvEscape(v: string | number | null | undefined): string {
  if (v == null) return "";
  const s = String(v);
  return /[";\n\r]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
}

export async function exportMonthlyReport(formData: FormData): Promise<void> {
  await requireRole([...ROLES]);
  const yearStr = formData.get("year")?.toString();
  const monthStr = formData.get("month")?.toString();
  const year = yearStr ? Number(yearStr) : new Date().getFullYear();
  const month = monthStr ? Number(monthStr) : new Date().getMonth() + 1;
  const from = new Date(year, month - 1, 1);
  const to = new Date(year, month, 0, 23, 59, 59);

  const fills = await db
    .select({
      plate: vehicles.plate,
      kind: vehicles.kind,
      source: fuelFills.source,
      filledAt: fuelFills.filledAt,
      liters: fuelFills.liters,
      totalEur: fuelFills.totalEur,
      location: fuelFills.location,
    })
    .from(fuelFills)
    .innerJoin(vehicles, eq(vehicles.id, fuelFills.vehicleId))
    .where(between(fuelFills.filledAt, from, to))
    .orderBy(vehicles.plate);

  const headers = ["Matrícula", "Tipo", "Data", "Fonte", "Litros", "Total EUR", "Local"];
  const lines = [headers.map(csvEscape).join(";")];
  for (const r of fills) {
    lines.push(
      [r.plate, r.kind, formatDate(r.filledAt), r.source, r.liters.toFixed(2), r.totalEur?.toFixed(2) ?? "", r.location ?? ""]
        .map(csvEscape)
        .join(";"),
    );
  }
  const csv = "\uFEFF" + lines.join("\r\n");
  const dataUrl = `data:text/csv;charset=utf-8;base64,${Buffer.from(csv, "utf-8").toString("base64")}`;

  await audit({
    userId: null,
    action: "fuel.export_monthly",
    entityType: "fuel_report",
    entityId: `${year}-${String(month).padStart(2, "0")}`,
    after: { rows: fills.length, year, month },
  });

  redirect(dataUrl);
}
