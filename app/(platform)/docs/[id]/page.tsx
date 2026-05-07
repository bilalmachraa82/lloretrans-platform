import { notFound } from "next/navigation";
import Link from "next/link";
import { db } from "@/db/client";
import {
  documents,
  documentAssociations,
  documentPermissions,
  trips,
  vehicles,
  clients,
  auditLog,
  users,
} from "@/db/schema";
import { and, desc, eq, gte, lte } from "drizzle-orm";
import { requireRole } from "@/lib/auth/session";
import { PageHeader } from "@/components/ui/page-header";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { StatusPill } from "@/components/ui/status-pill";
import { formatDate, formatDateTime } from "@/lib/dates";
import { associateDocument, dissociateDocument } from "../actions";
import { resolvePermissionScope } from "../helpers";

export default async function DocDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const session = await requireRole(["admin", "digitalizacao", "clarice", "admin_faturacao", "frutas"]);
  const { id } = await params;
  const scope = resolvePermissionScope(session);

  const docRows = scope
    ? await db
        .select({ doc: documents })
        .from(documents)
        .innerJoin(
          documentPermissions,
          and(eq(documentPermissions.documentId, documents.id), eq(documentPermissions.companyId, scope)),
        )
        .where(eq(documents.id, id))
        .limit(1)
    : await db.select({ doc: documents }).from(documents).where(eq(documents.id, id)).limit(1);
  const doc = docRows[0]?.doc;
  if (!doc) notFound();

  const existing = await db
    .select({
      id: documentAssociations.id,
      tripId: documentAssociations.tripId,
      confidence: documentAssociations.confidence,
      method: documentAssociations.method,
      confirmedAt: documentAssociations.confirmedAt,
      tripExternal: trips.externalId,
      origin: trips.origin,
      destination: trips.destination,
      startedAt: trips.startedAt,
      plate: vehicles.plate,
      clientName: clients.name,
    })
    .from(documentAssociations)
    .innerJoin(trips, eq(trips.id, documentAssociations.tripId))
    .innerJoin(vehicles, eq(vehicles.id, trips.vehicleId))
    .leftJoin(clients, eq(clients.id, trips.clientId))
    .where(eq(documentAssociations.documentId, id))
    .limit(1);

  interface Candidate {
    tripId: string;
    tripExternal: string;
    origin: string | null;
    destination: string | null;
    startedAt: Date;
    plate: string;
    clientName: string | null;
  }
  let candidates: Candidate[] = [];
  let candidateWindowLabel = "±24h";
  if (doc.state === "orphan" && doc.plate && doc.loadedAt) {
    const windowStart = new Date(doc.loadedAt.getTime() - 24 * 60 * 60 * 1000);
    const windowEnd = new Date(doc.loadedAt.getTime() + 24 * 60 * 60 * 1000);
    candidates = await db
      .select({
        tripId: trips.id,
        tripExternal: trips.externalId,
        origin: trips.origin,
        destination: trips.destination,
        startedAt: trips.startedAt,
        plate: vehicles.plate,
        clientName: clients.name,
      })
      .from(trips)
      .innerJoin(vehicles, eq(vehicles.id, trips.vehicleId))
      .leftJoin(clients, eq(clients.id, trips.clientId))
      .where(and(eq(vehicles.plate, doc.plate), gte(trips.startedAt, windowStart), lte(trips.startedAt, windowEnd)))
      .limit(8);
    if (candidates.length === 0) {
      candidateWindowLabel = "±7 dias";
      const widerStart = new Date(doc.loadedAt.getTime() - 7 * 24 * 60 * 60 * 1000);
      const widerEnd = new Date(doc.loadedAt.getTime() + 7 * 24 * 60 * 60 * 1000);
      candidates = await db
        .select({
          tripId: trips.id,
          tripExternal: trips.externalId,
          origin: trips.origin,
          destination: trips.destination,
          startedAt: trips.startedAt,
          plate: vehicles.plate,
          clientName: clients.name,
        })
        .from(trips)
        .innerJoin(vehicles, eq(vehicles.id, trips.vehicleId))
        .leftJoin(clients, eq(clients.id, trips.clientId))
        .where(and(eq(vehicles.plate, doc.plate), gte(trips.startedAt, widerStart), lte(trips.startedAt, widerEnd)))
        .orderBy(desc(trips.startedAt))
        .limit(8);
    }
  }

  const audits = await db
    .select({
      id: auditLog.id,
      action: auditLog.action,
      reason: auditLog.reason,
      createdAt: auditLog.createdAt,
      userName: users.name,
    })
    .from(auditLog)
    .leftJoin(users, eq(users.id, auditLog.userId))
    .where(and(eq(auditLog.entityType, "document"), eq(auditLog.entityId, id)))
    .orderBy(desc(auditLog.createdAt))
    .limit(10);

  const assoc = existing[0];
  const nextAction = assoc
    ? {
        status: "green" as const,
        title: "Evidência fechada",
        body: `Documento associado à viagem ${assoc.tripExternal}. Pode ficar como prova pesquisável ou ser desassociado se a ligação estiver errada.`,
      }
    : candidates.length > 0
      ? {
          status: "yellow" as const,
          title: "Confirmar associação",
          body: `Foram encontradas ${candidates.length} viagens candidatas pela matrícula ${doc.plate} na janela ${candidateWindowLabel}. Escolhe a viagem correcta abaixo.`,
        }
      : {
          status: "red" as const,
          title: "Validação manual necessária",
          body: "Não há correspondência automática suficiente. Rever matrícula/data extraída ou manter na fila de digitalização.",
        };

  return (
    <div className="space-y-6">
      <PageHeader
        title={`Documento ${doc.kind.toUpperCase()} ${doc.cmrNumber ? `· ${doc.cmrNumber}` : ""}`}
        description={`${doc.plate ?? "sem matrícula"} · ${doc.loadedAt ? formatDate(doc.loadedAt) : "sem data"}`}
        actions={
          <div className="flex gap-2">
            <Button variant="outline" asChild><Link href="/docs?tab=orphan">Voltar à fila</Link></Button>
            {assoc && (
              <form action={dissociateDocument}>
                <input type="hidden" name="documentId" value={doc.id} />
                <Button type="submit" variant="outline">Desassociar</Button>
              </form>
            )}
          </div>
        }
      />

      <Card className="border-[#d8e1df] bg-white shadow-elevated-sm">
        <CardContent className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="min-w-0">
            <StatusPill status={nextAction.status}>{docStateLabel(doc.state)}</StatusPill>
            <div className="mt-3 font-semibold text-[#1e2d3d]">{nextAction.title}</div>
            <p className="mt-1 max-w-3xl text-sm leading-relaxed text-muted-foreground">{nextAction.body}</p>
          </div>
          {!assoc && candidates.length > 0 && (
            <Button asChild>
              <a href="#associacao">Ver candidatos</a>
            </Button>
          )}
        </CardContent>
      </Card>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Documento original</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="aspect-[3/4] rounded-md border border-dashed border-border bg-secondary/50 grid place-items-center text-sm text-muted-foreground p-6 text-center">
              <div>
                <div className="font-semibold text-foreground">Ficheiro original associado</div>
                <div className="mt-2 leading-relaxed">
                  Pré-visualização completa indisponível neste piloto. Fonte importada:{" "}
                  <span className="font-mono text-foreground">{doc.sourcePath}</span>.
                </div>
                <div className="mt-4 rounded-md border border-border bg-white px-3 py-2 text-left text-xs leading-relaxed text-muted-foreground">
                  OCR disponível: {doc.ocrText ?? "sem texto extraído"}. O objectivo da página é validar metadados e ligar este comprovativo à viagem correcta.
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="space-y-4">
          <Card>
            <CardHeader><CardTitle className="text-base">Metadados extraídos</CardTitle></CardHeader>
            <CardContent className="space-y-2 text-sm">
              <Kv label="Tipo" value={docKindLabel(doc.kind)} />
              <Kv label="CMR" value={doc.cmrNumber ?? "—"} />
              <Kv label="Matrícula" value={doc.plate ?? "—"} />
              <Kv label="Data carga" value={doc.loadedAt ? formatDate(doc.loadedAt) : "—"} />
              <Kv label="Data entrega" value={doc.deliveredAt ? formatDate(doc.deliveredAt) : "—"} />
              <Kv label="Estado" value={docStateLabel(doc.state)} />
              {doc.ocrText && <div className="pt-2 border-t border-border text-xs text-muted-foreground italic">{doc.ocrText}</div>}
            </CardContent>
          </Card>

          {assoc ? (
            <Card>
              <CardHeader><CardTitle className="text-base">Viagem associada</CardTitle></CardHeader>
              <CardContent className="space-y-2 text-sm">
                <Kv label="Viagem" value={assoc.tripExternal} />
                <Kv label="Rota" value={`${assoc.origin ?? "—"} → ${assoc.destination ?? "—"}`} />
                <Kv label="Matrícula" value={assoc.plate} />
                <Kv label="Cliente" value={assoc.clientName ?? "—"} />
                <Kv label="Início" value={formatDateTime(assoc.startedAt)} />
                <Kv label="Método" value={associationMethodLabel(assoc.method as string)} />
                <Kv label="Confiança" value={`${((assoc.confidence as number) * 100).toFixed(0)}%`} />
              </CardContent>
            </Card>
          ) : (
            <Card id="associacao">
              <CardHeader><CardTitle className="text-base">Associação — candidatos ({candidateWindowLabel})</CardTitle></CardHeader>
              <CardContent>
                {candidates.length === 0 ? (
                  <div className="space-y-3 rounded-md border border-border bg-secondary/30 p-3 text-sm text-muted-foreground">
                    <div>
                      Sem viagens candidatas para esta matrícula e data. O documento fica na fila “A associar” até a digitalização corrigir os dados extraídos ou confirmar a viagem manualmente.
                    </div>
                    <Button size="sm" variant="outline" asChild><Link href="/docs?tab=orphan">Ver fila A associar</Link></Button>
                  </div>
                ) : (
                  <ul className="space-y-2 text-sm">
                    {candidates.map((c) => (
                      <li key={c.tripId} className="flex flex-col gap-3 rounded-md border border-border bg-white p-3 sm:flex-row sm:items-center sm:justify-between">
                        <div className="min-w-0">
                          <div className="font-mono text-xs">{c.tripExternal}</div>
                          <div className="text-xs text-muted-foreground">
                            {c.origin} → {c.destination} · {formatDateTime(c.startedAt)}
                          </div>
                          <div className="mt-1 text-xs text-muted-foreground">{c.clientName ?? "Cliente por confirmar"} · {c.plate}</div>
                        </div>
                        <form action={associateDocument}>
                          <input type="hidden" name="documentId" value={doc.id} />
                          <input type="hidden" name="tripId" value={c.tripId} />
                          <input type="hidden" name="method" value={candidateWindowLabel === "±24h" ? "plate_date_match" : "manual"} />
                          <Button type="submit" size="sm">Associar viagem</Button>
                        </form>
                      </li>
                    ))}
                  </ul>
                )}
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      <Card>
        <CardHeader><CardTitle className="text-base">Histórico ({audits.length})</CardTitle></CardHeader>
        <CardContent>
          {audits.length === 0 ? (
            <div className="text-sm text-muted-foreground">Sem alterações registadas.</div>
          ) : (
            <ul className="space-y-2 text-sm">
              {audits.map((a) => (
                <li key={a.id} className="border-b border-border pb-2 last:border-0">
                  <div className="flex justify-between">
                    <span className="text-xs font-medium">{documentAuditLabel(a.action)}</span>
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

function Kv({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-xs text-muted-foreground">{label}</span>
      <span className="font-mono text-sm">{value}</span>
    </div>
  );
}

function docKindLabel(kind: string): string {
  const labels: Record<string, string> = {
    cmr: "CMR",
    guia_remessa: "Guia remessa",
    guia_recepcao: "Guia recepção",
    ticket_frio: "Ticket frio",
    controlo_tara: "Controlo tara",
  };
  return labels[kind] ?? kind;
}

function docStateLabel(state: string): string {
  if (state === "associated") return "Associado";
  if (state === "orphan") return "Sem viagem associada";
  if (state === "pending_association") return "A associar";
  return state;
}

function associationMethodLabel(method: string): string {
  if (method === "cmr_exact") return "CMR exacto";
  if (method === "plate_date_match") return "Matrícula + data";
  if (method === "manual") return "Confirmação manual";
  return method;
}

function documentAuditLabel(action: string): string {
  if (action === "document.ingest") return "Documento recebido";
  if (action === "document.associate") return "Documento associado";
  if (action === "document.dissociate") return "Documento desassociado";
  if (action === "document.export_zip") return "Exportação preparada";
  return action;
}
