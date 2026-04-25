import { notFound } from "next/navigation";
import Link from "next/link";
import { db } from "@/db/client";
import { vehicles, fuelReadingsCanbus, fuelFills, fuelAnomalies, drivers } from "@/db/schema";
import { and, desc, eq, gte } from "drizzle-orm";
import { requireRole } from "@/lib/auth/session";
import { PageHeader } from "@/components/ui/page-header";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { StatusPill } from "@/components/ui/status-pill";
import { Input } from "@/components/ui/input";
import { formatEur, formatNumber } from "@/lib/money";
import { formatDate, formatDateTime } from "@/lib/dates";
import { FuelComboChart } from "@/components/charts/combo-chart";
import { FUEL_PROVIDER_LABELS, type FuelProvider } from "@/lib/fuel/provider-model";
import { resolveAnomaly, reopenAnomaly } from "../actions";

export default async function VehicleFuelPage({ params }: { params: Promise<{ plate: string }> }) {
  await requireRole(["admin", "clarice"]);
  const { plate } = await params;

  const [vehicle] = await db.select().from(vehicles).where(eq(vehicles.plate, plate)).limit(1);
  if (!vehicle) notFound();

  const windowStart = new Date();
  windowStart.setDate(windowStart.getDate() - 60);

  const [canbus, fills, anomalies] = await Promise.all([
    db
      .select()
      .from(fuelReadingsCanbus)
      .where(and(eq(fuelReadingsCanbus.vehicleId, vehicle.id), gte(fuelReadingsCanbus.readAt, windowStart)))
      .orderBy(fuelReadingsCanbus.readAt),
    db
      .select({
        id: fuelFills.id,
        source: fuelFills.source,
        filledAt: fuelFills.filledAt,
        liters: fuelFills.liters,
        pricePerLiter: fuelFills.pricePerLiter,
        totalEur: fuelFills.totalEur,
        location: fuelFills.location,
        cardNumber: fuelFills.cardNumber,
        product: fuelFills.product,
        stationCountry: fuelFills.stationCountry,
        providerInvoiceNumber: fuelFills.providerInvoiceNumber,
        sourceFile: fuelFills.sourceFile,
        driverNameRaw: fuelFills.driverNameRaw,
        driverName: drivers.name,
      })
      .from(fuelFills)
      .leftJoin(drivers, eq(drivers.id, fuelFills.driverId))
      .where(and(eq(fuelFills.vehicleId, vehicle.id), gte(fuelFills.filledAt, windowStart)))
      .orderBy(desc(fuelFills.filledAt)),
    db
      .select()
      .from(fuelAnomalies)
      .where(eq(fuelAnomalies.vehicleId, vehicle.id))
      .orderBy(desc(fuelAnomalies.detectedAt)),
  ]);

  const byDay = new Map<string, { canbus: number; fill: number }>();
  for (const c of canbus) {
    const k = c.readAt.toISOString().slice(0, 10);
    const cur = byDay.get(k) ?? { canbus: 0, fill: 0 };
    cur.canbus += c.litersConsumed ?? 0;
    byDay.set(k, cur);
  }
  for (const f of fills) {
    const k = f.filledAt.toISOString().slice(0, 10);
    const cur = byDay.get(k) ?? { canbus: 0, fill: 0 };
    cur.fill += f.liters;
    byDay.set(k, cur);
  }
  const chartData = [...byDay.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([day, { canbus: c, fill }]) => ({ label: day.slice(5), canbus: Math.round(c * 10) / 10, fill: Math.round(fill * 10) / 10 }));

  const totalLiters = fills.reduce((a, f) => a + f.liters, 0);
  const totalEur = fills.reduce((a, f) => a + (f.totalEur ?? 0), 0);
  const totalCanbus = canbus.reduce((a, c) => a + (c.litersConsumed ?? 0), 0);
  const kmRange = canbus.length > 1 ? (canbus[canbus.length - 1].odometerKm ?? 0) - (canbus[0].odometerKm ?? 0) : 0;
  const per100 = kmRange > 0 ? (totalCanbus * 100) / kmRange : 0;

  return (
    <div className="space-y-6">
      <PageHeader
        title={`Viatura ${vehicle.plate}`}
        description={`${vehicle.kind} · 60 dias · ${vehicle.isInternal ? "interna" : "externa"}`}
        actions={<Button variant="outline" asChild><Link href="/fuel">← Voltar</Link></Button>}
      />

      <div className="grid gap-4 sm:grid-cols-4">
        <Kpi label="L/100km (60d)" value={per100 > 0 ? per100.toFixed(1) : "—"} />
        <Kpi label="Total abastecido" value={`${formatNumber(totalLiters)} L`} />
        <Kpi label="Custo (60d)" value={formatEur(totalEur)} />
        <Kpi label="Abastecimentos" value={String(fills.length)} />
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Abastecimentos vs odómetro disponível</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="mb-3 text-xs text-muted-foreground">
            Sinalização demo baseada em abastecimentos + odómetro disponível. Validação final depende da API Frotcom de leitura.
          </p>
          <FuelComboChart data={chartData} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle className="text-base">Anomalias ({anomalies.length})</CardTitle></CardHeader>
        <CardContent>
          {anomalies.length === 0 ? (
            <div className="text-sm text-muted-foreground">Sem anomalias para esta viatura.</div>
          ) : (
            <ul className="space-y-3">
              {anomalies.map((a) => (
                <li key={a.id} className="border-b border-border pb-3 last:border-0">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <StatusPill status={a.state === "open" ? "red" : "green"}>{a.state}</StatusPill>
                      <Badge variant={a.severity === "high" ? "destructive" : "warning"}>{a.severity}</Badge>
                      <span className="text-xs text-muted-foreground">{formatDate(a.detectedAt)}</span>
                    </div>
                    {a.state === "open" ? (
                      <form action={resolveAnomaly} className="flex items-center gap-2">
                        <input type="hidden" name="anomalyId" value={a.id} />
                        <Input name="reason" placeholder="Motivo da resolução" required className="max-w-xs" />
                        <Button type="submit" size="sm" variant="success">Marcar resolvida</Button>
                      </form>
                    ) : (
                      <form action={reopenAnomaly}>
                        <input type="hidden" name="anomalyId" value={a.id} />
                        <Button type="submit" size="sm" variant="outline">Reabrir</Button>
                      </form>
                    )}
                  </div>
                  <div className="text-xs text-muted-foreground mt-1">
                    {a.kind} · esperado {a.expected?.toFixed(1)} L · actual {a.actual?.toFixed(1)} L · desvio {a.deviationPct ? `+${(a.deviationPct * 100).toFixed(1)}%` : "—"}
                  </div>
                  {a.notes && <div className="text-xs mt-1 italic">{a.notes}</div>}
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle className="text-base">Abastecimentos ({fills.length})</CardTitle></CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Quando</th>
                  <th>Fonte</th>
                  <th>Produto</th>
                  <th>País</th>
                  <th>Local</th>
                  <th>Motorista</th>
                  <th>Cartão</th>
                  <th>Fatura fornecedor</th>
                  <th>Ficheiro origem</th>
                  <th className="text-right">Litros</th>
                  <th className="text-right">€/L</th>
                  <th className="text-right">Total</th>
                </tr>
              </thead>
              <tbody>
                {fills.slice(0, 100).map((f) => (
                  <tr key={f.id}>
                    <td className="text-xs whitespace-nowrap">{formatDateTime(f.filledAt)}</td>
                    <td><Badge variant={f.source === "bomba_interna" ? "default" : "secondary"}>{providerLabel(f.source)}</Badge></td>
                    <td className="text-xs">{f.product ?? "—"}</td>
                    <td className="text-xs">{f.stationCountry ?? "—"}</td>
                    <td className="text-xs">{f.location}</td>
                    <td className="text-xs">{f.driverName ?? f.driverNameRaw ?? "—"}</td>
                    <td className="font-mono text-xs">{f.cardNumber}</td>
                    <td className="font-mono text-xs">{f.providerInvoiceNumber ?? "—"}</td>
                    <td className="text-xs">{f.sourceFile ?? "—"}</td>
                    <td className="text-right font-mono">{formatNumber(f.liters)}</td>
                    <td className="text-right font-mono">{f.pricePerLiter?.toFixed(3) ?? "—"}</td>
                    <td className="text-right font-mono">{formatEur(f.totalEur)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function providerLabel(source: string): string {
  return FUEL_PROVIDER_LABELS[source as FuelProvider] ?? source;
}

function Kpi({ label, value }: { label: string; value: string }) {
  return (
    <Card>
      <CardContent className="p-4">
        <div className="text-xs text-muted-foreground">{label}</div>
        <div className="text-2xl font-semibold font-mono">{value}</div>
      </CardContent>
    </Card>
  );
}
