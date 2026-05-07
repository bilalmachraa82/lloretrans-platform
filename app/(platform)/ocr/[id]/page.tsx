import { notFound } from "next/navigation";
import Link from "next/link";
import { db } from "@/db/client";
import {
  invoices,
  invoiceLines,
  suppliers,
  serviceCodes,
  workCodes,
  supplierRules,
  auditLog,
  users,
} from "@/db/schema";
import { and, eq, desc } from "drizzle-orm";
import { requireRole } from "@/lib/auth/session";
import { isSuperAdminRole } from "@/lib/auth/types";
import { PageHeader } from "@/components/ui/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { StatusPill } from "@/components/ui/status-pill";
import { Input } from "@/components/ui/input";
import { formatEur } from "@/lib/money";
import { formatDate, formatDateTime } from "@/lib/dates";
import { formatServiceLabel } from "@/lib/service-labels";
import { approveInvoice, reopenInvoice, exportInvoiceAction, updateClassification } from "./actions";

function canPreviewPdf(sourcePath: string | null): boolean {
  return Boolean(sourcePath?.startsWith("/fixtures/real-invoices/") && sourcePath.toLowerCase().endsWith(".pdf"));
}

export default async function InvoiceDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const session = await requireRole(["admin", "clarice", "admin_oficina", "admin_contas"]);
  const { id } = await params;

  const inv = await db
    .select({
      id: invoices.id,
      number: invoices.invoiceNumber,
      issuedAt: invoices.issuedAt,
      dueAt: invoices.dueAt,
      totalNet: invoices.totalNet,
      totalVat: invoices.totalVat,
      totalGross: invoices.totalGross,
      plate: invoices.plate,
      serviceCode: invoices.serviceCode,
      workCode: invoices.workCode,
      state: invoices.state,
      confidence: invoices.confidenceAvg,
      sourcePath: invoices.sourcePath,
      supplierId: invoices.supplierId,
      supplierName: suppliers.name,
      supplierTaxId: suppliers.taxId,
      supplierCategory: suppliers.category,
      approvedAt: invoices.approvedAt,
      exportedAt: invoices.exportedAt,
    })
    .from(invoices)
    .leftJoin(suppliers, eq(suppliers.id, invoices.supplierId))
    .where(eq(invoices.id, id))
    .limit(1);

  const row = inv[0];
  if (!row) notFound();

  const [lines, services, works, rules, audits] = await Promise.all([
    db.select().from(invoiceLines).where(eq(invoiceLines.invoiceId, id)).orderBy(invoiceLines.lineNumber),
    db.select().from(serviceCodes),
    db.select().from(workCodes),
    row.supplierId
      ? db.select().from(supplierRules).where(eq(supplierRules.supplierId, row.supplierId))
      : Promise.resolve([]),
    db
      .select({
        id: auditLog.id,
        action: auditLog.action,
        before: auditLog.before,
        after: auditLog.after,
        reason: auditLog.reason,
        createdAt: auditLog.createdAt,
        userName: users.name,
      })
      .from(auditLog)
      .leftJoin(users, eq(users.id, auditLog.userId))
      .where(and(eq(auditLog.entityType, "invoice"), eq(auditLog.entityId, id)))
      .orderBy(desc(auditLog.createdAt))
      .limit(20),
  ]);

  const isPendingReview = row.state === "pending_review";
  const isApproved = row.state === "approved" || row.state === "exported";
  const canApproveOrClassify = isSuperAdminRole(session.role) || session.role === "admin_oficina";
  const canExport = isSuperAdminRole(session.role) || session.role === "admin_oficina" || session.role === "admin_contas";
  const documentPreviewUrl = canPreviewPdf(row.sourcePath) ? `/ocr/${row.id}/source#toolbar=0&navpanes=0&view=FitH` : null;

  return (
    <div className="space-y-6">
      <PageHeader
        title={`Factura ${row.number ?? row.id}`}
        description={`${row.supplierName ?? "Fornecedor"} · ${formatDate(row.issuedAt)}`}
        actions={
          <div className="flex gap-2">
            <Button variant="outline" asChild>
              <Link href="/ocr">Voltar</Link>
            </Button>
            {isPendingReview && canApproveOrClassify && (
              <form action={approveInvoice}>
                <input type="hidden" name="invoiceId" value={row.id} />
                <Button type="submit" variant="success">
                  Aprovar
                </Button>
              </form>
            )}
            {isApproved && canApproveOrClassify && (
              <form action={reopenInvoice}>
                <input type="hidden" name="invoiceId" value={row.id} />
                <Button type="submit" variant="outline">
                  Reabrir
                </Button>
              </form>
            )}
            {row.state === "approved" && canExport && (
              <form action={exportInvoiceAction}>
                <input type="hidden" name="invoiceId" value={row.id} />
                <Button type="submit">Exportar XML PHC Advanced</Button>
              </form>
            )}
          </div>
        }
      />

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Documento original</CardTitle>
              <Badge variant="secondary">Documento recebido</Badge>
            </div>
          </CardHeader>
          <CardContent>
            {documentPreviewUrl ? (
              <div className="overflow-hidden rounded-lg border border-border bg-white shadow-sm">
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border bg-[#f8fafc] px-3 py-2">
                  <div className="min-w-0">
                    <div className="text-xs font-semibold uppercase tracking-[0.12em] text-muted-foreground">
                      PDF original
                    </div>
                    <div className="truncate font-mono text-xs text-[#1e2d3d]">{row.sourcePath}</div>
                  </div>
                  <Button variant="outline" size="sm" asChild>
                    <a href={`/ocr/${row.id}/source`} target="_blank" rel="noreferrer">
                      Abrir PDF
                    </a>
                  </Button>
                </div>
                <iframe
                  title={`Pré-visualização da factura ${row.number ?? row.id}`}
                  src={documentPreviewUrl}
                  className="h-[78vh] min-h-[720px] w-full bg-white"
                />
              </div>
            ) : (
              <div className="aspect-[3/4] rounded-md border border-dashed border-border bg-secondary/50 grid place-items-center text-sm text-muted-foreground p-6 text-center">
                <div>
                  <div className="font-semibold text-foreground">Factura disponível para validação</div>
                  <div className="mt-2 max-w-xs leading-relaxed">
                    Pré-visualização indisponível porque este registo não aponta para um PDF local do piloto.
                    Fonte importada: <span className="font-mono text-foreground">{row.sourcePath ?? "ficheiro anexado"}</span>.
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between text-base">
                Classificação proposta
                {row.confidence != null && (
                  <StatusPill
                    status={row.confidence >= 0.9 ? "green" : row.confidence >= 0.75 ? "yellow" : "red"}
                  >
                    {(row.confidence * 100).toFixed(0)}% confiança
                  </StatusPill>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form action={updateClassification} className="space-y-3">
                <input type="hidden" name="invoiceId" value={row.id} />
                <Field label="Fornecedor">
                  <div className="text-sm">
                    {row.supplierName} <span className="text-muted-foreground">· NIF {row.supplierTaxId}</span>
                  </div>
                </Field>
                <Field label="Matrícula">
                  <Input
                    name="plate"
                    defaultValue={row.plate ?? ""}
                    disabled={isApproved || !canApproveOrClassify}
                    className="font-mono text-sm"
                  />
                </Field>
                <Field label="Código de serviço">
                  <select
                    name="serviceCode"
                    defaultValue={row.serviceCode ?? ""}
                    disabled={isApproved || !canApproveOrClassify}
                    className="h-9 w-full rounded-md border border-border bg-background px-3 text-sm"
                  >
                    <option value="">— escolher —</option>
                    {services.map((s) => (
                      <option key={s.code} value={s.code}>
                        {s.code} · {formatServiceLabel(s.label)}
                      </option>
                    ))}
                  </select>
                </Field>
                <Field label="Código de obra">
                  <select
                    name="workCode"
                    defaultValue={row.workCode ?? ""}
                    disabled={isApproved || !canApproveOrClassify}
                    className="h-9 w-full rounded-md border border-border bg-background px-3 text-sm"
                  >
                    <option value="">— escolher —</option>
                    {works.map((w) => (
                      <option key={w.code} value={w.code}>
                        {w.code} · {w.label}
                      </option>
                    ))}
                  </select>
                </Field>
                <Field label="Motivo (se correção)">
                  <Input name="reason" placeholder="ex: Selcar só trabalha sistemas de frio" disabled={isApproved || !canApproveOrClassify} />
                </Field>
                {!isApproved && canApproveOrClassify && (
                  <Button type="submit" variant="outline" className="w-full">
                    Guardar + aprender regra
                  </Button>
                )}
              </form>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Totais extraídos</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-3 gap-3 text-sm">
                <Kv label="Base" value={formatEur(row.totalNet)} />
                <Kv label="IVA" value={formatEur(row.totalVat)} />
                <Kv label="Total" value={formatEur(row.totalGross)} strong />
              </div>
              <div className="mt-3 grid grid-cols-2 gap-3 text-sm">
                <Kv label="Emissão" value={formatDate(row.issuedAt)} />
                <Kv label="Vencimento" value={formatDate(row.dueAt)} />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Linhas ({lines.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="data-table">
              <thead>
                <tr>
                  <th className="w-10">#</th>
                  <th>Descrição</th>
                  <th>Código</th>
                  <th className="text-right">Qt</th>
                  <th className="text-right">Unit</th>
                  <th className="text-right">IVA%</th>
                  <th className="text-right">Total</th>
                  <th>Conf.</th>
                </tr>
              </thead>
              <tbody>
                {lines.map((l) => (
                  <tr key={l.id}>
                    <td className="font-mono">{l.lineNumber}</td>
                    <td>{l.description}</td>
                    <td className="font-mono text-xs">{l.serviceCode ?? "—"}</td>
                    <td className="text-right font-mono">{l.quantity?.toFixed(2) ?? "—"}</td>
                    <td className="text-right font-mono">{formatEur(l.unitPrice)}</td>
                    <td className="text-right font-mono">{l.vatRate?.toFixed(0)}%</td>
                    <td className="text-right font-mono">{formatEur(l.total)}</td>
                    <td>
                      {l.confidence != null && (
                        <StatusPill status={l.confidence >= 0.9 ? "green" : "yellow"}>
                          {(l.confidence * 100).toFixed(0)}%
                        </StatusPill>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Regras aprendidas do fornecedor ({rules.length})</CardTitle>
          </CardHeader>
          <CardContent>
            {rules.length === 0 ? (
              <div className="text-sm text-muted-foreground">Sem regras ainda. Ao corrigir este fornecedor, cria-se regra automática.</div>
            ) : (
              <ul className="space-y-2 text-sm">
                {rules.map((r) => (
                  <li key={r.id} className="flex items-center justify-between border-b border-border pb-1 last:border-0">
                    <div>
                      <span className="font-mono text-xs">{r.field}</span>
                      <span className="mx-2 text-muted-foreground">→</span>
                      <span className="font-semibold">{r.value}</span>
                    </div>
                    <Badge variant="secondary">{r.hitCount} aplicações</Badge>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Histórico de alterações</CardTitle>
          </CardHeader>
          <CardContent>
            {audits.length === 0 ? (
              <div className="text-sm text-muted-foreground">
                Sem alterações humanas ainda. Cada correcção cria entrada imutável.
              </div>
            ) : (
              <ul className="space-y-3 text-sm">
                {audits.map((a) => (
                  <li key={a.id} className="border-b border-border pb-2 last:border-0">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-medium">{invoiceAuditLabel(a.action)}</span>
                      <span className="text-xs text-muted-foreground">{formatDateTime(a.createdAt)}</span>
                    </div>
                    <div className="text-xs text-muted-foreground mt-0.5">
                      {a.userName ?? "—"} · {a.reason ?? "(sem motivo)"}
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1">
      <label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">{label}</label>
      {children}
    </div>
  );
}

function Kv({ label, value, strong = false }: { label: string; value: string; strong?: boolean }) {
  return (
    <div>
      <div className="text-xs text-muted-foreground">{label}</div>
      <div className={`font-mono ${strong ? "text-base font-semibold" : "text-sm"}`}>{value}</div>
    </div>
  );
}

function invoiceAuditLabel(action: string): string {
  if (action === "invoice.upload") return "Factura recebida";
  if (action === "invoice.approve") return "Factura aprovada";
  if (action === "invoice.reopen") return "Factura reaberta";
  if (action === "invoice.export") return "Preparação PHC Advanced";
  if (action === "invoice.classify") return "Classificação ajustada";
  return action;
}
