import { notFound } from "next/navigation";
import Link from "next/link";
import { db } from "@/db/client";
import {
  workOrders,
  workOrderItems,
  workOrderPhotos,
  workOrderSignatures,
  workOrderChecklistAnswers,
  vehicles,
  users,
  auditLog,
} from "@/db/schema";
import { WORKSHOP_CHECKLIST, type ChecklistItemKey } from "@/lib/workshop-checklist";
import { and, desc, eq } from "drizzle-orm";
import { requireRole } from "@/lib/auth/session";
import { isSuperAdminRole } from "@/lib/auth/types";
import { PageHeader } from "@/components/ui/page-header";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { StatusPill } from "@/components/ui/status-pill";
import { Input } from "@/components/ui/input";
import { formatEur } from "@/lib/money";
import { formatDateTime } from "@/lib/dates";
import { Box, CirclePause, CirclePlay } from "lucide-react";
import {
  approveWorkOrder,
  rejectWorkOrder,
  exportWorkOrder,
  startWorkOrder,
  pauseWorkOrder,
  resumeWorkOrder,
} from "../actions";

const STATE_MAP: Record<string, { label: string; pill: "green" | "yellow" | "red" | "neutral" }> = {
  draft: { label: "Rascunho", pill: "neutral" },
  in_progress: { label: "A trabalhar", pill: "green" },
  paused: { label: "Em pausa", pill: "yellow" },
  waiting_parts: { label: "Espera peças", pill: "yellow" },
  submitted: { label: "A validar", pill: "yellow" },
  approved: { label: "Aprovada", pill: "green" },
  rejected: { label: "Rejeitada", pill: "red" },
};

export default async function WorkOrderDetail({ params }: { params: Promise<{ id: string }> }) {
  const session = await requireRole(["admin", "clarice", "mecanico", "admin_oficina"]);
  const { id } = await params;

  const [wo] = await db
    .select({
      id: workOrders.id,
      reference: workOrders.reference,
      state: workOrders.state,
      serviceCode: workOrders.serviceCode,
      workCode: workOrders.workCode,
      summary: workOrders.summary,
      startedAt: workOrders.startedAt,
      endedAt: workOrders.endedAt,
      durationMinutes: workOrders.durationMinutes,
      activeMinutes: workOrders.activeMinutes,
      pausedMinutes: workOrders.pausedMinutes,
      lastPausedAt: workOrders.lastPausedAt,
      pauseReason: workOrders.pauseReason,
      approvedAt: workOrders.approvedAt,
      exportedAt: workOrders.exportedAt,
      plate: vehicles.plate,
      kind: vehicles.kind,
      mechanicId: workOrders.mechanicId,
      mechanicName: users.name,
    })
    .from(workOrders)
    .innerJoin(vehicles, eq(vehicles.id, workOrders.vehicleId))
    .leftJoin(users, eq(users.id, workOrders.mechanicId))
    .where(eq(workOrders.id, id))
    .limit(1);
  if (!wo) notFound();

  if (session.role === "mecanico" && wo.mechanicId !== session.userId) {
    throw new Error("FORBIDDEN: não pode ver folhas de outros mecânicos");
  }

  const [items, photos, signatures, checklistAnswers, audits] = await Promise.all([
    db.select().from(workOrderItems).where(eq(workOrderItems.workOrderId, id)),
    db.select().from(workOrderPhotos).where(eq(workOrderPhotos.workOrderId, id)),
    db.select().from(workOrderSignatures).where(eq(workOrderSignatures.workOrderId, id)),
    db.select().from(workOrderChecklistAnswers).where(eq(workOrderChecklistAnswers.workOrderId, id)),
    db
      .select({
        id: auditLog.id,
        action: auditLog.action,
        reason: auditLog.reason,
        createdAt: auditLog.createdAt,
        userName: users.name,
      })
      .from(auditLog)
      .leftJoin(users, eq(users.id, auditLog.userId))
      .where(and(eq(auditLog.entityType, "work_order"), eq(auditLog.entityId, id)))
      .orderBy(desc(auditLog.createdAt))
      .limit(10),
  ]);

  const total = items.reduce((a, i) => a + (i.total ?? (i.quantity * (i.unitPrice ?? 0))), 0);
  const isAdmin = isSuperAdminRole(session.role) || session.role === "admin_oficina";
  const isMechanic = session.role === "mecanico" && session.userId === wo.mechanicId;
  const canAct = isAdmin && wo.state === "submitted";
  const canExport = isAdmin && wo.state === "approved";
  const canStart = isMechanic && wo.state === "draft";
  const canPause = isMechanic && wo.state === "in_progress";
  const canResume = isMechanic && (wo.state === "paused" || wo.state === "waiting_parts");

  return (
    <div className="space-y-6">
      <PageHeader
        title={`Folha ${wo.reference}`}
        description={`${wo.plate} · ${wo.kind} · ${wo.mechanicName}`}
        actions={
          <div className="flex items-center gap-2">
            <Button variant="outline" asChild><Link href="/oficina">Voltar</Link></Button>
            <StatusPill status={STATE_MAP[wo.state]?.pill ?? "neutral"}>{STATE_MAP[wo.state]?.label}</StatusPill>
          </div>
        }
      />

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader><CardTitle className="text-base">Resumo</CardTitle></CardHeader>
          <CardContent className="grid gap-3 sm:grid-cols-2 text-sm">
            <Kv label="Serviço" value={wo.serviceCode ?? "—"} />
            <Kv label="Obra" value={wo.workCode ?? "—"} />
            <Kv label="Início" value={formatDateTime(wo.startedAt)} />
            <Kv label="Fim" value={wo.endedAt ? formatDateTime(wo.endedAt) : "—"} />
            {wo.durationMinutes && <Kv label="Duração total" value={`${wo.durationMinutes} min`} />}
            <Kv label="Tempo activo" value={`${wo.activeMinutes} min`} />
            <Kv label="Tempo pausa" value={`${wo.pausedMinutes} min`} />
            <Kv label="Total" value={formatEur(total)} strong />
            {wo.approvedAt && <Kv label="Aprovada em" value={formatDateTime(wo.approvedAt)} />}
            {wo.exportedAt && <Kv label="Exportada em" value={formatDateTime(wo.exportedAt)} />}
            {wo.summary && <div className="sm:col-span-2 text-xs text-muted-foreground italic border-t border-border pt-2">{wo.summary}</div>}
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="text-base">Acções</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            {canStart && (
              <form action={startWorkOrder}>
                <input type="hidden" name="id" value={wo.id} />
                <Button type="submit" variant="success" className="w-full">
                  <CirclePlay className="h-4 w-4" />
                  Iniciar trabalho
                </Button>
              </form>
            )}
            {canPause && (
              <>
                <form action={pauseWorkOrder} className="space-y-2">
                  <input type="hidden" name="id" value={wo.id} />
                  <input type="hidden" name="kind" value="paused" />
                  <Input name="reason" placeholder="Motivo da pausa" />
                  <Button type="submit" variant="outline" className="w-full">
                    <CirclePause className="h-4 w-4" />
                    Pausar
                  </Button>
                </form>
                <form action={pauseWorkOrder} className="space-y-2">
                  <input type="hidden" name="id" value={wo.id} />
                  <input type="hidden" name="kind" value="waiting_parts" />
                  <Input name="reason" placeholder="Descrição das peças" />
                  <Button type="submit" variant="outline" className="w-full">
                    <Box className="h-4 w-4" />
                    Aguardar peças
                  </Button>
                </form>
              </>
            )}
            {canResume && (
              <form action={resumeWorkOrder}>
                <input type="hidden" name="id" value={wo.id} />
                <Button type="submit" variant="success" className="w-full">
                  <CirclePlay className="h-4 w-4" />
                  Retomar trabalho
                </Button>
                {wo.pauseReason && (
                  <div className="text-xs text-muted-foreground mt-2 italic">Motivo: {wo.pauseReason}</div>
                )}
              </form>
            )}
            {canAct && (
              <>
                <form action={approveWorkOrder}>
                  <input type="hidden" name="id" value={wo.id} />
                  <Button type="submit" variant="success" className="w-full">Aprovar</Button>
                </form>
                <form action={rejectWorkOrder} className="space-y-2">
                  <input type="hidden" name="id" value={wo.id} />
                  <Input name="reason" placeholder="Motivo devolução" required />
                  <Button type="submit" variant="outline" className="w-full">Devolver para rascunho</Button>
                </form>
              </>
            )}
            {canExport && (
              <form action={exportWorkOrder}>
                <input type="hidden" name="id" value={wo.id} />
                <Button type="submit" className="w-full">Exportar para PHC Advanced</Button>
              </form>
            )}
            {!canStart && !canPause && !canResume && !canAct && !canExport && (
              <div className="text-xs text-muted-foreground">Nenhuma acção disponível para este estado e perfil.</div>
            )}
          </CardContent>
        </Card>
      </div>

      {checklistAnswers.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">
              Checklist ({checklistAnswers.length}/{WORKSHOP_CHECKLIST.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="grid gap-2 sm:grid-cols-2 text-sm">
              {checklistAnswers.map((a) => {
                const def = WORKSHOP_CHECKLIST.find((c) => c.key === (a.itemKey as ChecklistItemKey));
                return (
                  <li key={a.id} className="border border-border rounded-md p-2">
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-medium">{def?.label ?? a.itemKey}</span>
                      <div className="flex gap-1">
                        {a.substituted && <Badge variant="default" className="text-[10px]">Subst.</Badge>}
                        {a.verified && <Badge variant="success" className="text-[10px]">Verif.</Badge>}
                      </div>
                    </div>
                    {a.notes && <div className="text-xs text-muted-foreground mt-1">{a.notes}</div>}
                  </li>
                );
              })}
            </ul>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader><CardTitle className="text-base">Itens ({items.length})</CardTitle></CardHeader>
        <CardContent>
          <table className="data-table">
            <thead>
              <tr>
                <th>Tipo</th>
                <th>Descrição</th>
                <th>Código</th>
                <th className="text-right">Qt</th>
                <th className="text-right">Unit</th>
                <th className="text-right">Total</th>
              </tr>
            </thead>
            <tbody>
              {items.map((i) => (
                <tr key={i.id}>
                  <td><Badge variant={i.kind === "part" ? "default" : "secondary"}>{workOrderItemKindLabel(i.kind)}</Badge></td>
                  <td>{i.description}</td>
                  <td className="font-mono text-xs">{i.partCode ?? "—"}</td>
                  <td className="text-right font-mono">{i.quantity.toFixed(2)}</td>
                  <td className="text-right font-mono">{formatEur(i.unitPrice)}</td>
                  <td className="text-right font-mono">{formatEur(i.total ?? (i.quantity * (i.unitPrice ?? 0)))}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </CardContent>
      </Card>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader><CardTitle className="text-base">Fotos ({photos.length})</CardTitle></CardHeader>
          <CardContent>
            {photos.length === 0 ? (
              <div className="text-sm text-muted-foreground">Sem fotos.</div>
            ) : (
              <div className="grid grid-cols-3 gap-2">
                {photos.map((p) => (
                  <div key={p.id} className="overflow-hidden rounded-md border border-border bg-secondary">
                    {p.path.startsWith("data:image/") ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={p.path} alt={`Foto ${p.stage}`} className="aspect-square w-full object-cover" />
                    ) : (
                      <div className="aspect-square p-2 text-[10px] text-center grid place-items-center">
                        <div>
                          <div className="font-semibold">{p.stage}</div>
                          <div className="text-muted-foreground mt-1 break-all">{p.path}</div>
                        </div>
                      </div>
                    )}
                    <div className="border-t border-border px-2 py-1 text-[10px] font-semibold uppercase tracking-wide">
                      {photoStageLabel(p.stage)}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="text-base">Assinaturas ({signatures.length})</CardTitle></CardHeader>
          <CardContent>
            {signatures.length === 0 ? (
              <div className="text-sm text-muted-foreground">Sem assinaturas.</div>
            ) : (
              <div className="space-y-3">
                {signatures.map((s) => (
                  <div key={s.id} className="rounded-md border border-border p-3">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium">{s.signerName}</span>
                      <Badge variant="secondary" className="text-[10px]">{signatureRoleLabel(s.signerRole)}</Badge>
                    </div>
                    <svg viewBox="0 0 600 200" className="w-full h-24 border border-dashed border-border rounded bg-secondary/20">
                      <path d={s.svgPath} stroke="hsl(220 80% 40%)" strokeWidth="2" fill="none" strokeLinecap="round" />
                    </svg>
                    <div className="text-[10px] text-muted-foreground mt-1">{formatDateTime(s.signedAt)}</div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader><CardTitle className="text-base">Histórico</CardTitle></CardHeader>
        <CardContent>
          {audits.length === 0 ? (
            <div className="text-sm text-muted-foreground">Sem eventos.</div>
          ) : (
            <ul className="space-y-2 text-sm">
              {audits.map((a) => (
                <li key={a.id} className="border-b border-border pb-2 last:border-0">
                  <div className="flex justify-between">
                    <span className="text-xs font-medium">{workOrderAuditLabel(a.action)}</span>
                    <span className="text-xs text-muted-foreground">{formatDateTime(a.createdAt)}</span>
                  </div>
                  <div className="text-xs text-muted-foreground">{a.userName ?? "—"} · {a.reason ?? "(sem motivo)"}</div>
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

function photoStageLabel(stage: string): string {
  if (stage === "before") return "Antes";
  if (stage === "detail") return "Detalhe";
  if (stage === "after") return "Depois";
  return stage;
}

function signatureRoleLabel(role: string): string {
  if (role === "mechanic") return "Mecânico";
  if (role === "admin") return "Administração";
  return role;
}

function workOrderItemKindLabel(kind: string): string {
  if (kind === "part") return "Peça";
  if (kind === "labour") return "Mão-de-obra";
  return kind;
}

function workOrderAuditLabel(action: string): string {
  const labels: Record<string, string> = {
    "workorder.submit": "Folha de obra submetida",
    "workorder.pause": "Folha de obra pausada",
    "workorder.wait_parts": "Folha de obra a aguardar peças",
    "workorder.resume": "Folha de obra retomada",
    "workorder.approve": "Folha de obra aprovada",
    "workorder.reject": "Folha de obra devolvida",
    "workorder.export": "Preparação PHC Advanced",
    "workorder.start": "Trabalho iniciado",
  };
  return labels[action] ?? "Evento registado";
}
