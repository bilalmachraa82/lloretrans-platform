import fs from "node:fs/promises";
import path from "node:path";
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

  const data = await fs.readFile(source.absolutePath).catch(() => null);
  if (!data) notFound();

  return new NextResponse(data, {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `inline; filename="${source.filename}"`,
      "Cache-Control": "private, max-age=300",
      "X-Content-Type-Options": "nosniff",
      ETag: `"${invoice.sourceHash}"`,
    },
  });
}

function resolveLocalInvoiceSource(sourcePath: string): { absolutePath: string; filename: string } | null {
  if (!sourcePath.startsWith("/fixtures/real-invoices/")) return null;

  const filename = path.basename(sourcePath);
  if (!filename.toLowerCase().endsWith(".pdf")) return null;

  const fixtureRoot = path.join(process.cwd(), "fixtures", "real-invoices");
  const absolutePath = path.resolve(fixtureRoot, filename);
  if (!absolutePath.startsWith(`${fixtureRoot}${path.sep}`)) return null;

  return { absolutePath, filename };
}
