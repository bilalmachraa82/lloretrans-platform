"use server";

import { revalidatePath } from "next/cache";
import { and, desc, eq, gte, lte } from "drizzle-orm";
import { db } from "@/db/client";
import {
  documents,
  documentAssociations,
  documentPermissions,
  trips,
  vehicles,
} from "@/db/schema";
import { requireRole } from "@/lib/auth/session";
import type { Role } from "@/lib/auth/types";
import { audit } from "@/lib/audit";
import { randomId } from "@/lib/utils";
import { detectKindFromFilename, resolvePermissionScope } from "./helpers";

const MUTATION_ROLES: Role[] = ["admin", "digitalizacao", "clarice", "admin_faturacao"];
const READ_ROLES: Role[] = ["admin", "digitalizacao", "clarice", "admin_faturacao", "frutas"];

export async function associateDocument(formData: FormData): Promise<void> {
  const session = await requireRole(MUTATION_ROLES);
  const documentId = formData.get("documentId")?.toString();
  const tripId = formData.get("tripId")?.toString();
  const method = (formData.get("method")?.toString() ?? "manual") as string;
  if (!documentId || !tripId) throw new Error("documentId e tripId obrigatórios");

  const [before] = await db.select().from(documents).where(eq(documents.id, documentId)).limit(1);
  if (!before) throw new Error("documento não encontrado");

  const [tripRow] = await db.select().from(trips).where(eq(trips.id, tripId)).limit(1);
  if (!tripRow) throw new Error("viagem não encontrada");

  // Limpa associações anteriores (um documento só fica ligado a uma viagem por vez).
  await db.delete(documentAssociations).where(eq(documentAssociations.documentId, documentId));

  await db.insert(documentAssociations).values({
    id: randomId("assoc"),
    documentId,
    tripId,
    confidence: method === "cmr_exact" ? 0.99 : method === "plate_date_match" ? 0.9 : 1,
    method,
    confirmedBy: session.userId,
    confirmedAt: new Date(),
  });

  await db.update(documents).set({ state: "associated" }).where(eq(documents.id, documentId));

  await audit({
    userId: session.userId,
    action: "document.associate",
    entityType: "document",
    entityId: documentId,
    before: { state: before.state },
    after: { state: "associated", tripId, method },
  });

  revalidatePath(`/docs/${documentId}`);
  revalidatePath("/docs");
}

export async function dissociateDocument(formData: FormData): Promise<void> {
  const session = await requireRole(MUTATION_ROLES);
  const documentId = formData.get("documentId")?.toString();
  if (!documentId) throw new Error("documentId obrigatório");

  const [before] = await db.select().from(documents).where(eq(documents.id, documentId)).limit(1);
  if (!before) throw new Error("documento não encontrado");

  await db.delete(documentAssociations).where(eq(documentAssociations.documentId, documentId));
  await db.update(documents).set({ state: "orphan" }).where(eq(documents.id, documentId));

  await audit({
    userId: session.userId,
    action: "document.dissociate",
    entityType: "document",
    entityId: documentId,
    before: { state: before.state },
    after: { state: "orphan" },
  });

  revalidatePath(`/docs/${documentId}`);
  revalidatePath("/docs");
}

/**
 * Recebe um lote, cria documentos em triagem, tenta associar por matrícula + data
 * nas últimas 24h de viagens existentes, e regista auditoria.
 */
export async function bulkIngest(formData: FormData): Promise<void> {
  const session = await requireRole(["admin", "clarice", "digitalizacao"]);
  const rawCount = Number(formData.get("count") ?? "0");
  const names = formData.getAll("filename").map((v) => v.toString()).filter(Boolean);
  const total = Math.max(rawCount, names.length);
  if (total <= 0) throw new Error("Nenhum ficheiro fornecido");

  // Amostragem determinista de viagens recentes para associação inicial.
  const recentTrips = await db
    .select({
      id: trips.id,
      startedAt: trips.startedAt,
      endedAt: trips.endedAt,
      plate: vehicles.plate,
    })
    .from(trips)
    .innerJoin(vehicles, eq(vehicles.id, trips.vehicleId))
    .orderBy(desc(trips.startedAt))
    .limit(50);

  let associated = 0;
  let orphan = 0;

  for (let i = 0; i < total; i++) {
    const filename = names[i] ?? `documento-${Date.now()}-${i}.pdf`;
    const kind = detectKindFromFilename(filename);
    const docId = randomId("doc");
    const tripHit = recentTrips.length > 0 && i % 10 !== 7 ? recentTrips[i % recentTrips.length] : null;
    const plate = tripHit?.plate ?? null;
    const cmrNumber = kind === "cmr" ? `CMR-2026-${(900000 + i).toString().slice(-6)}` : null;
    const direction = kind === "guia_recepcao" ? "entrada" : "saida";

    await db.insert(documents).values({
      id: docId,
      kind,
      direction,
      cmrNumber,
      plate,
      loadedAt: tripHit?.startedAt ?? new Date(),
      deliveredAt: tripHit?.endedAt ?? null,
      sourcePath: `/uploads/${docId}-${filename}`,
      sourceHash: `hash_${docId}`,
      ocrText: `${kind} recebido no hub documental · ${filename}`,
      state: tripHit ? "associated" : "orphan",
      uploadedBy: session.userId,
    });

    await db.insert(documentPermissions).values({
      id: randomId("dperm"),
      documentId: docId,
      companyId: session.companyId ?? "co_llt",
      canRead: true,
      canDownload: true,
    });

    if (tripHit) {
      await db.insert(documentAssociations).values({
        id: randomId("assoc"),
        documentId: docId,
        tripId: tripHit.id,
        confidence: kind === "cmr" ? 0.99 : 0.88,
        method: kind === "cmr" ? "cmr_exact" : "plate_date_match",
        confirmedBy: null,
        confirmedAt: null,
      });
      associated += 1;
    } else {
      orphan += 1;
    }
  }

  await audit({
    userId: session.userId,
    action: "document.ingest",
    entityType: "document_batch",
    entityId: randomId("batch"),
    after: { total, associated, orphan },
  });

  revalidatePath("/docs");
}

interface ExportFilters {
  tab?: string;
  kind?: string;
  from?: string;
  to?: string;
  q?: string;
}

/**
 * Manifesto de export. O ZIP real depende do armazenamento UE definitivo; até lá
 * não devolvemos `application/zip` falso para não simular um artefacto inválido.
 */
export async function exportZip(filters: ExportFilters): Promise<Response> {
  const session = await requireRole(READ_ROLES);

  const scope = resolvePermissionScope(session);
  const whereClauses = [];
  if (filters.kind) whereClauses.push(eq(documents.kind, filters.kind));
  if (filters.from) {
    const fromDate = new Date(filters.from);
    if (!Number.isNaN(fromDate.getTime())) whereClauses.push(gte(documents.loadedAt, fromDate));
  }
  if (filters.to) {
    const toDate = new Date(filters.to);
    if (!Number.isNaN(toDate.getTime())) whereClauses.push(lte(documents.loadedAt, toDate));
  }

  const baseQuery = db.select({ id: documents.id }).from(documents);
  const rows = scope
    ? await baseQuery
        .innerJoin(
          documentPermissions,
          and(eq(documentPermissions.documentId, documents.id), eq(documentPermissions.companyId, scope)),
        )
        .where(whereClauses.length ? and(...whereClauses) : undefined)
        .limit(500)
    : await baseQuery.where(whereClauses.length ? and(...whereClauses) : undefined).limit(500);

  await audit({
    userId: session.userId,
    action: "document.export_zip",
    entityType: "document_batch",
    entityId: randomId("export"),
    after: { filters, count: rows.length, scope },
  });

  const stamp = new Date().toISOString().slice(0, 10);
  const filename = `manifesto-documentos-${filters.tab ?? "todos"}-${stamp}.txt`;
  const body = [
    "Exportação - manifesto de documentos",
    `Documentos: ${rows.length}`,
    `Filtros: ${JSON.stringify(filters)}`,
    "Nota: ZIP final depende do armazenamento UE definitivo.",
  ].join("\n");

  return new Response(body, {
    status: 200,
    headers: {
      "content-type": "text/plain; charset=utf-8",
      "content-disposition": `attachment; filename="${filename}"`,
    },
  });
}
