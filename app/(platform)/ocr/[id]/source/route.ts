import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { notFound } from "next/navigation";
import { NextResponse } from "next/server";
import { db } from "@/db/client";
import { invoices } from "@/db/schema";
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
    .select({ sourcePath: invoices.sourcePath, sourceHash: invoices.sourceHash })
    .from(invoices)
    .where(eq(invoices.id, id))
    .limit(1);

  if (!invoice) notFound();
  const source = resolveLocalInvoiceSource(invoice.sourcePath);
  if (!source) notFound();

  const data = await readInvoicePdf(source);
  if (!data) notFound();

  return new NextResponse(new Uint8Array(data), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `inline; filename="${source.filename}"`,
      "Cache-Control": "private, max-age=300",
      "X-Content-Type-Options": "nosniff",
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
