"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { eq } from "drizzle-orm";
import { db } from "@/db/client";
import {
  workOrders,
  workOrderItems,
  workOrderSignatures,
  workOrderPhotos,
  vehicles,
} from "@/db/schema";
import { requireRole } from "@/lib/auth/session";
import { audit } from "@/lib/audit";
import { randomId } from "@/lib/utils";
import { createPhcClient } from "@/lib/integrations/phc";

interface SubmitPayload {
  plate: string;
  serviceCode: string;
  summary: string;
  items: Array<{ kind: "part" | "labour"; description: string; partCode?: string; quantity: number; unitPrice: number }>;
  signatureSvgPath: string;
  signerName: string;
}

export async function submitWorkOrder(formData: FormData): Promise<void> {
  const session = await requireRole(["admin", "mecanico", "admin_oficina"]);
  const payloadRaw = formData.get("payload")?.toString();
  if (!payloadRaw) throw new Error("payload required");
  const payload = JSON.parse(payloadRaw) as SubmitPayload;

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

  await audit({
    userId: session.userId,
    action: "workorder.submit",
    entityType: "work_order",
    entityId: woId,
    after: { reference, itemCount: payload.items.length },
  });

  redirect(`/oficina/${woId}`);
}

export async function approveWorkOrder(formData: FormData): Promise<void> {
  const session = await requireRole(["admin", "admin_oficina"]);
  const id = formData.get("id")?.toString();
  if (!id) throw new Error("id required");
  const [before] = await db.select().from(workOrders).where(eq(workOrders.id, id)).limit(1);
  if (!before) throw new Error("not found");
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
  const now = new Date();
  await db.update(workOrders).set({ exportedAt: now }).where(eq(workOrders.id, id));
  await audit({
    userId: session.userId,
    action: "workorder.export",
    entityType: "work_order",
    entityId: id,
    after: { exportedAt: now.toISOString(), format: "json-phc" },
  });
  revalidatePath(`/oficina/${id}`);
}
