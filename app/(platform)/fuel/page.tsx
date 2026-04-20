import Link from "next/link";
import { db } from "@/db/client";
import { fuelReadingsCanbus, fuelFills, fuelAnomalies, vehicles } from "@/db/schema";
import { and, desc, eq, gte, sum, count } from "drizzle-orm";
import { requireRole } from "@/lib/auth/session";
import { getVehicleFuelRanking } from "@/lib/fuel/ranking";
import { PageHeader } from "@/components/ui/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { StatusPill } from "@/components/ui/status-pill";
import { formatEur, formatNumber } from "@/lib/money";
import { formatDate } from "@/lib/dates";
import { SimpleLineChart } from "@/components/charts/line-chart";
import { exportMonthlyReport } from "./actions";

export default async function FuelPage() {
  await requireRole(["admin", "clarice"]);

  const windowDays = 30;
  const windowStart = new Date();
  windowStart.setDate(windowStart.getDate() - windowDays);

  const [fillsAgg, canbusRows, anomaliesOpen, topAnomalies] = await Promise.all([
    db
      .select({ totalLiters: sum(fuelFills.liters), totalEur: sum(fuelFills.totalEur), n: count() })
      .from(fuelFills)
      .where(gte(fuelFills.filledAt, windowStart)),
    db
      .select({ readAt: fuelReadingsCanbus.readAt, liters: fuelReadingsCanbus.litersConsumed, odo: fuelReadingsCanbus.odometerKm })
      .from(fuelReadingsCanbus)
      .where(gte(fuelReadingsCanbus.readAt, windowStart))
      .orderBy(fuelReadingsCanbus.readAt),
    db.select({ n: count() }).from(fuelAnomalies).where(eq(fuelAnomalies.state, "open")),
    db
      .select({
        id: fuelAnomalies.id,
        plate: vehicles.plate,
        vehicleId: vehicles.id,
        kind: fuelAnomalies.kind,
        severity: fuelAnomalies.severity,
        deviationPct: fuelAnomalies.deviationPct,
        detectedAt: fuelAnomalies.detectedAt,
        state: fuelAnomalies.state,
      })
      .from(fuelAnomalies)
      .innerJoin(vehicles, eq(vehicles.id, fuelAnomalies.vehicleId))
      .where(eq(fuelAnomalies.state, "open"))
      .orderBy(desc(fuelAnomalies.deviationPct))
      .limit(10),
  ]);

  // Aggregate per day for chart
  const byDay = new Map<string, { liters: number; count: number }>();
  for (const r of canbusRows) {
    const key = r.readAt.toISOString().slice(0, 10);
    const cur = byDay.get(key) ?? { liters: 0, count: 0 };
    cur.liters += r.liters ?? 0;
    cur.count += 1;
    byDay.set(key, cur);
  }
  const chartData = [...byDay.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([day, { liters, count }]) => ({
      label: day.slice(5),
      value: count > 0 ? liters / count : 0,
    }));

  const ranking = await getVehicleFuelRanking(windowStart);

  const totalLiters = Number(fillsAgg[0]?.totalLiters ?? 0);
  const totalEur = Number(fillsAgg[0]?.totalEur ?? 0);
  const fleetAvgPer100 = (() => {
    const sumL = ranking.reduce((a: number, r) => a + r.totalLiters, 0);
    const sumKm = ranking.reduce((a: number, r) => a + r.totalKm, 0);
    return sumKm > 0 ? (sumL * 100) / sumKm : 0;
  })();

  const now = new Date();

  return (
    <div className="space-y-6">
      <PageHeader
        title="Combustível · últimos 30 dias"
        description="CANBUS Frotcom × abastecimentos bomba interna + SEPSA + Repsol + Anamor"
        actions={
          <form action={exportMonthlyReport} className="flex gap-2">
            <input type="hidden" name="year" value={now.getFullYear()} />
            <input type="hidden" name="month" value={now.getMonth() + 1} />
            <Button type="submit" variant="outline">Exportar relatório mensal</Button>
          </form>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Kpi label="Total litros (30d)" value={`${formatNumber(totalLiters)} L`} />
        <Kpi label="Custo total (30d)" value={formatEur(totalEur)} />
        <Kpi label="L/100km frota" value={fleetAvgPer100 ? fleetAvgPer100.toFixed(1) : "—"} />
        <Kpi label="Anomalias abertas" value={formatNumber(anomaliesOpen[0]?.n ?? 0)} accent={(anomaliesOpen[0]?.n ?? 0) > 0 ? "destructive" : "muted"} />
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Consumo médio frota por dia (CANBUS)</CardTitle>
        </CardHeader>
        <CardContent>
          <SimpleLineChart data={chartData} yLabel="L/dia médio" />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Top anomalias abertas</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Matrícula</th>
                  <th>Tipo</th>
                  <th>Severidade</th>
                  <th className="text-right">Desvio</th>
                  <th>Detectada</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {topAnomalies.length === 0 ? (
                  <tr><td colSpan={6} className="text-center py-6 text-muted-foreground">Sem anomalias abertas — frota estável.</td></tr>
                ) : topAnomalies.map((a) => (
                  <tr key={a.id}>
                    <td className="font-mono">{a.plate}</td>
                    <td className="text-xs">{a.kind}</td>
                    <td>
                      <StatusPill status={a.severity === "high" ? "red" : "yellow"}>{a.severity}</StatusPill>
                    </td>
                    <td className="text-right font-mono">
                      {a.deviationPct ? `+${(a.deviationPct * 100).toFixed(1)}%` : "—"}
                    </td>
                    <td className="text-xs">{formatDate(a.detectedAt)}</td>
                    <td><Button size="sm" variant="outline" asChild><Link href={`/fuel/${a.plate}`}>Abrir viatura</Link></Button></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Ranking por viatura · L/100km (30d)</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Matrícula</th>
                  <th>Tipologia</th>
                  <th className="text-right">Litros</th>
                  <th className="text-right">Km</th>
                  <th className="text-right">L/100km</th>
                  <th className="text-right">Abastec.</th>
                  <th className="text-right">% bomba interna</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {ranking.map((r) => {
                  const per100 = r.totalKm > 0 ? (r.totalLiters * 100) / r.totalKm : 0;
                  return (
                    <tr key={r.vehicleId}>
                      <td className="font-mono">{r.plate}</td>
                      <td className="text-xs">{r.kind}</td>
                      <td className="text-right font-mono">{formatNumber(r.totalLiters)}</td>
                      <td className="text-right font-mono">{formatNumber(r.totalKm)}</td>
                      <td className="text-right font-mono">{per100 > 0 ? per100.toFixed(1) : "—"}</td>
                      <td className="text-right font-mono">{r.fillCount}</td>
                      <td className="text-right font-mono">{r.bombaPct.toFixed(0)}%</td>
                      <td><Button size="sm" variant="outline" asChild><Link href={`/fuel/${r.plate}`}>Abrir</Link></Button></td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
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
