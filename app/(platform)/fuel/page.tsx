import Link from "next/link";
import { db } from "@/db/client";
import { fuelReadingsCanbus, fuelFills, fuelAnomalies, vehicles } from "@/db/schema";
import { and, desc, eq, gte, lte, sum, count } from "drizzle-orm";
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
import fuelSummary from "@/fixtures/aitipro/fuel-summary.json";
import sourceManifest from "@/fixtures/aitipro/source-manifest.json";

const FUEL_PROVIDER_LABELS: Record<keyof typeof fuelSummary.providers, string> = {
  cepsa: "Cepsa",
  repsol: "Repsol",
  radius_velocity: "Radius",
  bomba_interna: "Bomba interna",
  frotcom_fee: "Frotcom",
};

const fuelSourceRows = Object.entries(fuelSummary.providers).map(([key, provider]) => ({
  label: FUEL_PROVIDER_LABELS[key as keyof typeof fuelSummary.providers] ?? key,
  rows: provider.rows,
  liters: provider.totalLiters,
}));

export default async function FuelPage() {
  await requireRole(["admin", "clarice"]);

  const windowDays = 30;
  const latestFillRows = await db
    .select({ filledAt: fuelFills.filledAt })
    .from(fuelFills)
    .orderBy(desc(fuelFills.filledAt))
    .limit(1);
  const windowEnd = latestFillRows[0]?.filledAt ?? new Date();
  const windowStart = new Date(windowEnd);
  windowStart.setDate(windowStart.getDate() - windowDays);
  const fillWindow = and(gte(fuelFills.filledAt, windowStart), lte(fuelFills.filledAt, windowEnd));
  const canbusWindow = and(gte(fuelReadingsCanbus.readAt, windowStart), lte(fuelReadingsCanbus.readAt, windowEnd));

  const [fillsAgg, fillRows, canbusRows, anomaliesOpen, topAnomalies] = await Promise.all([
    db
      .select({ totalLiters: sum(fuelFills.liters), totalEur: sum(fuelFills.totalEur), n: count() })
      .from(fuelFills)
      .where(fillWindow),
    db
      .select({ filledAt: fuelFills.filledAt, liters: fuelFills.liters })
      .from(fuelFills)
      .where(fillWindow)
      .orderBy(fuelFills.filledAt),
    db
      .select({ readAt: fuelReadingsCanbus.readAt, liters: fuelReadingsCanbus.litersConsumed, odo: fuelReadingsCanbus.odometerKm })
      .from(fuelReadingsCanbus)
      .where(canbusWindow)
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

  // Aggregate per day for chart. Board readings win; fuel fills provide the operational fallback.
  const byDay = new Map<string, { liters: number; count: number }>();
  const chartSource = canbusRows.length > 0
    ? canbusRows.map((r) => ({ date: r.readAt, liters: r.liters ?? 0 }))
    : fillRows.map((r) => ({ date: r.filledAt, liters: r.liters ?? 0 }));
  for (const r of chartSource) {
    const key = r.date.toISOString().slice(0, 10);
    const cur = byDay.get(key) ?? { liters: 0, count: 0 };
    cur.liters += r.liters;
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
  const consumptionRows = ranking.map((r) => {
    const per100 = r.totalKm > 0 ? (r.totalLiters * 100) / r.totalKm : 0;
    return { ...r, per100, hasReliableConsumption: isReliableConsumption(per100) };
  });
  const reliableConsumptionRows = consumptionRows.filter((r) => r.hasReliableConsumption);
  const fleetAvgPer100 = (() => {
    const sourceRows = reliableConsumptionRows.length > 0 ? reliableConsumptionRows : consumptionRows;
    const sumL = sourceRows.reduce((a: number, r) => a + r.totalLiters, 0);
    const sumKm = sourceRows.reduce((a: number, r) => a + r.totalKm, 0);
    return sumKm > 0 ? (sumL * 100) / sumKm : 0;
  })();
  const derivedAnomalies = reliableConsumptionRows
    .map((r) => {
      const deviationPct = fleetAvgPer100 > 0 ? (r.per100 - fleetAvgPer100) / fleetAvgPer100 : 0;
      return { ...r, deviationPct, severity: deviationPct >= 0.28 ? "high" : "medium" };
    })
    .filter((r) => r.deviationPct >= 0.15)
    .sort((a, b) => b.deviationPct - a.deviationPct)
    .slice(0, 10);
  const visibleAnomalyCount = (anomaliesOpen[0]?.n ?? 0) > 0 ? (anomaliesOpen[0]?.n ?? 0) : derivedAnomalies.length;

  const reportDate = windowEnd;
  const dateWindowLabel = `${formatDate(windowStart)} a ${formatDate(windowEnd)}`;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Combustível · últimos 30 dias disponíveis"
        description={`Janela ${dateWindowLabel} · abastecimentos reais Cepsa, Repsol, Radius Velocity e bomba interna`}
        actions={
          <form action={exportMonthlyReport} className="flex gap-2">
            <input type="hidden" name="year" value={reportDate.getFullYear()} />
            <input type="hidden" name="month" value={reportDate.getMonth() + 1} />
            <Button type="submit" variant="outline">Exportar relatório mensal</Button>
          </form>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Kpi label="Total litros (30d)" value={`${formatNumber(totalLiters)} L`} />
        <Kpi label="Custo total (30d)" value={formatEur(totalEur)} />
        <Kpi label="L/100km frota" value={fleetAvgPer100 ? fleetAvgPer100.toFixed(1) : "—"} />
        <Kpi label="Desvios a investigar" value={formatNumber(visibleAnomalyCount)} accent={visibleAnomalyCount > 0 ? "destructive" : "muted"} />
      </div>

      <Card>
        <CardContent className="p-4 text-sm text-muted-foreground">
          <strong className="text-foreground">Fonte carregada:</strong>{" "}
          {fuelSourceRows.map((provider) => `${provider.label} ${formatNumber(provider.rows)} linhas`).join(" · ")}.
          Manifesto gerado em {formatDate(new Date(sourceManifest.generatedAt))}. O anexo Frotcom recebido é
          mensalidade/equipamento, não leitura operacional por viatura.
        </CardContent>
      </Card>

      <Card>
        <CardContent className="grid gap-3 p-4 text-sm text-muted-foreground lg:grid-cols-3">
          <div>
            <strong className="text-foreground">1. Consolidação</strong>
            <div className="mt-1">Cartões frota e bomba interna entram numa única leitura por matrícula.</div>
          </div>
          <div>
            <strong className="text-foreground">2. Baseline</strong>
            <div className="mt-1">A plataforma calcula L/100km com odómetro disponível e compara contra a frota.</div>
          </div>
          <div>
            <strong className="text-foreground">3. Acção</strong>
            <div className="mt-1">Os desvios passam para uma fila de validação antes de fechar custos e decisões.</div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Sinalização diária</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="mb-3 text-xs text-muted-foreground">
            Sinalização baseada em abastecimentos e odómetro disponível. A leitura de bordo fica sujeita a validação técnica.
            {reliableConsumptionRows.length < ranking.length && (
              <> {ranking.length - reliableConsumptionRows.length} viaturas têm odómetro fora de escala e ficam marcadas para calibração.</>
            )}
          </p>
          <SimpleLineChart data={chartData} yLabel="L/dia médio" />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Desvios a investigar</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="mb-3 text-xs text-muted-foreground">
            {topAnomalies.length > 0
              ? "Alertas gravados no workflow operacional."
              : "Sinalização demonstrativa calculada a partir dos abastecimentos carregados enquanto a leitura CANBus Frotcom fica por activar."}
          </p>
          <div className="overflow-x-auto">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Matrícula</th>
                  <th>Tipo</th>
                  <th>Severidade</th>
                  <th className="text-right">Desvio</th>
                  <th>Referência</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {topAnomalies.length > 0 ? topAnomalies.map((a) => (
                  <tr key={a.id}>
                    <td className="font-mono">{a.plate}</td>
                    <td className="text-xs">{anomalyKindLabel(a.kind)}</td>
                    <td>
                      <StatusPill status={a.severity === "high" ? "red" : "yellow"}>{severityLabel(a.severity)}</StatusPill>
                    </td>
                    <td className="text-right font-mono">
                      {a.deviationPct ? `+${(a.deviationPct * 100).toFixed(1)}%` : "—"}
                    </td>
                    <td className="text-xs">{formatDate(a.detectedAt)}</td>
                    <td><Button size="sm" variant="outline" asChild><Link href={`/fuel/${a.plate}`}>Abrir viatura</Link></Button></td>
                  </tr>
                )) : derivedAnomalies.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-6 text-center text-muted-foreground">
                      Sem desvios relevantes nesta janela de dados.
                    </td>
                  </tr>
                ) : derivedAnomalies.map((a) => (
                  <tr key={a.vehicleId}>
                    <td className="font-mono">{a.plate}</td>
                    <td className="text-xs">Consumo acima do baseline</td>
                    <td>
                      <StatusPill status={a.severity === "high" ? "red" : "yellow"}>{severityLabel(a.severity)}</StatusPill>
                    </td>
                    <td className="text-right font-mono">+{(a.deviationPct * 100).toFixed(1)}%</td>
                    <td className="text-xs">{a.per100.toFixed(1)} L/100km vs {fleetAvgPer100.toFixed(1)}</td>
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
          <CardTitle className="text-base">Ranking por viatura · L/100km ({dateWindowLabel})</CardTitle>
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
                {consumptionRows.map((r) => {
                  return (
                    <tr key={r.vehicleId}>
                      <td className="font-mono">{r.plate}</td>
                      <td className="text-xs">{r.kind}</td>
                      <td className="text-right font-mono">{formatNumber(r.totalLiters)}</td>
                      <td className="text-right font-mono">{formatNumber(r.totalKm)}</td>
                      <td className="text-right font-mono">
                        {r.hasReliableConsumption ? r.per100.toFixed(1) : <span className="text-xs text-muted-foreground">a calibrar</span>}
                      </td>
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

function anomalyKindLabel(kind: string): string {
  const labels: Record<string, string> = {
    high_consumption: "Consumo elevado",
    impossible_fill: "Abastecimento incoerente",
    missing_odometer: "Odómetro em falta",
  };
  return labels[kind] ?? kind.replaceAll("_", " ");
}

function severityLabel(severity: string): string {
  if (severity === "high") return "Alta";
  if (severity === "medium") return "Média";
  if (severity === "low") return "Baixa";
  return severity;
}

function isReliableConsumption(per100: number): boolean {
  return per100 >= 10 && per100 <= 80;
}
