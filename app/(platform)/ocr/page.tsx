import Link from "next/link";
import { db } from "@/db/client";
import { invoices, suppliers } from "@/db/schema";
import { desc, eq, count } from "drizzle-orm";
import { requireRole } from "@/lib/auth/session";
import { PageHeader } from "@/components/ui/page-header";
import { Card, CardContent } from "@/components/ui/card";
import { StatusPill } from "@/components/ui/status-pill";
import { Button } from "@/components/ui/button";
import { formatEur } from "@/lib/money";
import { formatDate } from "@/lib/dates";
import { Upload } from "lucide-react";

const STATE_LABELS: Record<string, { label: string; pill: "green" | "yellow" | "red" | "neutral" }> = {
  pending_ocr: { label: "A extrair", pill: "neutral" },
  pending_review: { label: "A validar", pill: "yellow" },
  approved: { label: "Aprovada", pill: "green" },
  exported: { label: "Exportada PHC Advanced", pill: "green" },
};

export default async function OcrListPage({
  searchParams,
}: {
  searchParams: Promise<{ state?: string }>;
}) {
  await requireRole(["admin", "clarice", "admin_oficina", "admin_contas"]);
  const { state } = await searchParams;

  const whereClause = state ? eq(invoices.state, state) : undefined;

  const rows = await db
    .select({
      id: invoices.id,
      number: invoices.invoiceNumber,
      supplierName: suppliers.name,
      supplierCategory: suppliers.category,
      issuedAt: invoices.issuedAt,
      totalGross: invoices.totalGross,
      plate: invoices.plate,
      serviceCode: invoices.serviceCode,
      state: invoices.state,
      confidence: invoices.confidenceAvg,
    })
    .from(invoices)
    .leftJoin(suppliers, eq(suppliers.id, invoices.supplierId))
    .where(whereClause)
    .orderBy(desc(invoices.createdAt))
    .limit(100);

  const counts = await db
    .select({ state: invoices.state, n: count() })
    .from(invoices)
    .groupBy(invoices.state);
  const byState: Record<string, number> = {};
  counts.forEach((c) => (byState[c.state] = c.n));

  return (
    <div className="space-y-6">
      <PageHeader
        title="OCR Facturas de Fornecedor"
        description={`${rows.length} facturas mostradas · Módulo B · 9 facturas reais usadas para ensinar regras por fornecedor · sem lote sintético`}
        actions={
          <Button asChild>
            <Link href="/ocr/upload">
              <Upload className="h-4 w-4" />
              Upload factura
            </Link>
          </Button>
        }
      />

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {Object.entries(STATE_LABELS).map(([key, { label }]) => (
          <Link key={key} href={`/ocr?state=${key}`}>
            <Card className={`transition-colors hover:border-primary/60 ${state === key ? "border-primary" : ""}`}>
              <CardContent className="p-4">
                <div className="text-xs text-muted-foreground">{label}</div>
                <div className="text-2xl font-semibold font-mono">{byState[key] ?? 0}</div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      {state && (
        <div className="flex items-center gap-2">
          <Link href="/ocr" className="text-sm underline">
            Limpar filtro
          </Link>
        </div>
      )}

      <Card>
        <div className="overflow-x-auto">
          <table className="data-table">
            <thead>
              <tr>
                <th>Nº</th>
                <th>Fornecedor</th>
                <th>Data</th>
                <th>Matrícula</th>
                <th>Serviço</th>
                <th className="text-right">Total</th>
                <th>Confiança</th>
                <th>Estado</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.id}>
                  <td className="font-mono text-xs">{r.number}</td>
                  <td>
                    <div className="font-medium">{r.supplierName ?? "—"}</div>
                    <div className="text-xs text-muted-foreground">{r.supplierCategory ?? ""}</div>
                  </td>
                  <td>{formatDate(r.issuedAt)}</td>
                  <td className="font-mono text-xs">{r.plate ?? "—"}</td>
                  <td>{r.serviceCode ?? "—"}</td>
                  <td className="text-right font-mono">{formatEur(r.totalGross)}</td>
                  <td>
                    {r.confidence != null ? (
                      <StatusPill status={r.confidence >= 0.9 ? "green" : r.confidence >= 0.75 ? "yellow" : "red"}>
                        {(r.confidence * 100).toFixed(0)}%
                      </StatusPill>
                    ) : (
                      "—"
                    )}
                  </td>
                  <td>
                    <StatusPill status={STATE_LABELS[r.state]?.pill ?? "neutral"}>
                      {STATE_LABELS[r.state]?.label ?? r.state}
                    </StatusPill>
                  </td>
                  <td>
                    <Button size="sm" variant="outline" asChild>
                      <Link href={`/ocr/${r.id}`}>Abrir</Link>
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
