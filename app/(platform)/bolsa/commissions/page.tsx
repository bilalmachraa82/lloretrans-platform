import Link from "next/link";
import { db } from "@/db/client";
import { commissions, users, commissionRules } from "@/db/schema";
import { and, count, eq, sum } from "drizzle-orm";
import { requireRole } from "@/lib/auth/session";
import { PageHeader } from "@/components/ui/page-header";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { formatEur } from "@/lib/money";
import { computeCommissions, markCommissionsPaid } from "../actions";

export default async function CommissionsPage({
  searchParams,
}: {
  searchParams: Promise<{ period?: string }>;
}) {
  await requireRole(["admin", "clarice"]);
  const { period: paramPeriod } = await searchParams;
  const now = new Date();
  const defaultPeriod = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
  const period = paramPeriod ?? defaultPeriod;

  const rows = await db
    .select({
      salespersonId: commissions.salespersonId,
      salesName: users.name,
      totalLoads: count(),
      totalAccrued: sum(commissions.amountEur),
      state: commissions.state,
    })
    .from(commissions)
    .leftJoin(users, eq(users.id, commissions.salespersonId))
    .where(eq(commissions.period, period))
    .groupBy(commissions.salespersonId, users.name, commissions.state);

  const bySales = new Map<string, { name: string; accruedAmount: number; accruedCount: number; paidAmount: number; paidCount: number }>();
  for (const r of rows) {
    const cur = bySales.get(r.salespersonId) ?? { name: r.salesName ?? "—", accruedAmount: 0, accruedCount: 0, paidAmount: 0, paidCount: 0 };
    if (r.state === "accrued") {
      cur.accruedAmount += Number(r.totalAccrued ?? 0);
      cur.accruedCount += r.totalLoads;
    } else if (r.state === "paid") {
      cur.paidAmount += Number(r.totalAccrued ?? 0);
      cur.paidCount += r.totalLoads;
    }
    bySales.set(r.salespersonId, cur);
  }

  const rules = await db.select().from(commissionRules);

  return (
    <div className="space-y-6">
      <PageHeader
        title={`Comissões · ${period}`}
        description="Agregadas por comercial · calculadas mas não pagas / já pagas"
        actions={
          <div className="flex gap-2">
            <form>
              <Input type="month" name="period" defaultValue={period} className="h-9" />
            </form>
            <form action={computeCommissions}>
              <input type="hidden" name="period" value={period} />
              <Button type="submit" variant="outline">Recalcular</Button>
            </form>
            <Button variant="outline" asChild>
              <Link href="/bolsa">← Voltar</Link>
            </Button>
          </div>
        }
      />

      <Card>
        <CardContent className="p-4 text-xs text-muted-foreground space-y-1">
          <div>
            <strong>Regra confirmada (Éder, 2026-04-20):</strong> comissão = <code>20% do lucro total</code> + bónus fixo por carga.
            Só se aplica se a carga usou uma viatura interna Lloretrans.
          </div>
          {rules.map((r) => (
            <div key={r.id}>
              <code>{r.salespersonId ?? "default"}</code>:{" "}
              {(r.percentOfMargin * 100).toFixed(0)}% lucro
              {" + "}
              {formatEur(r.fixedBonusNationalEur)} nacional / {formatEur(r.fixedBonusInternationalEur)} internacional
              {r.requireInternalVehicle ? " · viatura interna obrigatória" : ""}
              {r.minMarginPct ? ` · margem mínima ${(r.minMarginPct * 100).toFixed(0)}%` : ""}
            </div>
          ))}
        </CardContent>
      </Card>

      <Card>
        <div className="overflow-x-auto">
          <table className="data-table">
            <thead>
              <tr>
                <th>Comercial</th>
                <th className="text-right">Cargas</th>
                <th className="text-right">Acumulado</th>
                <th className="text-right">Pago</th>
                <th className="text-right">Total</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {[...bySales.entries()].map(([id, s]) => (
                <tr key={id}>
                  <td>{s.name}</td>
                  <td className="text-right font-mono">{s.accruedCount + s.paidCount}</td>
                  <td className="text-right font-mono">
                    {formatEur(s.accruedAmount)} <Badge variant="warning" className="ml-1">{s.accruedCount}</Badge>
                  </td>
                  <td className="text-right font-mono">
                    {formatEur(s.paidAmount)} <Badge variant="success" className="ml-1">{s.paidCount}</Badge>
                  </td>
                  <td className="text-right font-mono font-semibold">{formatEur(s.accruedAmount + s.paidAmount)}</td>
                  <td>
                    {s.accruedAmount > 0 && (
                      <form action={markCommissionsPaid}>
                        <input type="hidden" name="period" value={period} />
                        <input type="hidden" name="salespersonId" value={id} />
                        <Button type="submit" size="sm" variant="outline">Marcar pago</Button>
                      </form>
                    )}
                  </td>
                </tr>
              ))}
              {bySales.size === 0 && (
                <tr>
                  <td colSpan={6} className="text-center text-muted-foreground py-6">
                    Sem comissões no período. Clica "Recalcular" para processar cargas em estado <code>paid</code>.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
