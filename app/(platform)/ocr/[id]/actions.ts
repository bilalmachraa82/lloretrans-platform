"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { db } from "@/db/client";
import { invoiceLines, invoices, suppliers, supplierRules } from "@/db/schema";
import { and, eq } from "drizzle-orm";
import { requireRole } from "@/lib/auth/session";
import { audit } from "@/lib/audit";
import { randomId } from "@/lib/utils";

export async function approveInvoice(formData: FormData): Promise<void> {
  const session = await requireRole(["admin", "admin_oficina"]);
  const invoiceId = formData.get("invoiceId")?.toString();
  if (!invoiceId) throw new Error("invoiceId required");

  const [before] = await db.select().from(invoices).where(eq(invoices.id, invoiceId)).limit(1);
  if (!before) throw new Error("not found");
  if (before.state !== "pending_review") {
    throw new Error(`Estado actual (${before.state}) não permite aprovação`);
  }

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
    .set({ state: "pending_review", approvedBy: null, approvedAt: null, exportedAt: null, updatedAt: new Date() })
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

  const [before] = await db.select().from(invoices).where(eq(invoices.id, invoiceId)).limit(1);
  if (!before) throw new Error("not found");
  if (before.state !== "approved") {
    throw new Error(`Factura tem de estar aprovada antes de exportar (estado actual: ${before.state})`);
  }

  const [supplier] = before.supplierId
    ? await db
        .select({
          name: suppliers.name,
          taxId: suppliers.taxId,
        })
        .from(suppliers)
        .where(eq(suppliers.id, before.supplierId))
        .limit(1)
    : [null];

  const lines = await db.select().from(invoiceLines).where(eq(invoiceLines.invoiceId, invoiceId)).orderBy(invoiceLines.lineNumber);
  const xml = buildPhcInvoiceXml({
    invoice: before,
    supplier: supplier ?? null,
    lines,
  });
  const filename = `phc-factura-${safeFilename(before.invoiceNumber ?? invoiceId)}.xml`;
  const dataUrl = `data:application/xml;charset=utf-8;base64,${Buffer.from(xml, "utf-8").toString("base64")}`;

  await db
    .update(invoices)
    .set({ state: "exported", exportedAt: new Date(), updatedAt: new Date() })
    .where(eq(invoices.id, invoiceId));

  await audit({
    userId: session.userId,
    action: "invoice.export",
    entityType: "invoice",
    entityId: invoiceId,
    before: { state: before.state },
    after: { format: "xml-phc", filename, lines: lines.length },
  });
  revalidatePath(`/ocr/${invoiceId}`);
  revalidatePath("/ocr");
  redirect(dataUrl);
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

function buildPhcInvoiceXml({
  invoice,
  supplier,
  lines,
}: {
  invoice: typeof invoices.$inferSelect;
  supplier: { name: string; taxId: string | null } | null;
  lines: Array<typeof invoiceLines.$inferSelect>;
}): string {
  const emittedAt = new Date().toISOString();
  const invoiceDate = invoice.issuedAt?.toISOString().slice(0, 10) ?? "";
  const dueDate = invoice.dueAt?.toISOString().slice(0, 10) ?? "";
  const bodyLines = lines
    .map(
      (line) => `    <Linha>
      <Numero>${line.lineNumber}</Numero>
      <Descricao>${xmlEscape(line.description)}</Descricao>
      <Quantidade>${formatXmlNumber(line.quantity, 3)}</Quantidade>
      <PrecoUnitario>${formatXmlNumber(line.unitPrice, 4)}</PrecoUnitario>
      <Total>${formatXmlNumber(line.total, 2)}</Total>
    </Linha>`,
    )
    .join("\n");

  return `<?xml version="1.0" encoding="UTF-8"?>
<FacturaFornecedorExport>
  <Origem>AiTiPro Lloretrans</Origem>
  <EmitidoEm>${emittedAt}</EmitidoEm>
  <Factura>
    <Id>${xmlEscape(invoice.id)}</Id>
    <Numero>${xmlEscape(invoice.invoiceNumber ?? "")}</Numero>
    <Data>${invoiceDate}</Data>
    <Vencimento>${dueDate}</Vencimento>
    <Fornecedor>
      <Nome>${xmlEscape(supplier?.name ?? "")}</Nome>
      <NIF>${xmlEscape(supplier?.taxId ?? "")}</NIF>
    </Fornecedor>
    <Matrícula>${xmlEscape(invoice.plate ?? "")}</Matrícula>
    <Servico>${xmlEscape(invoice.serviceCode ?? "")}</Servico>
    <Obra>${xmlEscape(invoice.workCode ?? "")}</Obra>
    <Totais>
      <Base>${formatXmlNumber(invoice.totalNet, 2)}</Base>
      <IVA>${formatXmlNumber(invoice.totalVat, 2)}</IVA>
      <Total>${formatXmlNumber(invoice.totalGross, 2)}</Total>
    </Totais>
  </Factura>
  <Linhas>
${bodyLines}
  </Linhas>
</FacturaFornecedorExport>
`;
}

function xmlEscape(value: string): string {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&apos;");
}

function formatXmlNumber(value: number | null, decimals: number): string {
  return (value ?? 0).toFixed(decimals);
}

function safeFilename(value: string): string {
  return value.normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-zA-Z0-9_.-]+/g, "-").replace(/^-+|-+$/g, "") || "factura";
}
