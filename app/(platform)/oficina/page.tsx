import Link from "next/link";
import { db } from "@/db/client";
import { workOrders, vehicles, users, workOrderItems } from "@/db/schema";
import { and, desc, eq, count } from "drizzle-orm";
import { getSession, requireRole } from "@/lib/auth/session";
import { PageHeader } from "@/components/ui/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { StatusPill } from "@/components/ui/status-pill";
import { formatDate, formatDateTime } from "@/lib/dates";
import { Plus, Wrench } from "lucide-react";
import { PwaLoader } from "./pwa-loader";

const STATE_MAP: Record<string, { label: string; pill: "green" | "yellow" | "red" | "neutral" }> = {
  draft: { label: "Rascunho", pill: "neutral" },
  submitted: { label: "A validar", pill: "yellow" },
  approved: { label: "Aprovada", pill: "green" },
  rejected: { label: "Rejeitada", pill: "red" },
};

export default async function OficinaPage() {
  const session = await requireRole(["admin", "clarice", "mecanico", "admin_oficina"]);
  const isMechanic = session.role === "mecanico";

  const whereClause = isMechanic
    ? eq(workOrders.mechanicId, session.userId)
    : eq(workOrders.state, "submitted");

  const [rows, byMechanic] = await Promise.all([
    db
      .select({
        id: workOrders.id,
        reference: workOrders.reference,
        state: workOrders.state,
        serviceCode: workOrders.serviceCode,
        summary: workOrders.summary,
        startedAt: workOrders.startedAt,
        approvedAt: workOrders.approvedAt,
        plate: vehicles.plate,
        mechanicName: users.name,
      })
      .from(workOrders)
      .innerJoin(vehicles, eq(vehicles.id, workOrders.vehicleId))
      .leftJoin(users, eq(users.id, workOrders.mechanicId))
      .where(whereClause)
      .orderBy(desc(workOrders.startedAt))
      .limit(30),
    isMechanic
      ? Promise.resolve([])
      : db
          .select({ mechanicId: workOrders.mechanicId, mechanicName: users.name, n: count() })
          .from(workOrders)
          .leftJoin(users, eq(users.id, workOrders.mechanicId))
          .where(eq(workOrders.state, "submitted"))
          .groupBy(workOrders.mechanicId, users.name),
  ]);

  return (
    <div className="space-y-6">
      <PwaLoader />

      <PageHeader
        title={isMechanic ? `Oficina · ${session.userName.split(" ")[0]}` : "Oficina · validação"}
        description={
          isMechanic
            ? `Tens ${rows.length} folhas · cria nova em <3 min`
            : `${rows.length} folhas submetidas a validar`
        }
        actions={
          <div className="flex gap-2">
            {isMechanic && (
              <Button asChild size="lg">
                <Link href="/oficina/new">
                  <Plus className="h-5 w-5" />
                  Nova folha
                </Link>
              </Button>
            )}
          </div>
        }
      />

      {isMechanic ? (
        <div className="grid gap-3">
          {rows.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center">
                <Wrench className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
                <div className="text-base font-medium">Sem folhas ainda</div>
                <div className="text-sm text-muted-foreground mt-1">Cria a tua primeira folha agora.</div>
                <Button asChild className="mt-4">
                  <Link href="/oficina/new">+ Nova folha</Link>
                </Button>
              </CardContent>
            </Card>
          ) : (
            rows.map((r) => (
              <Link key={r.id} href={`/oficina/${r.id}`}>
                <Card className="hover:border-primary/60 transition-colors">
                  <CardContent className="p-4 flex items-center justify-between gap-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <StatusPill status={STATE_MAP[r.state]?.pill ?? "neutral"}>{STATE_MAP[r.state]?.label ?? r.state}</StatusPill>
                        <Badge variant="secondary" className="font-mono text-[10px]">{r.serviceCode}</Badge>
                      </div>
                      <div className="font-mono text-sm">{r.reference}</div>
                      <div className="text-sm font-medium">{r.plate}</div>
                      <div className="text-xs text-muted-foreground">{formatDateTime(r.startedAt)}</div>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))
          )}
        </div>
      ) : (
        <>
          {byMechanic.length > 0 && (
            <div className="grid gap-3 sm:grid-cols-3">
              {byMechanic.map((m) => (
                <Card key={m.mechanicId}>
                  <CardContent className="p-4">
                    <div className="text-xs text-muted-foreground">{m.mechanicName ?? "—"}</div>
                    <div className="text-2xl font-semibold font-mono">{m.n}</div>
                    <div className="text-xs text-muted-foreground">folhas a validar</div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          <Card>
            <div className="overflow-x-auto">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Referência</th>
                    <th>Matrícula</th>
                    <th>Serviço</th>
                    <th>Mecânico</th>
                    <th>Submetida</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map((r) => (
                    <tr key={r.id}>
                      <td className="font-mono text-xs">{r.reference}</td>
                      <td className="font-mono">{r.plate}</td>
                      <td><Badge variant="secondary">{r.serviceCode}</Badge></td>
                      <td>{r.mechanicName}</td>
                      <td className="text-xs">{formatDate(r.startedAt)}</td>
                      <td><Button size="sm" variant="outline" asChild><Link href={`/oficina/${r.id}`}>Validar</Link></Button></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        </>
      )}
    </div>
  );
}
