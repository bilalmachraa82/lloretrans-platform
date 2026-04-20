import { notFound } from "next/navigation";
import Link from "next/link";
import { db } from "@/db/client";
import {
  freightLoads,
  freightStateTransitions,
  supplierInvoicesFreight,
  clientInvoicesFreight,
  commissions,
  commissionRules,
  clients,
  suppliers,
  users,
} from "@/db/schema";
import { and, desc, eq } from "drizzle-orm";
import { requireRole } from "@/lib/auth/session";
import { PageHeader } from "@/components/ui/page-header";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { StatusPill } from "@/components/ui/status-pill";
import { Input } from "@/components/ui/input";
import { formatEur, formatPercent } from "@/lib/money";
import { formatDate, formatDateTime } from "@/lib/dates";
import { STATE_LABELS, nextStates, rollbackStates, type FreightState } from "@/lib/freight-state";
import {
  transitionState,
  registerSupplierInvoice,
  registerClientInvoice,
  markPaid,
} from "../actions";

export default async function LoadDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const session = await requireRole(["admin", "clarice", "comercial", "admin_faturacao", "admin_contas"]);
  const { id } = await params;

  const [row] = await db
    .select({
      id: freightLoads.id,
      reference: freightLoads.reference,
      state: freightLoads.state,
      origin: freightLoads.origin,
      destination: freightLoads.destination,
      loadedAt: freightLoads.loadedAt,
      deliveredAt: freightLoads.deliveredAt,
      plate: freightLoads.plate,
      priceBuy: freightLoads.priceBuy,
      priceSell: freightLoads.priceSell,
      margin: freightLoads.margin,
      marginPct: freightLoads.marginPct,
      currency: freightLoads.currency,
      notes: freightLoads.notes,
      salespersonId: freightLoads.salespersonId,
      clientName: clients.name,
      clientCountry: clients.country,
      clientTerms: clients.paymentTermsDays,
      supplierName: suppliers.name,
      salesName: users.name,
      createdAt: freightLoads.createdAt,
    })
    .from(freightLoads)
    .leftJoin(clients, eq(clients.id, freightLoads.clientId))
    .leftJoin(suppliers, eq(suppliers.id, freightLoads.supplierId))
    .leftJoin(users, eq(users.id, freightLoads.salespersonId))
    .where(eq(freightLoads.id, id))
    .limit(1);
  if (!row) notFound();

  const [transitions, supInv, cliInv, comm, rules] = await Promise.all([
    db
      .select()
      .from(freightStateTransitions)
      .where(eq(freightStateTransitions.loadId, id))
      .orderBy(desc(freightStateTransitions.createdAt)),
    db.select().from(supplierInvoicesFreight).where(eq(supplierInvoicesFreight.loadId, id)),
    db.select().from(clientInvoicesFreight).where(eq(clientInvoicesFreight.loadId, id)),
    db.select().from(commissions).where(eq(commissions.loadId, id)),
    db.select().from(commissionRules),
  ]);

  const currentState = row.state as FreightState;
  const rule =
    rules.find((r) => r.salespersonId === row.salespersonId) ?? rules.find((r) => r.salespersonId == null);
  const commPreview = rule ? row.margin * rule.percentOfMargin : null;

  const hasDeviation = supInv.some((s) => s.state === "deviation_detected");
  const hasOverdue = cliInv.some((s) => !s.paidAt && s.dueAt < new Date());

  return (
    <div className="space-y-6">
      <PageHeader
        title={`Carga ${row.reference}`}
        description={`${row.origin} → ${row.destination} · ${row.clientName} (${row.clientCountry})`}
        actions={<Button variant="outline" asChild><Link href="/bolsa">← Voltar</Link></Button>}
      />

      {(hasDeviation || hasOverdue) && (
        <div className="rounded-md border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm space-y-1">
          {hasDeviation && <div>⚠️ Factura fornecedor com desvio &gt; 5% vs acordado.</div>}
          {hasOverdue && <div>⚠️ Factura cliente com data de pagamento ultrapassada.</div>}
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-base">Resumo</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4 sm:grid-cols-3 text-sm">
            <Kv label="Estado" value={STATE_LABELS[currentState]} />
            <Kv label="Comercial" value={row.salesName ?? "—"} />
            <Kv label="Criada" value={formatDate(row.createdAt)} />
            <Kv label="Fornecedor" value={row.supplierName ?? "—"} />
            <Kv label="Matrícula" value={row.plate ?? "externa"} />
            <Kv label="Prazo pag. cliente" value={`${row.clientTerms ?? 60}d`} />
            <Kv label="Preço compra" value={formatEur(row.priceBuy)} />
            <Kv label="Preço venda" value={formatEur(row.priceSell)} />
            <Kv label="Margem" value={`${formatEur(row.margin)} · ${formatPercent(row.marginPct)}`} strong />
            {commPreview != null && (
              <Kv label={`Comissão (${Math.round((rule?.percentOfMargin ?? 0) * 100)}%)`} value={formatEur(commPreview)} />
            )}
            {row.notes && <div className="sm:col-span-3 text-xs text-muted-foreground italic border-t border-border pt-2">{row.notes}</div>}
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="text-base">Transições</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            <div className="space-y-1">
              {nextStates(currentState).map((to) => (
                <form key={to} action={transitionState} className="flex items-center gap-2">
                  <input type="hidden" name="loadId" value={row.id} />
                  <input type="hidden" name="toState" value={to} />
                  <Input name="reason" placeholder="Motivo (opcional)" className="text-xs" />
                  <Button type="submit" size="sm">→ {STATE_LABELS[to]}</Button>
                </form>
              ))}
            </div>
            {rollbackStates(currentState).length > 0 && (
              <div className="pt-2 border-t border-border space-y-1">
                <div className="text-xs text-muted-foreground">Reverter:</div>
                {rollbackStates(currentState).map((to) => (
                  <form key={to} action={transitionState} className="flex items-center gap-2">
                    <input type="hidden" name="loadId" value={row.id} />
                    <input type="hidden" name="toState" value={to} />
                    <Input name="reason" placeholder="Motivo (obrigatório)" required className="text-xs" />
                    <Button type="submit" size="sm" variant="outline">← {STATE_LABELS[to]}</Button>
                  </form>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Factura fornecedor ({supInv.length})</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {supInv.map((s) => (
            <div key={s.id} className="flex items-center justify-between border-b border-border pb-2 last:border-0 text-sm">
              <div>
                <div className="font-mono text-xs">{s.invoiceNumber}</div>
                <div className="text-xs text-muted-foreground">{formatDate(s.issuedAt)}</div>
              </div>
              <div className="text-right">
                <div className="font-mono">{formatEur(s.totalGross)}</div>
                {s.deviation != null && (
                  <div className={`text-xs ${Math.abs(s.deviationPct ?? 0) > 0.05 ? "text-destructive" : "text-muted-foreground"}`}>
                    Desvio {s.deviation > 0 ? "+" : ""}{formatEur(s.deviation)} ({formatPercent(s.deviationPct)})
                  </div>
                )}
              </div>
            </div>
          ))}
          {currentState !== "scheduled" && (
            <form action={registerSupplierInvoice} className="grid grid-cols-4 gap-2 items-end pt-3 border-t border-border">
              <input type="hidden" name="loadId" value={row.id} />
              <Input name="invoiceNumber" placeholder="Nº factura" required />
              <Input name="issuedAt" type="date" required />
              <Input name="totalGross" type="number" step="0.01" min="0.01" placeholder="Total €" required />
              <Button type="submit" size="sm">Registar</Button>
            </form>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Factura cliente ({cliInv.length})</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {cliInv.map((c) => (
            <div key={c.id} className="flex items-center justify-between border-b border-border pb-2 last:border-0 text-sm">
              <div>
                <div className="font-mono text-xs">{c.invoiceNumber}</div>
                <div className="text-xs text-muted-foreground">Emitida {formatDate(c.issuedAt)} · Vence {formatDate(c.dueAt)}</div>
              </div>
              <div className="text-right">
                <div className="font-mono">{formatEur(c.totalGross)}</div>
                <div className={`text-xs ${c.paidAt ? "text-success" : c.dueAt < new Date() ? "text-destructive" : "text-muted-foreground"}`}>
                  {c.paidAt ? `Paga ${formatDate(c.paidAt)}` : c.dueAt < new Date() ? "Em atraso" : "Em curso"}
                </div>
              </div>
            </div>
          ))}
          {currentState === "supplier_invoiced" && (
            <form action={registerClientInvoice} className="grid grid-cols-5 gap-2 items-end pt-3 border-t border-border">
              <input type="hidden" name="loadId" value={row.id} />
              <Input name="invoiceNumber" placeholder="Nº factura" required />
              <Input name="issuedAt" type="date" required />
              <Input name="dueAt" type="date" required />
              <Input name="totalGross" type="number" step="0.01" placeholder="Total €" required />
              <Button type="submit" size="sm">Emitir</Button>
            </form>
          )}
          {currentState === "client_invoiced" && (
            <form action={markPaid} className="flex justify-end pt-3 border-t border-border">
              <input type="hidden" name="loadId" value={row.id} />
              <Button type="submit" size="sm" variant="success">Marcar paga</Button>
            </form>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle className="text-base">Timeline</CardTitle></CardHeader>
        <CardContent>
          <ul className="space-y-2 text-sm">
            {transitions.map((t) => (
              <li key={t.id} className="flex items-start gap-3 border-b border-border pb-2 last:border-0">
                <Badge variant="outline" className="text-[10px]">{STATE_LABELS[t.toState as FreightState]}</Badge>
                <div className="flex-1">
                  <div className="text-xs text-muted-foreground">{formatDateTime(t.createdAt)}</div>
                  {t.reason && <div className="text-xs">{t.reason}</div>}
                </div>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>
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
