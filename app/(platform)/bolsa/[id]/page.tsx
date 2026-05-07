import { notFound } from "next/navigation";
import Link from "next/link";
import { db } from "@/db/client";
import {
  freightLoads,
  freightStateTransitions,
  supplierInvoicesFreight,
  clientInvoicesFreight,
  commissionRules,
  clients,
  suppliers,
  users,
  vehicles,
} from "@/db/schema";
import { desc, eq } from "drizzle-orm";
import { requireRole } from "@/lib/auth/session";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { formatEur, formatPercent } from "@/lib/money";
import { formatDate, formatDateTime } from "@/lib/dates";
import { STATE_LABELS, nextStates, rollbackStates, type FreightState } from "@/lib/freight-state";
import { computeCommissionAmount } from "@/lib/commission-rule";
import {
  transitionState,
  registerSupplierInvoice,
  registerClientInvoice,
  markPaid,
} from "../actions";
import { ArrowLeft, ArrowRight, BadgeEuro, CircleAlert, Route } from "lucide-react";

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
      trailerPlate: freightLoads.trailerPlate,
      carrierName: freightLoads.carrierName,
      carrierKind: freightLoads.carrierKind,
      cmrNumber: freightLoads.cmrNumber,
      customerInvoiceNumber: freightLoads.customerInvoiceNumber,
      supplierInvoiceNumber: freightLoads.supplierInvoiceNumber,
      paymentRegularization: freightLoads.paymentRegularization,
      paymentMonth: freightLoads.paymentMonth,
      serviceValueEur: freightLoads.serviceValueEur,
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
  if (session.role === "comercial" && row.salespersonId !== session.userId) notFound();

  const [transitions, supInv, cliInv, rules, internalVehicles] = await Promise.all([
    db
      .select()
      .from(freightStateTransitions)
      .where(eq(freightStateTransitions.loadId, id))
      .orderBy(desc(freightStateTransitions.createdAt)),
    db.select().from(supplierInvoicesFreight).where(eq(supplierInvoicesFreight.loadId, id)),
    db.select().from(clientInvoicesFreight).where(eq(clientInvoicesFreight.loadId, id)),
    db.select().from(commissionRules),
    db.select({ plate: vehicles.plate }).from(vehicles).where(eq(vehicles.isInternal, true)),
  ]);

  const currentState = row.state as FreightState;
  const rule =
    rules.find((r) => r.salespersonId === row.salespersonId) ?? rules.find((r) => r.salespersonId == null);
  const commPreview = rule
    ? computeCommissionAmount(
        { margin: row.margin, marginPct: row.marginPct, plate: row.plate, origin: row.origin, destination: row.destination },
        {
          percentOfMargin: rule.percentOfMargin,
          fixedBonusNationalEur: rule.fixedBonusNationalEur,
          fixedBonusInternationalEur: rule.fixedBonusInternationalEur,
          requireInternalVehicle: rule.requireInternalVehicle,
          minMarginPct: rule.minMarginPct ?? 0,
        },
        new Set(internalVehicles.map((v) => v.plate)),
      )
    : null;

  const hasDeviation = supInv.some((s) => s.state === "deviation_detected");
  const hasOverdue = cliInv.some((s) => !s.paidAt && s.dueAt < new Date());
  const nextState = nextStates(currentState)[0];

  return (
    <div className="space-y-6">
      <section className="overflow-hidden rounded-lg border border-[#d8e1df] bg-white shadow-elevated-sm">
        <div className="grid lg:grid-cols-[1fr_380px]">
          <div className="bg-[linear-gradient(135deg,#ffffff_0%,#f8fffc_48%,#eef7ff_100%)] p-6 lg:p-7">
            <div className="flex flex-wrap items-center gap-2">
              <Badge className="border-primary/10 bg-primary/10 text-primary">
                {STATE_LABELS[currentState]}
              </Badge>
              {(hasDeviation || hasOverdue) && (
                <Badge variant="destructive">
                  <CircleAlert className="mr-1 h-3.5 w-3.5" />
                  Atenção
                </Badge>
              )}
              <span className="text-xs font-medium text-muted-foreground">{row.clientCountry ?? "PT"}</span>
            </div>
            <div className="mt-5 flex flex-col gap-5 xl:flex-row xl:items-end xl:justify-between">
              <div>
                <h1 className="font-display text-4xl font-semibold leading-tight tracking-normal text-[#1e2d3d]">
                  Carga {row.reference}
                </h1>
                <div className="mt-3 flex flex-wrap items-center gap-2 text-sm font-medium text-[#4b5563]">
                  <Route className="h-4 w-4 text-muted-foreground" />
                  <span>{row.origin}</span>
                  <ArrowRight className="h-4 w-4 text-muted-foreground" />
                  <span>{row.destination}</span>
                </div>
              </div>
              <Link
                href="/bolsa"
                className="inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-border bg-white px-4 text-sm font-medium shadow-sm hover:bg-secondary"
              >
                <ArrowLeft className="h-4 w-4" />
                Voltar
              </Link>
            </div>
            <div className="mt-6 grid gap-3 sm:grid-cols-3">
              <HeroFact label="Cliente" value={row.clientName ?? "—"} />
              <HeroFact label="Transportador" value={row.carrierName ?? row.supplierName ?? "—"} />
              <HeroFact label="Comercial" value={row.salesName ?? "—"} />
            </div>
          </div>

          <div className="bg-[#1e2d3d] p-6 text-white lg:p-7">
            <div className="flex items-start justify-between gap-4">
              <div>
                <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#2ae5a0]">
                  Margem da carga
                </div>
                <div className={`mt-2 font-mono text-4xl font-semibold ${row.margin < 0 ? "text-[#fecaca]" : "text-white"}`}>
                  {formatEur(row.margin)}
                </div>
                <div className="mt-1 text-sm text-white/68">{formatPercent(row.marginPct)}</div>
              </div>
              <div className="grid h-12 w-12 place-items-center rounded-md border border-white/12 bg-white/8 text-[#2ae5a0]">
                <BadgeEuro className="h-6 w-6" />
              </div>
            </div>
            <div className="mt-6 grid grid-cols-2 gap-3">
              <DarkFact label="Preço cliente" value={formatEur(row.priceSell)} />
              <DarkFact label="Pago transp." value={formatEur(row.priceBuy)} />
            </div>
            <div className="mt-4 rounded-lg border border-white/12 bg-white/8 p-4">
              <div className="text-[10px] font-semibold uppercase tracking-[0.16em] text-white/55">
                Comissão prevista
              </div>
              <div className="mt-2 font-mono text-lg font-semibold">
                {commPreview != null ? (commPreview.eligible ? formatEur(commPreview.amountEur) : commPreview.reason) : "—"}
              </div>
              <div className="mt-2 text-xs text-white/62">
                {nextState ? `Próxima acção: ${STATE_LABELS[nextState]}` : "Ciclo comercial fechado"}
              </div>
            </div>
          </div>
        </div>
      </section>

      {(hasDeviation || hasOverdue) && (
        <div className="rounded-md border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm space-y-1">
          {hasDeviation && <div><strong>Atenção:</strong> factura fornecedor com desvio &gt; 5% face ao acordado.</div>}
          {hasOverdue && <div><strong>Atenção:</strong> factura cliente com data de pagamento ultrapassada.</div>}
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
            <Kv label="Transportador" value={row.carrierName ?? row.supplierName ?? "—"} />
            <Kv label="Matrícula" value={row.plate ?? "externa"} />
            <Kv label="Reboque" value={row.trailerPlate ?? "—"} />
            <Kv label="Prazo pag. cliente" value={`${row.clientTerms ?? 60}d`} />
            <Kv label="Preço Cliente" value={formatEur(row.priceSell)} />
            <Kv label="Pago Transportador" value={formatEur(row.priceBuy)} />
            <Kv label="Margem" value={`${formatEur(row.margin)} · ${formatPercent(row.marginPct)}`} strong />
            <Kv label="Nº CMR" value={row.cmrNumber ?? "—"} />
            <Kv label="Factura cliente" value={row.customerInvoiceNumber ?? "—"} />
            <Kv label="Factura fornecedor" value={row.supplierInvoiceNumber ?? "—"} />
            <Kv label="R/NR" value={row.paymentRegularization ?? "—"} />
            <Kv label="Mês pagamento" value={row.paymentMonth ?? "—"} />
            {row.serviceValueEur != null && <Kv label="Valor serviço" value={formatEur(row.serviceValueEur)} />}
            {commPreview != null && (
              <Kv
                label={`Comissão (${Math.round((rule?.percentOfMargin ?? 0) * 100)}% + bónus)`}
                value={commPreview.eligible ? formatEur(commPreview.amountEur) : commPreview.reason}
              />
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
                  <Button type="submit" size="sm">Avançar para {STATE_LABELS[to]}</Button>
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
                    <Button type="submit" size="sm" variant="outline">Recuar para {STATE_LABELS[to]}</Button>
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

function HeroFact({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-md border border-border/80 bg-white px-4 py-3 shadow-sm">
      <div className="text-[10px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">{label}</div>
      <div className="mt-1 truncate text-sm font-semibold text-[#1e2d3d]">{value}</div>
    </div>
  );
}

function DarkFact({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-md border border-white/12 bg-white/8 px-3 py-3">
      <div className="text-[10px] font-semibold uppercase tracking-[0.14em] text-white/50">{label}</div>
      <div className="mt-1 font-mono text-sm font-semibold text-white">{value}</div>
    </div>
  );
}
