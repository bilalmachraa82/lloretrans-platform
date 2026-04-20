"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/db/client";
import { invoices, supplierRules } from "@/db/schema";
import { and, eq } from "drizzle-orm";
import { requireRole } from "@/lib/auth/session";
import { audit } from "@/lib/audit";
import { randomId } from "@/lib/utils";
import { createPhcClient } from "@/lib/integrations/phc";

export async function approveInvoice(formData: FormData): Promise<void> {
  const session = await requireRole(["admin", "admin_oficina"]);
  const invoiceId = formData.get("invoiceId")?.toString();
  if (!invoiceId) throw new Error("invoiceId required");

  const [before] = await db.select().from(invoices).where(eq(invoices.id, invoiceId)).limit(1);
  if (!before) throw new Error("not found");

  await db
    .update(invoices)
    .set({ state: "approved", approvedBy: session.userId, approvedAt: new Date(), updatedAt: new Date() })
    .where(eq(invoices.id, invoiceId));

  await audit({
    userId: session.userId,
    action: "invoice.approve",
    entityType: "invoice",
    entityId: invoiceId,
    before: { state: before.state },
    after: { state: "approved" },
  });

  revalidatePath(`/ocr/${invoiceId}`);
  revalidatePath("/ocr");
}

export async function reopenInvoice(formData: FormData): Promise<void> {
  const session = await requireRole(["admin", "admin_oficina"]);
  const invoiceId = formData.get("invoiceId")?.toString();
  if (!invoiceId) throw new Error("invoiceId required");

  const [before] = await db.select().from(invoices).where(eq(invoices.id, invoiceId)).limit(1);
  if (!before) throw new Error("not found");

  await db
    .update(invoices)
    .set({ state: "pending_review", approvedAt: null, updatedAt: new Date() })
    .where(eq(invoices.id, invoiceId));

  await audit({
    userId: session.userId,
    action: "invoice.reopen",
    entityType: "invoice",
    entityId: invoiceId,
    before: { state: before.state },
    after: { state: "pending_review" },
  });
  revalidatePath(`/ocr/${invoiceId}`);
}

export async function exportInvoiceAction(formData: FormData): Promise<void> {
  const session = await requireRole(["admin", "admin_oficina", "admin_contas"]);
  const invoiceId = formData.get("invoiceId")?.toString();
  if (!invoiceId) throw new Error("invoiceId required");

  await db
    .update(invoices)
    .set({ state: "exported", exportedAt: new Date(), updatedAt: new Date() })
    .where(eq(invoices.id, invoiceId));

  await audit({
    userId: session.userId,
    action: "invoice.export",
    entityType: "invoice",
    entityId: invoiceId,
    after: { format: "xml-phc" },
  });
  revalidatePath(`/ocr/${invoiceId}`);
}

export async function updateClassification(formData: FormData): Promise<void> {
  const session = await requireRole(["admin", "admin_oficina"]);
  const invoiceId = formData.get("invoiceId")?.toString();
  if (!invoiceId) throw new Error("invoiceId required");

  const plate = formData.get("plate")?.toString() || null;
  const serviceCode = formData.get("serviceCode")?.toString() || null;
  const workCode = formData.get("workCode")?.toString() || null;
  const reason = formData.get("reason")?.toString() || null;

  const [before] = await db.select().from(invoices).where(eq(invoices.id, invoiceId)).limit(1);
  if (!before) throw new Error("not found");

  await db
    .update(invoices)
    .set({ plate, serviceCode, workCode, updatedAt: new Date() })
    .where(eq(invoices.id, invoiceId));

  await audit({
    userId: session.userId,
    action: "invoice.classify",
    entityType: "invoice",
    entityId: invoiceId,
    before: { plate: before.plate, serviceCode: before.serviceCode, workCode: before.workCode },
    after: { plate, serviceCode, workCode },
    reason,
  });

  // Learn supplier rule if service code changed
  if (before.supplierId && serviceCode && serviceCode !== before.serviceCode) {
    const existing = await db
      .select()
      .from(supplierRules)
      .where(and(eq(supplierRules.supplierId, before.supplierId), eq(supplierRules.field, "service_code")))
      .limit(1);

    if (existing[0]) {
      await db
        .update(supplierRules)
        .set({ value: serviceCode, hitCount: existing[0].hitCount + 1, learnedFromInvoiceId: invoiceId })
        .where(eq(supplierRules.id, existing[0].id));
    } else {
      await db.insert(supplierRules).values({
        id: randomId("rule"),
        supplierId: before.supplierId,
        field: "service_code",
        value: serviceCode,
        learnedFromInvoiceId: invoiceId,
        hitCount: 1,
      });
    }

    await audit({
      userId: session.userId,
      action: "supplier_rule.learn",
      entityType: "supplier_rule",
      entityId: before.supplierId,
      after: { field: "service_code", value: serviceCode, source_invoice: invoiceId },
      reason,
    });
  }

  revalidatePath(`/ocr/${invoiceId}`);
}
