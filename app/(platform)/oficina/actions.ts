"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { eq } from "drizzle-orm";
import { z } from "zod";
import { db } from "@/db/client";
import {
  workOrders,
  workOrderItems,
  workOrderSignatures,
  workOrderChecklistAnswers,
  vehicles,
} from "@/db/schema";
import { requireRole } from "@/lib/auth/session";
import { audit } from "@/lib/audit";
import { randomId } from "@/lib/utils";

function minutesBetween(a: Date, b: Date): number {
  return Math.max(0, Math.round((b.getTime() - a.getTime()) / 60000));
}

const submitPayloadSchema = z.object({
  plate: z.string().trim().min(1),
  serviceCode: z.string().trim().min(1),
  summary: z.string().trim().min(1),
  items: z.array(z.object({
    kind: z.enum(["part", "labour"]),
    description: z.string().trim().min(1),
    partCode: z.string().trim().optional(),
    quantity: z.number().positive(),
    unitPrice: z.number().min(0),
  })).min(1),
  checklist: z.array(z.object({
    key: z.string().trim().min(1),
    substituted: z.boolean(),
    verified: z.boolean(),
    notes: z.string().trim().optional(),
  })).optional(),
  signatureSvgPath: z.string().trim().min(1),
  signerName: z.string().trim().min(1),
});

export async function submitWorkOrder(formData: FormData): Promise<void> {
  const session = await requireRole(["admin", "clarice", "mecanico", "admin_oficina"]);
  const payloadRaw = formData.get("payload")?.toString();
  if (!payloadRaw) throw new Error("payload required");
  const payload = submitPayloadSchema.parse(JSON.parse(payloadRaw));

  const [vehicle] = await db.select().from(vehicles).where(eq(vehicles.plate, payload.plate)).limit(1);
  if (!vehicle) throw new Error(`Matrícula ${payload.plate} não encontrada`);

  const now = new Date();
  const woId = randomId("wo");
  const reference = `FO-${now.getFullYear()}/${Date.now().toString().slice(-5)}`;

  await db.insert(workOrders).values({
    id: woId,
    reference,
    vehicleId: vehicle.id,
    mechanicId: session.userId,
    serviceCode: payload.serviceCode,
    workCode: "INT-OFI-LLT",
    startedAt: now,
    endedAt: now,
    durationMinutes: null,
    summary: payload.summary,
    state: "submitted",
    syncVersion: 1,
    createdAt: now,
    updatedAt: now,
  });

  for (let i = 0; i < payload.items.length; i++) {
    const item = payload.items[i];
    await db.insert(workOrderItems).values({
      id: randomId(`woi_${i}`),
      workOrderId: woId,
      kind: item.kind,
      description: item.description,
      partCode: item.partCode ?? null,
      quantity: item.quantity,
      unitPrice: item.unitPrice,
      total: Math.round(item.quantity * item.unitPrice * 100) / 100,
    });
  }

  await db.insert(workOrderSignatures).values({
    id: randomId("wos"),
    workOrderId: woId,
    signerRole: "mechanic",
    signerName: payload.signerName,
    svgPath: payload.signatureSvgPath,
    signedAt: now,
  });

  if (payload.checklist && payload.checklist.length > 0) {
    for (let i = 0; i < payload.checklist.length; i++) {
      const c = payload.checklist[i];
      await db.insert(workOrderChecklistAnswers).values({
        id: randomId(`woc_${i}`),
        workOrderId: woId,
        itemKey: c.key,
        substituted: c.substituted,
        verified: c.verified,
        notes: c.notes ?? null,
      });
    }
  }

  await audit({
    userId: session.userId,
    action: "workorder.submit",
    entityType: "work_order",
    entityId: woId,
    after: {
      reference,
      itemCount: payload.items.length,
      checklistCount: payload.checklist?.length ?? 0,
    },
  });

  redirect(`/oficina/${woId}`);
}

export async function pauseWorkOrder(formData: FormData): Promise<void> {
  const session = await requireRole(["admin", "clarice", "mecanico", "admin_oficina"]);
  const id = formData.get("id")?.toString();
  const reason = formData.get("reason")?.toString().trim() || "Pausa";
  const kind = formData.get("kind")?.toString() === "waiting_parts" ? "waiting_parts" : "paused";
  if (!id) throw new Error("id required");

  const [before] = await db.select().from(workOrders).where(eq(workOrders.id, id)).limit(1);
  if (!before) throw new Error("not found");
  if (before.state !== "in_progress") throw new Error(`Estado actual (${before.state}) não permite pausa`);

  const now = new Date();
  const workedSinceLast = minutesBetween(before.updatedAt, now);

  await db
    .update(workOrders)
    .set({
      state: kind,
      activeMinutes: before.activeMinutes + workedSinceLast,
      lastPausedAt: now,
      pauseReason: reason,
      updatedAt: now,
    })
    .where(eq(workOrders.id, id));

  await audit({
    userId: session.userId,
    action: kind === "waiting_parts" ? "workorder.wait_parts" : "workorder.pause",
    entityType: "work_order",
    entityId: id,
    before: { state: before.state },
    after: { state: kind, pauseReason: reason, activeMinutes: before.activeMinutes + workedSinceLast },
    reason,
  });
  revalidatePath(`/oficina/${id}`);
  revalidatePath("/oficina");
}

export async function resumeWorkOrder(formData: FormData): Promise<void> {
  const session = await requireRole(["admin", "clarice", "mecanico", "admin_oficina"]);
  const id = formData.get("id")?.toString();
  if (!id) throw new Error("id required");

  const [before] = await db.select().from(workOrders).where(eq(workOrders.id, id)).limit(1);
  if (!before) throw new Error("not found");
  if (before.state !== "paused" && before.state !== "waiting_parts") {
    throw new Error(`Estado actual (${before.state}) não pode ser retomado`);
  }

  const now = new Date();
  const pausedForMin = before.lastPausedAt ? minutesBetween(before.lastPausedAt, now) : 0;

  await db
    .update(workOrders)
    .set({
      state: "in_progress",
      pausedMinutes: before.pausedMinutes + pausedForMin,
      lastPausedAt: null,
      pauseReason: null,
      updatedAt: now,
    })
    .where(eq(workOrders.id, id));

  await audit({
    userId: session.userId,
    action: "workorder.resume",
    entityType: "work_order",
    entityId: id,
    before: { state: before.state, pausedMinutes: before.pausedMinutes },
    after: { state: "in_progress", pausedMinutes: before.pausedMinutes + pausedForMin },
  });
  revalidatePath(`/oficina/${id}`);
  revalidatePath("/oficina");
}

export async function startWorkOrder(formData: FormData): Promise<void> {
  const session = await requireRole(["admin", "clarice", "mecanico", "admin_oficina"]);
  const id = formData.get("id")?.toString();
  if (!id) throw new Error("id required");

  const [before] = await db.select().from(workOrders).where(eq(workOrders.id, id)).limit(1);
  if (!before) throw new Error("not found");
  if (before.state !== "draft") throw new Error("Só rascunhos podem ser iniciados");

  const now = new Date();
  await db
    .update(workOrders)
    .set({ state: "in_progress", startedAt: now, updatedAt: now })
    .where(eq(workOrders.id, id));

  await audit({
    userId: session.userId,
    action: "workorder.start",
    entityType: "work_order",
    entityId: id,
    before: { state: "draft" },
    after: { state: "in_progress" },
  });
  revalidatePath(`/oficina/${id}`);
}

export async function approveWorkOrder(formData: FormData): Promise<void> {
  const session = await requireRole(["admin", "admin_oficina"]);
  const id = formData.get("id")?.toString();
  if (!id) throw new Error("id required");
  const [before] = await db.select().from(workOrders).where(eq(workOrders.id, id)).limit(1);
  if (!before) throw new Error("not found");
  if (before.state !== "submitted") {
    throw new Error(`Só folhas submetidas podem ser aprovadas (estado actual: ${before.state})`);
  }
  const now = new Date();
  await db.update(workOrders).set({ state: "approved", approvedBy: session.userId, approvedAt: now, updatedAt: now }).where(eq(workOrders.id, id));
  await audit({
    userId: session.userId,
    action: "workorder.approve",
    entityType: "work_order",
    entityId: id,
    before: { state: before.state },
    after: { state: "approved" },
  });
  revalidatePath(`/oficina/${id}`);
  revalidatePath("/oficina");
}

export async function rejectWorkOrder(formData: FormData): Promise<void> {
  const session = await requireRole(["admin", "admin_oficina"]);
  const id = formData.get("id")?.toString();
  const reason = formData.get("reason")?.toString().trim();
  if (!id || !reason) throw new Error("id e motivo obrigatórios");
  const [before] = await db.select().from(workOrders).where(eq(workOrders.id, id)).limit(1);
  if (!before) throw new Error("not found");
  await db.update(workOrders).set({ state: "draft", updatedAt: new Date() }).where(eq(workOrders.id, id));
  await audit({
    userId: session.userId,
    action: "workorder.reject",
    entityType: "work_order",
    entityId: id,
    before: { state: before.state },
    after: { state: "draft" },
    reason,
  });
  revalidatePath(`/oficina/${id}`);
  revalidatePath("/oficina");
}

export async function exportWorkOrder(formData: FormData): Promise<void> {
  const session = await requireRole(["admin", "admin_oficina"]);
  const id = formData.get("id")?.toString();
  if (!id) throw new Error("id required");
  const [before] = await db.select().from(workOrders).where(eq(workOrders.id, id)).limit(1);
  if (!before) throw new Error("not found");
  if (before.state !== "approved") {
    throw new Error(`Só folhas aprovadas podem ser exportadas (estado actual: ${before.state})`);
  }
  const now = new Date();
  await db.update(workOrders).set({ exportedAt: now }).where(eq(workOrders.id, id));
  await audit({
    userId: session.userId,
    action: "workorder.export",
    entityType: "work_order",
    entityId: id,
    before: { state: before.state, exportedAt: before.exportedAt },
    after: { exportedAt: now.toISOString(), format: "json-phc" },
  });
  revalidatePath(`/oficina/${id}`);
}
