"use server";

import { redirect } from "next/navigation";
import fs from "node:fs";
import path from "node:path";
import { db } from "@/db/client";
import { invoices, invoiceLines, ocrExtractions, suppliers } from "@/db/schema";
import { eq } from "drizzle-orm";
import { requireRole } from "@/lib/auth/session";
import { audit } from "@/lib/audit";
import { randomId } from "@/lib/utils";

interface CatalogEntry {
  sourceFilename: string;
  fixtureFilename: string;
  filename: string;
  supplier: { name: string; taxId: string };
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

export async function uploadInvoice(formData: FormData): Promise<void> {
  const session = await requireRole(["admin", "clarice", "admin_oficina"]);
  const fixtureFilename = formData.get("fixtureFilename")?.toString();
  const file = formData.get("file");

  if (!fixtureFilename && isUploadedFile(file)) {
    const invId = randomId("inv");
    const now = new Date();
    const filename = file.name || `factura-${Date.now()}.pdf`;

    await db.insert(invoices).values({
      id: invId,
      supplierNameRaw: filename,
      invoiceNumber: `UPLOAD-${Date.now().toString().slice(-6)}`,
      currency: "EUR",
      state: "pending_ocr",
      confidenceAvg: 0,
      sourcePath: `/uploads/manual/${filename}`,
      sourceHash: `manual_${Date.now()}_${filename}`,
      uploadedBy: session.userId,
      createdAt: now,
      updatedAt: now,
    });

    await db.insert(ocrExtractions).values({
      id: randomId("ocr"),
      invoiceId: invId,
      engine: "manual-upload-pending",
      rawText: `Factura recebida: ${filename}. Ficheiro aguarda extracção controlada em armazenamento UE.`,
      rawJson: JSON.stringify({ filename, size: file.size, type: file.type }),
      confidencePerField: JSON.stringify({}),
      createdAt: now,
    });

    await audit({
      userId: session.userId,
      action: "invoice.upload",
      entityType: "invoice",
      entityId: invId,
      after: { filename, engine: "manual-upload-pending", state: "pending_ocr" },
    });

    redirect(`/ocr/${invId}`);
  }

  if (!fixtureFilename) {
    throw new Error("Seleccionar uma factura real processada ou anexar um PDF.");
  }

  const catalogPath = path.join(process.cwd(), "fixtures", "extracted", "_catalog.json");
  const catalog = JSON.parse(fs.readFileSync(catalogPath, "utf-8")) as { entries: CatalogEntry[] };
  const entry = catalog.entries.find((e) => e.fixtureFilename === fixtureFilename);
  if (!entry) throw new Error("Factura real não encontrada");

  const existingSupplier = await db.select().from(suppliers).where(eq(suppliers.taxId, entry.supplier.taxId)).limit(1);
  const supplierId = existingSupplier[0]?.id ?? null;

  const invId = randomId("inv");
  const now = new Date();

  await db.insert(invoices).values({
    id: invId,
    supplierId,
    supplierNameRaw: entry.supplier.name,
    supplierTaxIdRaw: entry.supplier.taxId,
    invoiceNumber: `${entry.invoice.number}-RE${Date.now().toString().slice(-4)}`,
    issuedAt: new Date(entry.invoice.issuedAt),
    dueAt: new Date(entry.invoice.dueAt),
    totalNet: entry.invoice.totalNet,
    totalVat: entry.invoice.totalVat,
    totalGross: entry.invoice.totalGross,
    currency: entry.invoice.currency,
    plate: entry.invoice.plate,
    serviceCode: entry.classification.serviceCode,
    workCode: entry.classification.workCode,
    state: "pending_review",
    confidenceAvg: entry.classification.confidence,
    sourcePath: `/fixtures/real-invoices/${entry.fixtureFilename}`,
    sourceHash: `reupload_${Date.now()}`,
    uploadedBy: session.userId,
    createdAt: now,
    updatedAt: now,
  });

  await db.insert(invoiceLines).values(
    entry.lines.map((l, i) => ({
      id: randomId("il"),
      invoiceId: invId,
      lineNumber: i + 1,
      description: l.description,
      quantity: l.quantity,
      unitPrice: l.unitPrice,
      vatRate: l.vatRate,
      total: l.total,
      serviceCode: l.serviceCode,
      confidence: 0.9 + Math.random() * 0.09,
    })),
  );

  await db.insert(ocrExtractions).values({
    id: randomId("ocr"),
    invoiceId: invId,
    engine: "azure-doc-intel-stub",
    rawText: `[reprocessamento] ${entry.supplier.name} · ${entry.invoice.number}`,
    rawJson: JSON.stringify(entry),
    confidencePerField: JSON.stringify({
      supplier: 0.97,
      total: 0.98,
      plate: entry.invoice.plate ? 0.85 : 0,
      serviceCode: entry.classification.confidence,
    }),
    createdAt: now,
  });

  await audit({
    userId: session.userId,
    action: "invoice.upload",
    entityType: "invoice",
    entityId: invId,
    after: { filename: entry.fixtureFilename, sourceFilename: entry.sourceFilename, engine: "azure-doc-intel-stub" },
  });

  redirect(`/ocr/${invId}`);
}

function isUploadedFile(value: FormDataEntryValue | null): value is File {
  return (
    typeof value === "object" &&
    value !== null &&
    "arrayBuffer" in value &&
    "name" in value &&
    "size" in value &&
    typeof value.size === "number" &&
    value.size > 0
  );
}
