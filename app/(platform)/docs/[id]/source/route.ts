import fs from "node:fs/promises";
import path from "node:path";
import { notFound } from "next/navigation";
import { NextResponse } from "next/server";
import { db } from "@/db/client";
import { documents, documentPermissions } from "@/db/schema";
import { getSession } from "@/lib/auth/session";
import { canAccessMvp } from "@/lib/auth/types";
import { and, eq } from "drizzle-orm";

export const runtime = "nodejs";

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSession();
  if (!session) return new NextResponse("Unauthorized", { status: 401 });
  if (!canAccessMvp(session.role, "docs")) return new NextResponse("Forbidden", { status: 403 });

  const { id } = await params;
  const scope = session.role === "frutas" && session.companyId ? session.companyId : null;
  const [row] = scope
    ? await db
        .select({ doc: documents })
        .from(documents)
        .innerJoin(
          documentPermissions,
          and(eq(documentPermissions.documentId, documents.id), eq(documentPermissions.companyId, scope)),
        )
        .where(eq(documents.id, id))
        .limit(1)
    : await db.select({ doc: documents }).from(documents).where(eq(documents.id, id)).limit(1);

  const doc = row?.doc;
  if (!doc) notFound();

  const filename = sourceFilename(doc.sourcePath, doc.id);
  const originalPdf = await readPdfIfAvailable(doc.sourcePath);
  const data = originalPdf ?? createDemoDocumentPdf({
    id: doc.id,
    kind: doc.kind,
    direction: doc.direction,
    cmrNumber: doc.cmrNumber,
    plate: doc.plate,
    loadedAt: doc.loadedAt,
    deliveredAt: doc.deliveredAt,
    state: doc.state,
    sourcePath: doc.sourcePath,
    ocrText: doc.ocrText,
  });

  return new NextResponse(new Uint8Array(data), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `inline; filename="${filename}"`,
      "Cache-Control": "private, max-age=300",
      "X-Content-Type-Options": "nosniff",
      "X-Lloretrans-Preview": originalPdf ? "original" : "generated-from-document",
      ETag: `"${doc.sourceHash}"`,
    },
  });
}

async function readPdfIfAvailable(sourcePath: string): Promise<Buffer | null> {
  if (!sourcePath.toLowerCase().endsWith(".pdf")) return null;

  const candidates = candidatePdfPaths(sourcePath);
  for (const candidate of candidates) {
    const data = await fs.readFile(candidate).catch(() => null);
    if (data) return data;
  }

  return null;
}

function candidatePdfPaths(sourcePath: string): string[] {
  if (path.isAbsolute(sourcePath)) return [sourcePath];

  const normalized = sourcePath.startsWith("/") ? sourcePath.slice(1) : sourcePath;
  return [path.join(process.cwd(), normalized)];
}

interface DocumentPreview {
  id: string;
  kind: string;
  direction: string;
  cmrNumber: string | null;
  plate: string | null;
  loadedAt: Date | null;
  deliveredAt: Date | null;
  state: string;
  sourcePath: string;
  ocrText: string | null;
}

function createDemoDocumentPdf(doc: DocumentPreview): Buffer {
  const rows = [
    "AiTiPro - preview de documento central",
    "Documento reconstruido a partir dos metadados quando o ficheiro original nao esta no build.",
    "",
    `Tipo: ${documentKindLabel(doc.kind)}    Direccao: ${doc.direction}`,
    `CMR: ${doc.cmrNumber ?? "por validar"}`,
    `Matricula: ${doc.plate ?? "por validar"}`,
    `Data carga: ${formatPdfDate(doc.loadedAt)}    Data entrega: ${formatPdfDate(doc.deliveredAt)}`,
    `Estado: ${documentStateLabel(doc.state)}`,
    `Origem: ${truncatePdfText(doc.sourcePath, 86)}`,
    "",
    "Texto OCR / leitura inicial",
    truncatePdfText(doc.ocrText ?? "sem texto extraido", 96),
    "",
    "Validacao humana",
    "Confirmar metadados, associar a viagem correcta e manter o comprovativo pesquisavel por matricula, CMR e empresa.",
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

function sourceFilename(sourcePath: string, id: string): string {
  const base = path.basename(sourcePath);
  const withoutQuery = base.split("?")[0]?.trim();
  if (withoutQuery && withoutQuery.toLowerCase().endsWith(".pdf")) return withoutQuery;
  return `documento-${id}.pdf`;
}

function formatPdfDate(value: Date | null): string {
  return value ? value.toISOString().slice(0, 10) : "por validar";
}

function documentKindLabel(kind: string): string {
  const labels: Record<string, string> = {
    cmr: "CMR",
    guia_remessa: "Guia de remessa",
    guia_recepcao: "Guia de recepcao",
    ticket_frio: "Ticket frio",
    controlo_tara: "Controlo de tara",
  };
  return labels[kind] ?? kind;
}

function documentStateLabel(state: string): string {
  const labels: Record<string, string> = {
    associated: "Associado",
    orphan: "A associar",
    pending_association: "A associar",
  };
  return labels[state] ?? state;
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
