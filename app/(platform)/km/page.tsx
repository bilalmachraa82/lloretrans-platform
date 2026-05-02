import Link from "next/link";
import { db } from "@/db/client";
import { kmReconciliations, trips, vehicles, drivers } from "@/db/schema";
import { and, desc, eq, gte, lte, count } from "drizzle-orm";
import { requireRole } from "@/lib/auth/session";
import { PageHeader } from "@/components/ui/page-header";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { StatusPill } from "@/components/ui/status-pill";
import { Input } from "@/components/ui/input";
import { formatKm, formatNumber } from "@/lib/money";
import { formatDate, formatDateTime } from "@/lib/dates";
import { bulkApproveGreen, exportCsv } from "./actions";

function DeltaBar({ delta, max }: { delta: number; max: number }) {
  const clamped = Math.max(-max, Math.min(max, delta));
  const pct = Math.abs(clamped) / max;
  const isPos = clamped > 0;
  const isNeg = clamped < 0;
  const color = Math.abs(delta) > max ? "bg-destructive" : Math.abs(delta) > 10 ? "bg-warning" : "bg-success";
  return (
    <div className="flex items-center gap-2">
      <div className="relative flex-1 h-4 max-w-[70px]">
        <div className="absolute inset-y-0 left-1/2 w-px bg-border" />
        {isPos && (
          <div
            className={`absolute inset-y-0 left-1/2 rounded-r ${color} transition-all`}
            style={{ width: `${pct * 50}%` }}
          />
        )}
        {isNeg && (
          <div
            className={`absolute inset-y-0 right-1/2 rounded-l ${color} transition-all`}
            style={{ width: `${pct * 50}%` }}
          />
        )}
      </div>
      <span
        className={`text-xs tabular min-w-[40px] text-right ${
          Math.abs(delta) > 10 ? "text-warning font-semibold" : ""
        }`}
      >
        {delta > 0 ? "+" : ""}{delta.toFixed(1)}
      </span>
    </div>
  );
}

export default async function KmPage({
  searchParams,
}: {
  searchParams: Promise<{ state?: string; date?: string }>;
}) {
  await requireRole(["admin", "clarice", "admin_faturacao"]);
  const { state, date } = await searchParams;

  const targetDate = date ? new Date(date) : (() => {
    const d = new Date();
    d.setDate(d.getDate() - 1);
    return d;
  })();
  const dayStart = new Date(targetDate);
  dayStart.setHours(0, 0, 0, 0);
  const dayEnd = new Date(targetDate);
  dayEnd.setHours(23, 59, 59, 999);

  const whereBase = and(gte(trips.startedAt, dayStart), lte(trips.startedAt, dayEnd));
  const whereClause = state ? and(whereBase, eq(kmReconciliations.state, state)) : whereBase;

  const [rows, counts] = await Promise.all([
    db
      .select({
        id: kmReconciliations.id,
        state: kmReconciliations.state,
        kmDeclared: kmReconciliations.kmDeclared,
        kmGps: kmReconciliations.kmGps,
        deltaKm: kmReconciliations.deltaKm,
        proposedKm: kmReconciliations.proposedKm,
        finalKm: kmReconciliations.finalKm,
        decidedAt: kmReconciliations.decidedAt,
        tripExternal: trips.externalId,
        startedAt: trips.startedAt,
        origin: trips.origin,
        destination: trips.destination,
        plate: vehicles.plate,
        driverName: drivers.name,
      })
      .from(kmReconciliations)
      .innerJoin(trips, eq(trips.id, kmReconciliations.tripId))
      .innerJoin(vehicles, eq(vehicles.id, trips.vehicleId))
      .leftJoin(drivers, eq(drivers.id, trips.driverId))
      .where(whereClause)
      .orderBy(desc(trips.startedAt))
      .limit(200),
    db
      .select({ state: kmReconciliations.state, n: count() })
      .from(kmReconciliations)
      .innerJoin(trips, eq(trips.id, kmReconciliations.tripId))
      .where(whereBase)
      .groupBy(kmReconciliations.state),
  ]);

  const byState: Record<string, number> = { green: 0, yellow: 0, red: 0 };
  counts.forEach((c) => (byState[c.state] = c.n));

  const pendingGreenIds = rows.filter((r) => r.state === "green" && !r.decidedAt).map((r) => r.id).join(",");

  const stateMap: Record<string, { label: string; pill: "green" | "yellow" | "red" }> = {
    green: { label: "Verde · auto", pill: "green" },
    yellow: { label: "Amarela · ajustar", pill: "yellow" },
    red: { label: "Vermelha · investigar", pill: "red" },
  };

  const dateIso = targetDate.toISOString().slice(0, 10);

  return (
    <div className="space-y-6">
      <PageHeader
        title={`Validação km · ${formatDate(targetDate)}`}
        description={`${rows.length} reconciliações ${state ? `(filtro: ${state})` : ""} · fonte GPS: Frotcom · declarado: Logue Trans`}
        actions={
          <div className="flex flex-wrap items-center gap-2">
            <form className="flex items-center gap-2">
              <Input type="date" name="date" defaultValue={dateIso} className="h-9" />
              <Button type="submit" variant="outline">
                Aplicar
              </Button>
            </form>
            <form action={exportCsv}>
              <input type="hidden" name="dateFrom" value={dateIso} />
              <input type="hidden" name="dateTo" value={dateIso} />
              <Button type="submit" variant="outline">
                Exportar CSV
              </Button>
            </form>
          </div>
        }
      />

      <div className="grid grid-cols-3 gap-4">
        {(["green", "yellow", "red"] as const).map((s) => (
          <Link key={s} href={`/km?date=${dateIso}&state=${s}`}>
            <Card className={`transition-colors hover:border-primary/60 ${state === s ? "border-primary" : ""}`}>
              <CardContent className="p-5 flex items-center justify-between">
                <div>
                  <StatusPill status={s}>{stateMap[s].label}</StatusPill>
                  <div className="mt-2 text-3xl font-semibold font-mono">{formatNumber(byState[s] ?? 0)}</div>
                  <div className="text-xs text-muted-foreground mt-0.5">viagens</div>
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      {pendingGreenIds && (
        <div className="flex items-center justify-between rounded-md border border-success/30 bg-success/5 px-4 py-3">
          <div className="text-sm">
            <strong>{formatNumber(pendingGreenIds.split(",").length)}</strong> viagens verdes pendentes — todas com Δ dentro do threshold.
          </div>
          <form action={bulkApproveGreen}>
            <input type="hidden" name="ids" value={pendingGreenIds} />
            <Button type="submit" variant="success" size="sm">
              Aprovar todas
            </Button>
          </form>
        </div>
      )}

      {state && (
        <Link href={`/km?date=${dateIso}`} className="text-sm underline">
          Limpar filtro de estado
        </Link>
      )}

      <Card>
        <div className="overflow-x-auto">
          <table className="data-table">
            <thead>
              <tr>
                <th>Início</th>
                <th>Matrícula</th>
                <th>Motorista</th>
                <th>Rota</th>
                <th className="text-right">Declarado</th>
                <th className="text-right">GPS</th>
                <th className="text-right">Δ km</th>
                <th>Estado</th>
                <th>Decisão</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.id}>
                  <td className="text-xs whitespace-nowrap">{formatDateTime(r.startedAt)}</td>
                  <td className="font-mono text-xs">{r.plate}</td>
                  <td>{r.driverName ?? "—"}</td>
                  <td className="text-xs">
                    {r.origin ?? "—"} <span className="text-muted-foreground">→</span> {r.destination ?? "—"}
                  </td>
                  <td className="text-right font-mono">{formatKm(r.kmDeclared)}</td>
                  <td className="text-right font-mono">{formatKm(r.kmGps)}</td>
                  <td className="text-right font-mono min-w-[140px]">
                    {r.deltaKm != null ? (
                      <DeltaBar delta={r.deltaKm} max={30} />
                    ) : (
                      <span className="text-muted-foreground">—</span>
                    )}
                  </td>
                  <td>
                    <StatusPill status={stateMap[r.state]?.pill ?? "neutral"}>{stateMap[r.state]?.label ?? r.state}</StatusPill>
                  </td>
                  <td className="text-xs">
                    {r.decidedAt ? (
                      <span className="text-success">Decidida · {formatKm(r.finalKm)}</span>
                    ) : (
                      <span className="text-muted-foreground">Pendente</span>
                    )}
                  </td>
                  <td>
                    <Button size="sm" variant="outline" asChild>
                      <Link href={`/km/${r.id}`}>Abrir</Link>
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
