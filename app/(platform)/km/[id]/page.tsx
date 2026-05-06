import { notFound } from "next/navigation";
import Link from "next/link";
import { db } from "@/db/client";
import { kmReconciliations, trips, vehicles, drivers, clients, auditLog, users } from "@/db/schema";
import { and, desc, eq } from "drizzle-orm";
import { requireRole } from "@/lib/auth/session";
import { PageHeader } from "@/components/ui/page-header";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { StatusPill } from "@/components/ui/status-pill";
import { Input } from "@/components/ui/input";
import { formatKm } from "@/lib/money";
import { formatDate, formatDateTime } from "@/lib/dates";
import { approveReconciliation, useGpsValue, rejectReconciliation } from "../actions";

export default async function KmDetailPage({ params }: { params: Promise<{ id: string }> }) {
  await requireRole(["admin", "clarice", "admin_faturacao"]);
  const { id } = await params;

  const [row] = await db
    .select({
      id: kmReconciliations.id,
      state: kmReconciliations.state,
      kmDeclared: kmReconciliations.kmDeclared,
      kmGps: kmReconciliations.kmGps,
      deltaKm: kmReconciliations.deltaKm,
      thresholdKm: kmReconciliations.thresholdKm,
      proposedKm: kmReconciliations.proposedKm,
      finalKm: kmReconciliations.finalKm,
      decidedAt: kmReconciliations.decidedAt,
      decisionReason: kmReconciliations.decisionReason,
      tripExternal: trips.externalId,
      startedAt: trips.startedAt,
      endedAt: trips.endedAt,
      origin: trips.origin,
      destination: trips.destination,
      notes: trips.notes,
      plate: vehicles.plate,
      kind: vehicles.kind,
      driverName: drivers.name,
      clientName: clients.name,
    })
    .from(kmReconciliations)
    .innerJoin(trips, eq(trips.id, kmReconciliations.tripId))
    .innerJoin(vehicles, eq(vehicles.id, trips.vehicleId))
    .leftJoin(drivers, eq(drivers.id, trips.driverId))
    .leftJoin(clients, eq(clients.id, trips.clientId))
    .where(eq(kmReconciliations.id, id))
    .limit(1);

  if (!row) notFound();

  const audits = await db
    .select({
      id: auditLog.id,
      action: auditLog.action,
      before: auditLog.before,
      after: auditLog.after,
      reason: auditLog.reason,
      createdAt: auditLog.createdAt,
      userName: users.name,
    })
    .from(auditLog)
    .leftJoin(users, eq(users.id, auditLog.userId))
    .where(and(eq(auditLog.entityType, "km_reconciliation"), eq(auditLog.entityId, id)))
    .orderBy(desc(auditLog.createdAt))
    .limit(10);

  const stateMap: Record<string, { label: string; pill: "green" | "yellow" | "red" }> = {
    green: { label: "Verde · auto", pill: "green" },
    yellow: { label: "Amarela · ajustar", pill: "yellow" },
    red: { label: "Vermelha · investigar", pill: "red" },
  };

  const decided = row.decidedAt != null;
  const durationMin = Math.round((row.endedAt.getTime() - row.startedAt.getTime()) / 60000);

  return (
    <div className="space-y-6">
      <PageHeader
        title={`Reconciliação ${row.tripExternal}`}
        description={`${row.plate} · ${formatDate(row.startedAt)} · ${row.kind}`}
        actions={
          <div className="flex items-center gap-2">
            <Button variant="outline" asChild>
              <Link href="/km">Voltar</Link>
            </Button>
            <StatusPill status={stateMap[row.state]?.pill ?? "neutral"}>{stateMap[row.state]?.label ?? row.state}</StatusPill>
          </div>
        }
      />

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Logue Trans · declarado</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <Kv label="Km declarado" value={formatKm(row.kmDeclared)} />
            <Kv label="Motorista" value={row.driverName ?? "—"} />
            <Kv label="Origem" value={row.origin ?? "—"} />
            <Kv label="Destino" value={row.destination ?? "—"} />
            <Kv label="Início" value={formatDateTime(row.startedAt)} />
            <Kv label="Fim" value={formatDateTime(row.endedAt)} />
            <Kv label="Duração" value={`${durationMin} min`} />
            {row.notes && <div className="text-xs text-muted-foreground italic">{row.notes}</div>}
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Frotcom · GPS</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <Kv label="Km GPS" value={formatKm(row.kmGps)} strong />
            <Kv label="Δ vs declarado" value={row.deltaKm != null ? `${row.deltaKm > 0 ? "+" : ""}${row.deltaKm.toFixed(1)} km` : "—"} />
            <Kv label="Threshold" value={`±${row.thresholdKm} km`} />
            {row.proposedKm != null && (
              <Kv label="Proposto pelo sistema" value={formatKm(row.proposedKm)} />
            )}
            {row.kmGps == null && (
              <div className="rounded-md bg-destructive/10 text-destructive p-2 text-xs">
                GPS indisponível nesta viagem — requer decisão humana.
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {!decided && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Decisão</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="rounded-md border border-border bg-secondary/30 p-3 text-xs leading-relaxed text-muted-foreground">
              <strong className="text-foreground">Como decidir:</strong> usar GPS quando a leitura Frotcom explica o
              desvio, aprovar manualmente quando há evidência operacional, ou rejeitar quando não existe confiança
              suficiente. Qualquer alteração fica no registo de auditoria.
            </div>
            {row.state === "yellow" && row.kmGps != null && (
              <form action={useGpsValue} className="flex items-center gap-3">
                <input type="hidden" name="reconciliationId" value={row.id} />
                <Input name="reason" placeholder="Motivo (opcional)" className="max-w-md" />
                <Button type="submit" variant="success">
                  Usar valor GPS ({formatKm(row.kmGps)})
                </Button>
              </form>
            )}
            <form action={approveReconciliation} className="flex items-center gap-3">
              <input type="hidden" name="reconciliationId" value={row.id} />
              <Input name="finalKm" type="number" step="0.1" placeholder={`ex: ${row.kmGps ?? row.kmDeclared ?? ""}`} className="max-w-[160px]" />
              <Input name="reason" placeholder="Motivo da alteração manual" className="max-w-md" />
              <Button type="submit" variant={row.state === "green" ? "success" : "default"}>
                {row.state === "green" ? "Aprovar" : "Aprovar com valor manual"}
              </Button>
            </form>
            <form action={rejectReconciliation} className="flex items-center gap-3">
              <input type="hidden" name="reconciliationId" value={row.id} />
              <Input name="reason" placeholder="Motivo da rejeição (obrigatório)" required className="max-w-md" />
              <Button type="submit" variant="destructive">
                Rejeitar
              </Button>
            </form>
          </CardContent>
        </Card>
      )}

      {decided && (
        <Card>
          <CardContent className="p-4 text-sm">
            <div className="font-medium text-success">Decidida em {formatDateTime(row.decidedAt!)}</div>
            <div className="text-xs text-muted-foreground mt-1">Km final: {formatKm(row.finalKm)}</div>
            {row.decisionReason && <div className="text-xs mt-1">Motivo: {row.decisionReason}</div>}
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Histórico ({audits.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {audits.length === 0 ? (
            <div className="text-sm text-muted-foreground">Sem decisões humanas ainda.</div>
          ) : (
            <ul className="space-y-2 text-sm">
              {audits.map((a) => (
                <li key={a.id} className="border-b border-border pb-2 last:border-0">
                  <div className="flex justify-between">
                    <span className="text-xs font-medium">{kmAuditLabel(a.action)}</span>
                    <span className="text-xs text-muted-foreground">{formatDateTime(a.createdAt)}</span>
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {a.userName ?? "—"} · {a.reason ?? "(sem motivo)"}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function Kv({ label, value, strong = false }: { label: string; value: string; strong?: boolean }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-xs text-muted-foreground">{label}</span>
      <span className={`font-mono ${strong ? "text-base font-semibold" : ""}`}>{value}</span>
    </div>
  );
}

function kmAuditLabel(action: string): string {
  if (action === "km.approve") return "Quilómetros aprovados";
  if (action === "km.use_gps") return "Valor GPS aplicado";
  if (action === "km.manual_override") return "Valor manual aplicado";
  if (action === "km.reject") return "Reconciliação rejeitada";
  return action;
}
