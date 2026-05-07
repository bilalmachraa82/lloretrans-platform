import Link from "next/link";
import { db } from "@/db/client";
import { freightLoads, clients, users, supplierInvoicesFreight, clientInvoicesFreight, commissions } from "@/db/schema";
import { and, desc, eq, lt, isNull, count, sum, ilike, or, type SQL } from "drizzle-orm";
import { requireRole } from "@/lib/auth/session";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { formatEur, formatPercent } from "@/lib/money";
import { formatDate } from "@/lib/dates";
import { FREIGHT_STATES, STATE_LABELS, type FreightState } from "@/lib/freight-state";
import {
  ArrowRight,
  BadgeEuro,
  CircleAlert,
  Download,
  KanbanSquare,
  Plus,
  Route,
  Search,
  SlidersHorizontal,
  Table2,
  TrendingUp,
  Truck,
  WalletCards,
} from "lucide-react";
import { exportLoadsCsv } from "./actions";

const STATE_META: Record<FreightState, { label: string; tone: string; dot: string; rail: string }> = {
  scheduled: {
    label: "A preparar",
    tone: "border-[#dbeafe] bg-[#eff6ff] text-[#1d4ed8]",
    dot: "bg-[#3b82f6]",
    rail: "from-[#3b82f6] to-[#60a5fa]",
  },
  delivered: {
    label: "Entregues",
    tone: "border-[#e0e7ff] bg-[#eef2ff] text-[#4338ca]",
    dot: "bg-[#6366f1]",
    rail: "from-[#6366f1] to-[#818cf8]",
  },
  supplier_invoiced: {
    label: "Custo fechado",
    tone: "border-[#fef3c7] bg-[#fffbeb] text-[#92400e]",
    dot: "bg-[#f59e0b]",
    rail: "from-[#f59e0b] to-[#fbbf24]",
  },
  client_invoiced: {
    label: "A receber",
    tone: "border-[#fed7aa] bg-[#fff7ed] text-[#9a3412]",
    dot: "bg-[#ea580c]",
    rail: "from-[#ea580c] to-[#fb923c]",
  },
  paid: {
    label: "Fechadas",
    tone: "border-[#bbf7d0] bg-[#f0fdf4] text-[#166534]",
    dot: "bg-[#16a34a]",
    rail: "from-[#16a34a] to-[#4ade80]",
  },
};

export default async function BolsaPage({
  searchParams,
}: {
  searchParams: Promise<{ view?: string; mine?: string; regularization?: string; carrier?: string; client?: string; q?: string }>;
}) {
  const session = await requireRole(["admin", "clarice", "comercial", "admin_faturacao"]);
  const { view = "kanban", mine, regularization, carrier, client, q } = await searchParams;
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
  const totalSell = rows.reduce((a, r) => a + (r.priceSell ?? 0), 0);
  const averageMarginPct = totalSell > 0 ? totalMargin / totalSell : 0;
  const internalLoads = rows.filter((r) => r.carrierKind === "internal_lloretrans").length;
  const externalLoads = rows.length - internalLoads;
  const alertCount = (deviations[0]?.n ?? 0) + (unpaid[0]?.n ?? 0);
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

  const activeLoads = rows.length - groupedByState.paid.length;
  const readyToCollect = groupedByState.client_invoiced.length;
  const filteredBy = [
    q ? `Pesquisa: ${q}` : null,
    regularization ? `R/NR: ${regularization === "blank" ? "sem valor" : regularization}` : null,
    carrier ? `Transportador: ${carrier === "internal" ? "Lloretrans" : "externo"}` : null,
    client ? `Cliente: ${client}` : null,
    showMineOnly ? "Só carteira própria" : null,
  ].filter(Boolean);

  const buildHref = (overrides: Record<string, string | null | undefined>) => {
    const params = new URLSearchParams();
    if (view) params.set("view", view);
    if (mine) params.set("mine", mine);
    if (regularization) params.set("regularization", regularization);
    if (carrier) params.set("carrier", carrier);
    if (client) params.set("client", client);
    if (q) params.set("q", q);

    Object.entries(overrides).forEach(([key, value]) => {
      if (value == null || value === "") params.delete(key);
      else params.set(key, value);
    });

    const query = params.toString();
    return `/bolsa${query ? `?${query}` : ""}`;
  };

  return (
    <div className="space-y-6">
      <section className="overflow-hidden rounded-lg border border-[#d8e1df] bg-white shadow-elevated-sm">
        <div className="grid gap-0 lg:grid-cols-[1.18fr_0.82fr]">
          <div className="relative border-b border-[#e2e8f0] bg-[linear-gradient(135deg,#ffffff_0%,#f8fffc_48%,#eef7ff_100%)] p-6 lg:border-b-0 lg:border-r lg:p-7">
            <div className="flex flex-wrap items-center gap-2">
              <Badge className="border-[#ca742d]/20 bg-[#fef3e8] text-[#9a4b12]">
                Comercial
              </Badge>
              <span className="text-xs font-medium text-muted-foreground">
                {rows.length} cargas · {internalLoads} Lloretrans · {externalLoads} externos
              </span>
            </div>
            <div className="mt-5 flex flex-col gap-5 xl:flex-row xl:items-end xl:justify-between">
              <div>
                <h1 className="font-display text-4xl font-semibold leading-tight tracking-normal text-[#1e2d3d]">
                  Bolsa de carga
                </h1>
                <p className="mt-3 max-w-2xl text-sm leading-relaxed text-[#4b5563]">
                  Pipeline comercial com margem, estado documental, regularização e comissão no mesmo ecrã.
                  A leitura principal passa a ser: que carga avança agora, que margem protege e que comissão fecha.
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                {canViewCommissions && (
                  <Button variant="outline" asChild>
                    <Link href="/bolsa/commissions">
                      <WalletCards className="h-4 w-4" />
                      Comissões
                    </Link>
                  </Button>
                )}
                <form action={exportLoadsCsv}>
                  {(mine || session.role === "comercial") && <input type="hidden" name="mineOnly" value="1" />}
                  <Button type="submit" variant="outline">
                    <Download className="h-4 w-4" />
                    Exportar
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
            </div>
          </div>

          <div className="bg-[#1e2d3d] p-6 text-white lg:p-7">
            <div className="flex items-center justify-between gap-4">
              <div>
                <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#2ae5a0]">
                  Carteira activa
                </div>
                <div className="mt-2 font-mono text-4xl font-semibold">{activeLoads}</div>
              </div>
              <div className="rounded-lg border border-white/12 bg-white/8 px-4 py-3 text-right">
                <div className="text-[10px] uppercase tracking-[0.16em] text-white/55">A receber</div>
                <div className="mt-1 font-mono text-2xl font-semibold">{readyToCollect}</div>
              </div>
            </div>
            <div className="mt-6 space-y-3">
              {FREIGHT_STATES.map((state) => {
                const countForState = groupedByState[state].length;
                const pct = rows.length ? Math.max(6, Math.round((countForState / rows.length) * 100)) : 0;
                return (
                  <div key={state} className="grid grid-cols-[112px_1fr_38px] items-center gap-3">
                    <div className="text-xs text-white/72">{STATE_META[state].label}</div>
                    <div className="h-2 overflow-hidden rounded-full bg-white/10">
                      <div className={`h-full rounded-full bg-gradient-to-r ${STATE_META[state].rail}`} style={{ width: `${pct}%` }} />
                    </div>
                    <div className="text-right font-mono text-xs font-semibold">{countForState}</div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <CommercialKpi
          icon={<Route className="h-5 w-5" />}
          label="Cargas este mês"
          value={String(totalMonth)}
          note={`${rows.length} linhas filtradas`}
        />
        <CommercialKpi
          icon={<TrendingUp className="h-5 w-5" />}
          label="Margem da carteira"
          value={formatEur(totalMargin)}
          note={`${formatPercent(averageMarginPct)} sobre ${formatEur(totalSell)}`}
          tone={totalMargin < 0 ? "risk" : "good"}
        />
        <CommercialKpi
          icon={<BadgeEuro className="h-5 w-5" />}
          label="Comissões abertas"
          value={formatEur(accrued)}
          note="20% lucro + bónus viatura Lloretrans"
        />
        <CommercialKpi
          icon={<CircleAlert className="h-5 w-5" />}
          label="Risco operacional"
          value={`${alertCount}`}
          note={`${deviations[0]?.n ?? 0} desvios · ${unpaid[0]?.n ?? 0} atrasos`}
          tone={alertCount > 0 ? "risk" : "good"}
        />
      </section>

      <section className="grid gap-4 lg:grid-cols-[1fr_340px]">
        <div className="rounded-lg border border-border/80 bg-white p-4 shadow-elevated-sm">
          <form className="grid gap-3 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-[minmax(280px,1fr)_150px_170px_220px_auto]">
            <input type="hidden" name="view" value={view} />
            {mine && <input type="hidden" name="mine" value={mine} />}
            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <input
                name="q"
                defaultValue={q ?? ""}
                placeholder="Pesquisar cliente, rota, transportador, CMR ou factura"
                className="h-11 w-full rounded-md border border-border bg-background pl-9 pr-3 text-sm"
              />
            </div>
            <select name="regularization" defaultValue={regularization ?? ""} className="h-11 rounded-md border border-border bg-background px-3 text-sm">
              <option value="">R/NR: todas</option>
              <option value="R">R</option>
              <option value="NR">NR</option>
              <option value="blank">Sem valor</option>
            </select>
            <select name="carrier" defaultValue={carrier ?? ""} className="h-11 rounded-md border border-border bg-background px-3 text-sm">
              <option value="">Transportador: todos</option>
              <option value="internal">Lloretrans</option>
              <option value="external">Externos</option>
            </select>
            <select name="client" defaultValue={client ?? ""} className="h-11 rounded-md border border-border bg-background px-3 text-sm">
              <option value="">Cliente: todos</option>
              {clientOptions.map((option) => (
                <option key={option.name} value={option.name}>{option.name}</option>
              ))}
            </select>
            <Button type="submit" variant="outline">
              <SlidersHorizontal className="h-4 w-4" />
              Filtrar
            </Button>
          </form>

          <div className="mt-3 flex flex-wrap items-center gap-2">
            <Link
              href={buildHref({ view: "kanban" })}
              className={`inline-flex min-h-11 items-center gap-2 rounded-md border px-3 text-xs font-semibold transition-colors ${
                view !== "table" ? "border-primary bg-primary text-primary-foreground" : "border-border bg-background hover:bg-secondary"
              }`}
            >
              <KanbanSquare className="h-4 w-4" />
              Pipeline
            </Link>
            <Link
              href={buildHref({ view: "table" })}
              className={`inline-flex min-h-11 items-center gap-2 rounded-md border px-3 text-xs font-semibold transition-colors ${
                view === "table" ? "border-primary bg-primary text-primary-foreground" : "border-border bg-background hover:bg-secondary"
              }`}
            >
              <Table2 className="h-4 w-4" />
              Tabela
            </Link>
            {session.role !== "comercial" && (
              <Link
                href={buildHref({ mine: mine ? null : "1" })}
                className="inline-flex min-h-11 items-center rounded-md border border-border bg-background px-3 text-xs font-semibold hover:bg-secondary"
              >
                {mine ? "Ver todas" : "Só as minhas"}
              </Link>
            )}
            {filteredBy.map((filter) => (
              <Badge key={filter} variant="secondary" className="min-h-8">
                {filter}
              </Badge>
            ))}
          </div>
        </div>

        <div className="rounded-lg border border-[#f1d6bd] bg-[#fffaf4] p-4 shadow-elevated-sm">
          <div className="flex items-start gap-3">
            <div className="grid h-10 w-10 shrink-0 place-items-center rounded-md bg-[#fef3e8] text-[#ca742d]">
              <Truck className="h-5 w-5" />
            </div>
            <div>
              <div className="text-sm font-semibold text-[#1e2d3d]">Qualidade dos dados importados</div>
              <p className="mt-1 text-xs leading-relaxed text-[#6b7280]">
                Margens negativas ou neutras podem indicar campos históricos trocados entre preço cliente e pago
                transportador. A regra comercial já está reflectida: 20% do lucro + bónus Lloretrans.
              </p>
            </div>
          </div>
        </div>
      </section>

      {view === "kanban" ? (
        <section className="grid gap-4 xl:grid-cols-5">
          {FREIGHT_STATES.map((s) => (
            <div key={s} className="min-w-0 rounded-lg border border-border/80 bg-[#f8fafc] p-3 shadow-elevated-sm">
              <div className="mb-3 flex items-center justify-between gap-2">
                <div className="flex min-w-0 items-center gap-2">
                  <span className={`h-2.5 w-2.5 shrink-0 rounded-full ${STATE_META[s].dot}`} />
                  <div className="min-w-0">
                    <div className="truncate text-xs font-semibold uppercase tracking-[0.12em] text-[#1e2d3d]">
                      {STATE_META[s].label}
                    </div>
                    <div className="text-[10px] text-muted-foreground">{STATE_LABELS[s]}</div>
                  </div>
                </div>
                <Badge variant="secondary">{groupedByState[s].length}</Badge>
              </div>
              <div className="space-y-2.5">
                {groupedByState[s].length === 0 ? (
                  <div className="rounded-md border border-dashed border-border bg-white p-4 text-xs leading-relaxed text-muted-foreground">
                    Sem cargas neste estado.
                  </div>
                ) : groupedByState[s].slice(0, 15).map((r) => (
                  <Link
                    key={r.id}
                    href={`/bolsa/${r.id}`}
                    className="group block rounded-lg border border-border/80 bg-white p-3 shadow-sm transition-all hover:-translate-y-0.5 hover:border-primary/55 hover:shadow-elevated"
                  >
                    <div className="space-y-3 text-xs">
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <div className="font-mono text-[11px] font-semibold text-primary">{r.reference}</div>
                          <div className="mt-1 truncate text-sm font-semibold text-[#1e2d3d]">{r.clientName ?? "—"}</div>
                        </div>
                        <span className="rounded-full border border-border bg-secondary px-2 py-0.5 font-mono text-[10px] text-muted-foreground">
                          {r.clientCountry ?? "PT"}
                        </span>
                      </div>
                      <div className="rounded-md bg-[#f8fafc] px-3 py-2">
                        <div className="flex items-center gap-2 text-[11px] font-medium text-[#4b5563]">
                          <Route className="h-3.5 w-3.5 text-muted-foreground" />
                          <span className="truncate">{r.origin}</span>
                          <ArrowRight className="h-3 w-3 shrink-0 text-muted-foreground" />
                          <span className="truncate">{r.destination}</span>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        <MiniMetric label="Margem" value={formatCompactEur(r.margin)} />
                        <MiniMetric label="Comissão" value={commissionPreviewLabel(r.margin, r.carrierKind)} />
                      </div>
                      <div className="flex flex-wrap gap-1.5">
                        <Badge variant={r.marginPct >= 0.15 ? "success" : r.marginPct >= 0.08 ? "default" : "warning"}>
                          {formatPercent(r.marginPct)}
                        </Badge>
                        <Badge variant={r.carrierKind === "internal_lloretrans" ? "success" : "secondary"}>
                          {r.carrierKind === "internal_lloretrans" ? "Lloretrans" : "Externo"}
                        </Badge>
                        <Badge variant={r.paymentRegularization === "R" ? "success" : r.paymentRegularization === "NR" ? "warning" : "secondary"}>
                          {r.paymentRegularization ?? "R/NR aberto"}
                        </Badge>
                      </div>
                      <div className="flex items-center justify-between border-t border-border/70 pt-2">
                        <span className="text-[10px] text-muted-foreground">{nextActionLabel(r.state as FreightState)}</span>
                        <span className="text-[10px] font-semibold text-primary opacity-0 transition-opacity group-hover:opacity-100">
                          Abrir
                        </span>
                      </div>
                    </div>
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
        </section>
      ) : (
        <section className="overflow-hidden rounded-lg border border-border/80 bg-white shadow-elevated-sm">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border bg-[#f8fafc] px-4 py-3">
            <div>
              <div className="text-sm font-semibold text-[#1e2d3d]">Tabela comercial</div>
              <div className="text-xs text-muted-foreground">Comparação densa para validar margem, documentos e pagamento.</div>
            </div>
            <Badge variant="secondary">{rows.length} registos</Badge>
          </div>
          <div className="overflow-x-auto">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Data</th>
                  <th>Estado / próxima acção</th>
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
                {rows.length === 0 ? (
                  <tr>
                    <td colSpan={17} className="py-8 text-center text-sm text-muted-foreground">
                      Sem cargas para estes filtros. Limpa a pesquisa ou cria uma nova carga para iniciar o ciclo.
                    </td>
                  </tr>
                ) : rows.map((r) => (
                  <tr key={r.id} className={r.margin < 0 ? "bg-destructive/5" : ""}>
                    <td className="font-mono text-xs">{r.loadedAt ? formatDate(r.loadedAt) : "—"}</td>
                    <td className="min-w-[180px]">
                      <Badge className={`mb-1 text-[10px] ${STATE_META[r.state as FreightState]?.tone ?? ""}`}>
                        {STATE_LABELS[r.state as FreightState] ?? r.state}
                      </Badge>
                      <div className="text-[10px] text-muted-foreground">{nextActionLabel(r.state as FreightState)}</div>
                    </td>
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
        </section>
      )}
    </div>
  );
}

function nextActionLabel(state: FreightState): string {
  if (state === "scheduled") return "Confirmar entrega e CMR";
  if (state === "delivered") return "Registar factura fornecedor";
  if (state === "supplier_invoiced") return "Emitir factura cliente";
  if (state === "client_invoiced") return "Confirmar recebimento";
  if (state === "paid") return "Comissão fechada";
  return "Abrir detalhe";
}

function commissionPreviewLabel(margin: number, carrierKind: string): string {
  const bonus = carrierKind === "internal_lloretrans" ? 2.5 : 0;
  return formatCompactEur(Math.max(0, margin * 0.2 + bonus));
}

function formatCompactEur(value: number): string {
  const abs = Math.abs(value);
  if (abs >= 1000) {
    const sign = value < 0 ? "-" : "";
    const amount = new Intl.NumberFormat("pt-PT", {
      maximumFractionDigits: abs >= 10000 ? 0 : 1,
    }).format(abs / 1000);
    return `${sign}${amount}k €`;
  }
  return formatEur(value);
}

function CommercialKpi({
  icon,
  label,
  value,
  note,
  tone = "neutral",
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  note: string;
  tone?: "neutral" | "good" | "risk";
}) {
  const toneClass =
    tone === "good"
      ? "bg-success/10 text-[hsl(152_55%_28%)]"
      : tone === "risk"
        ? "bg-destructive/10 text-[hsl(0_72%_38%)]"
        : "bg-primary/10 text-primary";

  return (
    <article className="rounded-lg border border-border/80 bg-white p-4 shadow-elevated-sm">
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">{label}</div>
          <div className="mt-2 font-mono text-2xl font-semibold text-[#1e2d3d]">{value}</div>
        </div>
        <div className={`grid h-10 w-10 shrink-0 place-items-center rounded-md ${toneClass}`}>{icon}</div>
      </div>
      <p className="mt-3 text-xs leading-relaxed text-muted-foreground">{note}</p>
    </article>
  );
}

function MiniMetric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-md border border-border/70 bg-white px-2.5 py-2">
      <div className="text-[9px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">{label}</div>
      <div className="mt-1 font-mono text-[10.5px] font-semibold leading-tight text-[#1e2d3d] [overflow-wrap:anywhere]">
        {value}
      </div>
    </div>
  );
}
