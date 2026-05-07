import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { notFound } from "next/navigation";
import { NextResponse } from "next/server";
import { db } from "@/db/client";
import { invoiceLines, invoices } from "@/db/schema";
import { getSession } from "@/lib/auth/session";
import { canAccessMvp } from "@/lib/auth/types";
import { eq } from "drizzle-orm";

export const runtime = "nodejs";

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSession();
  if (!session) return new NextResponse("Unauthorized", { status: 401 });
  if (!canAccessMvp(session.role, "ocr")) return new NextResponse("Forbidden", { status: 403 });

  const { id } = await params;
  const [invoice] = await db
    .select({
      id: invoices.id,
      sourcePath: invoices.sourcePath,
      sourceHash: invoices.sourceHash,
      supplierNameRaw: invoices.supplierNameRaw,
      supplierTaxIdRaw: invoices.supplierTaxIdRaw,
      invoiceNumber: invoices.invoiceNumber,
      issuedAt: invoices.issuedAt,
      totalNet: invoices.totalNet,
      totalVat: invoices.totalVat,
      totalGross: invoices.totalGross,
      currency: invoices.currency,
      plate: invoices.plate,
      serviceCode: invoices.serviceCode,
      workCode: invoices.workCode,
      confidenceAvg: invoices.confidenceAvg,
    })
    .from(invoices)
    .where(eq(invoices.id, id))
    .limit(1);

  if (!invoice) notFound();
  const source = resolveLocalInvoiceSource(invoice.sourcePath);
  if (!source) notFound();

  const lines = await db
    .select({
      lineNumber: invoiceLines.lineNumber,
      description: invoiceLines.description,
      quantity: invoiceLines.quantity,
      total: invoiceLines.total,
      serviceCode: invoiceLines.serviceCode,
    })
    .from(invoiceLines)
    .where(eq(invoiceLines.invoiceId, id))
    .orderBy(invoiceLines.lineNumber);

  const originalPdf = await readInvoicePdf(source);
  const data = originalPdf ?? createDemoInvoicePdf(invoice, lines);

  return new NextResponse(new Uint8Array(data), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `inline; filename="${source.filename}"`,
      "Cache-Control": "private, max-age=300",
      "X-Content-Type-Options": "nosniff",
      "X-Lloretrans-Preview": originalPdf ? "original" : "generated-from-ocr",
      ETag: `"${invoice.sourceHash}"`,
    },
  });
}

async function readInvoicePdf(source: { candidatePaths: string[]; filename: string }): Promise<Buffer | null> {
  for (const candidate of source.candidatePaths) {
    const data = await fs.readFile(candidate).catch(() => null);
    if (data) return data;
  }

  const remote = await fetch(
    `https://raw.githubusercontent.com/bilalmachraa82/lloretrans-platform/main/fixtures/real-invoices/${source.filename}`,
    { cache: "force-cache" },
  ).catch(() => null);
  if (remote?.ok) {
    return Buffer.from(await remote.arrayBuffer());
  }

  return null;
}

interface InvoicePreview {
  id: string;
  supplierNameRaw: string | null;
  supplierTaxIdRaw: string | null;
  invoiceNumber: string | null;
  issuedAt: Date | null;
  totalNet: number | null;
  totalVat: number | null;
  totalGross: number | null;
  currency: string;
  plate: string | null;
  serviceCode: string | null;
  workCode: string | null;
  confidenceAvg: number | null;
}

function createDemoInvoicePdf(
  invoice: InvoicePreview,
  lines: {
    lineNumber: number;
    description: string;
    quantity: number | null;
    total: number | null;
    serviceCode: string | null;
  }[],
): Buffer {
  const rows = [
    "AiTiPro - preview de factura para validacao",
    "Documento reconstruido a partir dos campos OCR quando o PDF real nao esta no build.",
    "",
    `Factura: ${invoice.invoiceNumber ?? invoice.id}`,
    `Fornecedor: ${invoice.supplierNameRaw ?? "por validar"}`,
    `NIF: ${invoice.supplierTaxIdRaw ?? "por validar"}`,
    `Emissao: ${invoice.issuedAt ? invoice.issuedAt.toISOString().slice(0, 10) : "por validar"}`,
    `Matricula: ${invoice.plate ?? "por validar"}`,
    `Servico: ${invoice.serviceCode ?? "por validar"}    Obra: ${invoice.workCode ?? "por validar"}`,
    `Confianca OCR: ${invoice.confidenceAvg != null ? `${Math.round(invoice.confidenceAvg * 100)}%` : "por validar"}`,
    "",
    "Totais extraidos",
    `Liquido: ${formatPdfMoney(invoice.totalNet, invoice.currency)}    IVA: ${formatPdfMoney(invoice.totalVat, invoice.currency)}    Total: ${formatPdfMoney(invoice.totalGross, invoice.currency)}`,
    "",
    "Linhas",
    ...lines.slice(0, 10).map((line) =>
      `${line.lineNumber}. ${truncatePdfText(line.description, 72)} | qtd ${line.quantity ?? "-"} | ${formatPdfMoney(line.total, invoice.currency)} | ${line.serviceCode ?? "-"}`,
    ),
    "",
    "Validacao humana: confirmar fornecedor, matricula, codigo de servico e exportacao PHC Advanced.",
  ];

  return makeSimplePdf(rows);
}

function makeSimplePdf(rows: string[]): Buffer {
  const content = [
    "BT",
    "/F1 16 Tf",
    "50 792 Td",
    `(${escapePdfText(rows[0] ?? "AiTiPro")}) Tj`,
    "/F1 9 Tf",
    ...rows.slice(1).flatMap((row) => ["0 -18 Td", `(${escapePdfText(row)}) Tj`]),
    "ET",
  ].join("\n");
  const objects = [
    "<< /Type /Catalog /Pages 2 0 R >>",
    "<< /Type /Pages /Kids [3 0 R] /Count 1 >>",
    "<< /Type /Page /Parent 2 0 R /MediaBox [0 0 595 842] /Resources << /Font << /F1 4 0 R >> >> /Contents 5 0 R >>",
    "<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>",
    `<< /Length ${Buffer.byteLength(content, "ascii")} >>\nstream\n${content}\nendstream`,
  ];
  let pdf = "%PDF-1.4\n";
  const offsets = [0];
  objects.forEach((object, index) => {
    offsets.push(Buffer.byteLength(pdf, "ascii"));
    pdf += `${index + 1} 0 obj\n${object}\nendobj\n`;
  });
  const xrefOffset = Buffer.byteLength(pdf, "ascii");
  pdf += `xref\n0 ${objects.length + 1}\n0000000000 65535 f \n`;
  offsets.slice(1).forEach((offset) => {
    pdf += `${String(offset).padStart(10, "0")} 00000 n \n`;
  });
  pdf += `trailer\n<< /Size ${objects.length + 1} /Root 1 0 R >>\nstartxref\n${xrefOffset}\n%%EOF\n`;
  return Buffer.from(pdf, "ascii");
}

function formatPdfMoney(value: number | null, currency: string): string {
  if (value == null || !Number.isFinite(value)) return "-";
  return `${value.toFixed(2)} ${currency}`;
}

function truncatePdfText(value: string, maxLength: number): string {
  const normalized = normalizePdfText(value);
  return normalized.length > maxLength ? `${normalized.slice(0, maxLength - 1)}...` : normalized;
}

function escapePdfText(value: string): string {
  return normalizePdfText(value).replaceAll("\\", "\\\\").replaceAll("(", "\\(").replaceAll(")", "\\)");
}

function normalizePdfText(value: string): string {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^\x20-\x7E]/g, "?");
}

function resolveLocalInvoiceSource(sourcePath: string): { candidatePaths: string[]; filename: string } | null {
  if (!sourcePath.startsWith("/fixtures/real-invoices/")) return null;

  const filename = path.basename(sourcePath);
  if (!filename.toLowerCase().endsWith(".pdf")) return null;

  const fixtureRoot = path.join(process.cwd(), "fixtures", "real-invoices");
  const projectPath = path.resolve(fixtureRoot, filename);
  if (!projectPath.startsWith(`${fixtureRoot}${path.sep}`)) return null;

  const moduleDir = path.dirname(fileURLToPath(import.meta.url));
  const bundledPath = path.resolve(moduleDir, "../../../../../../../fixtures/real-invoices", filename);

  return { candidatePaths: [projectPath, bundledPath], filename };
}
