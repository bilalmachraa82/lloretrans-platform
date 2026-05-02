import Link from "next/link";
import { db } from "@/db/client";
import { freightLoads, clients, users, supplierInvoicesFreight, clientInvoicesFreight, commissions } from "@/db/schema";
import { and, desc, eq, lt, isNull, count, sum, ilike, or, type SQL } from "drizzle-orm";
import { requireRole } from "@/lib/auth/session";
import { PageHeader } from "@/components/ui/page-header";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { formatEur, formatPercent } from "@/lib/money";
import { formatDate } from "@/lib/dates";
import { FREIGHT_STATES, STATE_LABELS, type FreightState } from "@/lib/freight-state";
import { Plus, Download } from "lucide-react";
import { exportLoadsCsv } from "./actions";

const COUNTRY_FLAG: Record<string, string> = {
  PT: "🇵🇹",
  ES: "🇪🇸",
  FR: "🇫🇷",
  PL: "🇵🇱",
  IT: "🇮🇹",
  DE: "🇩🇪",
  NL: "🇳🇱",
};

export default async function BolsaPage({
  searchParams,
}: {
  searchParams: Promise<{ view?: string; mine?: string; regularization?: string; carrier?: string; client?: string; q?: string }>;
}) {
  const session = await requireRole(["admin", "clarice", "comercial", "admin_faturacao"]);
  const { view = "table", mine, regularization, carrier, client, q } = await searchParams;
  const showMineOnly = session.role === "comercial" || mine === "1";

  const monthStart = new Date();
  monthStart.setDate(1);
  monthStart.setHours(0, 0, 0, 0);

  const conditions: SQL[] = [];
  if (showMineOnly) conditions.push(eq(freightLoads.salespersonId, session.userId));
  if (regularization === "R" || regularization === "NR") conditions.push(eq(freightLoads.paymentRegularization, regularization));
  if (regularization === "blank") conditions.push(isNull(freightLoads.paymentRegularization));
  if (carrier === "internal") conditions.push(eq(freightLoads.carrierKind, "internal_lloretrans"));
  if (carrier === "external") conditions.push(eq(freightLoads.carrierKind, "external_transporter"));
  if (client) conditions.push(eq(clients.name, client));
  if (q) {
    const needle = `%${q}%`;
    const searchCondition = or(
      ilike(freightLoads.origin, needle),
      ilike(freightLoads.destination, needle),
      ilike(freightLoads.carrierName, needle),
      ilike(freightLoads.cmrNumber, needle),
      ilike(freightLoads.customerInvoiceNumber, needle),
      ilike(freightLoads.supplierInvoiceNumber, needle),
      ilike(clients.name, needle),
    );
    if (searchCondition) conditions.push(searchCondition);
  }
  const whereClause = conditions.length ? and(...conditions) : undefined;

  const [rows, deviations, unpaid, clientOptions] = await Promise.all([
    db
      .select({
        id: freightLoads.id,
        reference: freightLoads.reference,
        state: freightLoads.state,
        origin: freightLoads.origin,
        destination: freightLoads.destination,
        loadedAt: freightLoads.loadedAt,
        priceBuy: freightLoads.priceBuy,
        priceSell: freightLoads.priceSell,
        margin: freightLoads.margin,
        marginPct: freightLoads.marginPct,
        plate: freightLoads.plate,
        trailerPlate: freightLoads.trailerPlate,
        carrierName: freightLoads.carrierName,
        carrierKind: freightLoads.carrierKind,
        cmrNumber: freightLoads.cmrNumber,
        customerInvoiceNumber: freightLoads.customerInvoiceNumber,
        supplierInvoiceNumber: freightLoads.supplierInvoiceNumber,
        paymentRegularization: freightLoads.paymentRegularization,
        paymentMonth: freightLoads.paymentMonth,
        clientName: clients.name,
        clientCountry: clients.country,
        salesName: users.name,
        createdAt: freightLoads.createdAt,
      })
      .from(freightLoads)
      .leftJoin(clients, eq(clients.id, freightLoads.clientId))
      .leftJoin(users, eq(users.id, freightLoads.salespersonId))
      .where(whereClause)
      .orderBy(desc(freightLoads.createdAt))
      .limit(350),
    db
      .select({ n: count() })
      .from(supplierInvoicesFreight)
      .where(eq(supplierInvoicesFreight.state, "deviation_detected")),
    db
      .select({ n: count() })
      .from(clientInvoicesFreight)
      .where(and(isNull(clientInvoicesFreight.paidAt), lt(clientInvoicesFreight.dueAt, new Date()))),
    db.select({ name: clients.name }).from(clients).orderBy(clients.name),
  ]);

  const totalMonth = rows.filter((r) => r.createdAt >= monthStart).length;
  const totalMargin = rows.reduce((a, r) => a + (r.margin ?? 0), 0);
  const canViewCommissions = session.role === "admin" || session.role === "clarice";
  const canCreateLoad = session.role === "admin" || session.role === "clarice" || session.role === "comercial";

  const accruedAgg = await db
    .select({ amount: sum(commissions.amountEur) })
    .from(commissions)
    .where(eq(commissions.state, "accrued"));
  const accrued = Number(accruedAgg[0]?.amount ?? 0);

  const groupedByState: Record<FreightState, typeof rows> = {
    scheduled: [],
    delivered: [],
    supplier_invoiced: [],
    client_invoiced: [],
    paid: [],
  };
  for (const r of rows) {
    const s = r.state as FreightState;
    if (groupedByState[s]) groupedByState[s].push(r);
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Bolsa de Carga"
        description={`${rows.length} cargas · ${showMineOnly ? "minhas" : "todas"}`}
        actions={
          <div className="flex flex-wrap gap-2">
            {session.role !== "comercial" && (
              <Button variant="outline" asChild>
                <Link href={`/bolsa?view=${view}${mine ? "" : "&mine=1"}`}>
                  {mine ? "Ver todas" : "Só as minhas"}
                </Link>
              </Button>
            )}
            <Button variant="outline" asChild>
              <Link href={`/bolsa?view=${view === "kanban" ? "table" : "kanban"}${mine ? "&mine=1" : ""}`}>
                {view === "kanban" ? "Tabela Excel" : "Kanban"}
              </Link>
            </Button>
            {canViewCommissions && (
              <Button variant="outline" asChild>
                <Link href="/bolsa/commissions">Comissões</Link>
              </Button>
            )}
            <form action={exportLoadsCsv}>
              {(mine || session.role === "comercial") && <input type="hidden" name="mineOnly" value="1" />}
              <Button type="submit" variant="outline">
                <Download className="h-4 w-4" />
                Excel
              </Button>
            </form>
            {canCreateLoad && (
              <Button asChild>
                <Link href="/bolsa/new">
                  <Plus className="h-4 w-4" />
                  Nova carga
                </Link>
              </Button>
            )}
          </div>
        }
      />

      <div className="grid gap-4 sm:grid-cols-4">
        <Kpi label="Cargas (mês)" value={String(totalMonth)} />
        <Kpi label="Margem total" value={formatEur(totalMargin)} />
        <Kpi label="Comissões acumuladas" value={formatEur(accrued)} />
        <Kpi
          label="Alertas"
          value={`${deviations[0]?.n ?? 0} desvios · ${unpaid[0]?.n ?? 0} atrasos`}
          accent={(deviations[0]?.n ?? 0) + (unpaid[0]?.n ?? 0) > 0 ? "destructive" : "muted"}
        />
      </div>

      <Card>
        <CardContent className="p-4 text-sm leading-relaxed text-muted-foreground">
          <strong className="text-foreground">Nota de leitura:</strong> a folha histórica foi importada sem corrigir os
          campos originais. Quando o preço cliente e o valor pago ao transportador vêm iguais, a margem fica a zero; esse
          saneamento é precisamente um dos pontos a fechar antes de operar a bolsa em produção.
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-4">
          <form className="grid gap-3 md:grid-cols-[1fr_160px_160px_220px_auto]">
            <input type="hidden" name="view" value={view} />
            {mine && <input type="hidden" name="mine" value={mine} />}
            <input
              name="q"
              defaultValue={q ?? ""}
              placeholder="Pesquisar cliente, rota, transportador, CMR ou factura"
              className="h-9 rounded-md border border-border bg-background px-3 text-sm"
            />
            <select name="regularization" defaultValue={regularization ?? ""} className="h-9 rounded-md border border-border bg-background px-3 text-sm">
              <option value="">R/NR: todas</option>
              <option value="R">R</option>
              <option value="NR">NR</option>
              <option value="blank">Sem valor</option>
            </select>
            <select name="carrier" defaultValue={carrier ?? ""} className="h-9 rounded-md border border-border bg-background px-3 text-sm">
              <option value="">Transportador: todos</option>
              <option value="internal">Lloretrans</option>
              <option value="external">Externos</option>
            </select>
            <select name="client" defaultValue={client ?? ""} className="h-9 rounded-md border border-border bg-background px-3 text-sm">
              <option value="">Cliente: todos</option>
              {clientOptions.map((option) => (
                <option key={option.name} value={option.name}>{option.name}</option>
              ))}
            </select>
            <Button type="submit" variant="outline">Filtrar</Button>
          </form>
        </CardContent>
      </Card>

      {view === "kanban" ? (
        <div className="grid gap-3 md:grid-cols-5">
          {FREIGHT_STATES.map((s) => (
            <div key={s} className="space-y-2">
              <div className="flex items-center justify-between px-2">
                <div className="text-xs font-semibold uppercase tracking-wide">{STATE_LABELS[s]}</div>
                <Badge variant="secondary">{groupedByState[s].length}</Badge>
              </div>
              <div className="space-y-2">
                {groupedByState[s].slice(0, 15).map((r) => (
                  <Link key={r.id} href={`/bolsa/${r.id}`}>
                    <Card className="hover:border-primary/60 hover:-translate-y-0.5 transition-all">
                      <CardContent className="p-3 text-xs space-y-1.5">
                        <div className="flex items-center justify-between">
                          <div className="font-mono font-semibold text-primary/90">{r.reference}</div>
                          <span className="text-base leading-none">{COUNTRY_FLAG[r.clientCountry ?? "PT"] ?? ""}</span>
                        </div>
                        <div className="font-medium">{r.clientName ?? "—"}</div>
                        <div className="text-muted-foreground">
                          {r.origin} → {r.destination}
                        </div>
                        <div className="flex justify-between items-center pt-1">
                          <span className="font-mono font-semibold">{formatEur(r.margin)}</span>
                          <Badge variant={r.marginPct >= 0.15 ? "success" : r.marginPct >= 0.08 ? "default" : "warning"}>
                            {formatPercent(r.marginPct)}
                          </Badge>
                        </div>
                        <div className="text-[10px] text-muted-foreground">{r.salesName}</div>
                      </CardContent>
                    </Card>
                  </Link>
                ))}
                {groupedByState[s].length > 15 && (
                  <div className="text-[10px] text-center text-muted-foreground">
                    + {groupedByState[s].length - 15} mais
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <Card>
          <div className="overflow-x-auto">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Data</th>
                  <th>Viatura</th>
                  <th>Reboque</th>
                  <th>Transportador</th>
                  <th>Cliente</th>
                  <th>Carga</th>
                  <th>Descarga</th>
                  <th className="text-right">Preço Cliente</th>
                  <th className="text-right">Pago Transportador</th>
                  <th className="text-right">Margem</th>
                  <th>Nº CMR</th>
                  <th>Nº Factura Cliente</th>
                  <th>Nº Factura Fornecedor</th>
                  <th>R/NR</th>
                  <th>Mês Pagamento</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {rows.map((r) => (
                  <tr key={r.id}>
                    <td className="font-mono text-xs">{r.loadedAt ? formatDate(r.loadedAt) : "—"}</td>
                    <td className="font-mono text-xs">{r.plate ?? "—"}</td>
                    <td className="font-mono text-xs">{r.trailerPlate ?? "—"}</td>
                    <td className="text-xs">{r.carrierName ?? "—"}</td>
                    <td className="text-xs">{r.clientName ?? "—"}</td>
                    <td className="text-xs">{r.origin}</td>
                    <td className="text-xs">{r.destination}</td>
                    <td className="text-right font-mono">{formatEur(r.priceSell)}</td>
                    <td className="text-right font-mono">{formatEur(r.priceBuy)}</td>
                    <td className="text-right font-mono">
                      {formatEur(r.margin)} <span className="text-muted-foreground text-xs">({formatPercent(r.marginPct)})</span>
                    </td>
                    <td className="font-mono text-xs">{r.cmrNumber ?? "—"}</td>
                    <td className="font-mono text-xs">{r.customerInvoiceNumber ?? "—"}</td>
                    <td className="font-mono text-xs">{r.supplierInvoiceNumber ?? "—"}</td>
                    <td className="font-mono text-xs">{r.paymentRegularization ?? "—"}</td>
                    <td className="text-xs">{r.paymentMonth ?? "—"}</td>
                    <td><Button size="sm" variant="outline" asChild><Link href={`/bolsa/${r.id}`}>Abrir</Link></Button></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}
    </div>
  );
}

function Kpi({ label, value, accent = "muted" }: { label: string; value: string; accent?: "muted" | "destructive" }) {
  return (
    <Card>
      <CardContent className="p-4">
        <div className="text-xs text-muted-foreground">{label}</div>
        <div className={`text-2xl font-semibold font-mono ${accent === "destructive" ? "text-destructive" : ""}`}>{value}</div>
      </CardContent>
    </Card>
  );
}
