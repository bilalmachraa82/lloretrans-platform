import Link from "next/link";
import { db } from "@/db/client";
import { documents, documentAssociations, documentPermissions } from "@/db/schema";
import { and, desc, eq, like, or, count, gte, lte } from "drizzle-orm";
import { requireRole } from "@/lib/auth/session";
import { PageHeader } from "@/components/ui/page-header";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { StatusPill } from "@/components/ui/status-pill";
import { Input } from "@/components/ui/input";
import { formatDate } from "@/lib/dates";
import { Upload, Search } from "lucide-react";
import { resolvePermissionScope } from "./helpers";

export default async function DocsPage({
  searchParams,
}: {
  searchParams: Promise<{ tab?: string; q?: string; kind?: string; from?: string; to?: string; direction?: string }>;
}) {
  const session = await requireRole(["admin", "digitalizacao", "clarice", "admin_faturacao", "frutas"]);
  const { tab = "all", q, kind, from, to, direction } = await searchParams;

  const scope = resolvePermissionScope(session);

  const whereClauses = [];
  if (tab === "associated") whereClauses.push(eq(documents.state, "associated"));
  if (tab === "orphan") whereClauses.push(eq(documents.state, "orphan"));
  if (kind) whereClauses.push(eq(documents.kind, kind));
  if (direction === "entrada" || direction === "saida") whereClauses.push(eq(documents.direction, direction));
  if (from) whereClauses.push(gte(documents.loadedAt, new Date(from)));
  if (to) whereClauses.push(lte(documents.loadedAt, new Date(to)));
  if (q) {
    whereClauses.push(
      or(
        like(documents.cmrNumber, `%${q}%`),
        like(documents.plate, `%${q}%`),
        like(documents.ocrText, `%${q}%`),
      )!,
    );
  }

  const baseQuery = db
    .select({
      id: documents.id,
      kind: documents.kind,
      direction: documents.direction,
      cmrNumber: documents.cmrNumber,
      plate: documents.plate,
      loadedAt: documents.loadedAt,
      state: documents.state,
      createdAt: documents.createdAt,
    })
    .from(documents);

  const rows = scope
    ? await baseQuery
        .innerJoin(
          documentPermissions,
          and(eq(documentPermissions.documentId, documents.id), eq(documentPermissions.companyId, scope)),
        )
        .where(whereClauses.length ? and(...whereClauses) : undefined)
        .orderBy(desc(documents.createdAt))
        .limit(150)
    : await baseQuery
        .where(whereClauses.length ? and(...whereClauses) : undefined)
        .orderBy(desc(documents.createdAt))
        .limit(150);

  const scopedDocs = db
    .select({ n: count() })
    .from(documents)
    .innerJoin(
      documentPermissions,
      and(eq(documentPermissions.documentId, documents.id), eq(documentPermissions.companyId, scope ?? "")),
    );
  const scopedOrphans = db
    .select({ n: count() })
    .from(documents)
    .innerJoin(
      documentPermissions,
      and(eq(documentPermissions.documentId, documents.id), eq(documentPermissions.companyId, scope ?? "")),
    )
    .where(eq(documents.state, "orphan"));
  const scopedAssociations = db
    .select({ n: count() })
    .from(documentAssociations)
    .innerJoin(documents, eq(documents.id, documentAssociations.documentId))
    .innerJoin(
      documentPermissions,
      and(eq(documentPermissions.documentId, documents.id), eq(documentPermissions.companyId, scope ?? "")),
    );

  const kpis = scope
    ? await Promise.all([scopedDocs, scopedOrphans, scopedAssociations])
    : await Promise.all([
        db.select({ n: count() }).from(documents),
        db.select({ n: count() }).from(documents).where(eq(documents.state, "orphan")),
        db.select({ n: count() }).from(documentAssociations),
      ]);

  const total = kpis[0][0]?.n ?? 0;
  const orphans = kpis[1][0]?.n ?? 0;
  const assocs = kpis[2][0]?.n ?? 0;
  const canIngest = session.role === "admin" || session.role === "clarice" || session.role === "digitalizacao";

  const kindLabels: Record<string, string> = {
    cmr: "CMR",
    guia_remessa: "Guia remessa",
    guia_recepcao: "Guia recepção",
    ticket_frio: "Ticket frio",
    controlo_tara: "Controlo tara",
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Digitalização Central"
        description={`Hub por empresa · ${rows.length} documentos mostrados${scope ? ` · âmbito ${session.companyName ?? "empresa atribuída"}` : ""}`}
        actions={canIngest ? (
          <Button asChild>
            <Link href="/docs/upload">
              <Upload className="h-4 w-4" />
              Ingerir documentos
            </Link>
          </Button>
        ) : null}
      />

      <div className="grid grid-cols-3 gap-4">
        <Card><CardContent className="p-4"><div className="text-xs text-muted-foreground">Total</div><div className="text-2xl font-semibold font-mono">{total}</div></CardContent></Card>
        <Card><CardContent className="p-4"><div className="text-xs text-muted-foreground">Associados</div><div className="text-2xl font-semibold font-mono">{assocs}</div></CardContent></Card>
        <Card><CardContent className="p-4"><div className="text-xs text-muted-foreground">Órfãos</div><div className="text-2xl font-semibold font-mono text-destructive">{orphans}</div></CardContent></Card>
      </div>

      <div className="flex flex-wrap gap-2 border-b border-border">
        {[
          { key: "all", label: "Todos" },
          { key: "associated", label: "Associados" },
          { key: "orphan", label: "Órfãos" },
        ].map((t) => (
          <Link
            key={t.key}
            href={`/docs?tab=${t.key}`}
            className={`inline-flex min-h-11 items-center px-3 py-2 text-sm border-b-2 -mb-px ${
              tab === t.key ? "border-primary text-primary" : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            {t.label}
          </Link>
        ))}
      </div>

      <form className="flex flex-wrap gap-2 items-center">
        <input type="hidden" name="tab" value={tab} />
        <div className="relative flex-1 min-w-[220px] max-w-xl">
          <Search className="absolute left-2.5 top-3.5 h-4 w-4 text-muted-foreground" />
          <Input
            name="q"
            placeholder="CMR, matrícula, texto OCR…"
            defaultValue={q}
            inputMode="search"
            aria-label="Pesquisar por CMR, matrícula ou texto OCR"
            className="pl-9"
          />
        </div>
        <select
          name="direction"
          defaultValue={direction ?? ""}
          aria-label="Filtrar por direcção do documento"
          className="h-11 rounded-md border border-border bg-background px-3 text-sm"
        >
          <option value="">Entrada + Saída</option>
          <option value="entrada">↓ Entrada (compra/recepção)</option>
          <option value="saida">↑ Saída (transporte/entrega)</option>
        </select>
        <select
          name="kind"
          defaultValue={kind ?? ""}
          aria-label="Filtrar por tipo de documento"
          className="h-11 rounded-md border border-border bg-background px-3 text-sm"
        >
          <option value="">Todos os tipos</option>
          {Object.entries(kindLabels).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
        </select>
        <Input type="date" name="from" defaultValue={from} aria-label="Data inicial" className="w-auto" />
        <Input type="date" name="to" defaultValue={to} aria-label="Data final" className="w-auto" />
        <Button type="submit" variant="outline">Filtrar</Button>
      </form>

      <Card>
        <div className="overflow-x-auto">
          <table className="data-table">
            <thead>
              <tr>
                <th>Tipo</th>
                <th>Direcção</th>
                <th>CMR</th>
                <th>Matrícula</th>
                <th>Data carga</th>
                <th>Estado</th>
                <th>Acção</th>
              </tr>
            </thead>
            <tbody>
              {rows.length === 0 ? (
                <tr><td colSpan={7} className="text-center py-6 text-muted-foreground">Sem resultados.</td></tr>
              ) : rows.map((r) => (
                <tr key={r.id}>
                  <td><Badge variant="secondary">{kindLabels[r.kind] ?? r.kind}</Badge></td>
                  <td>
                    <Badge variant={r.direction === "entrada" ? "warning" : "default"} className="text-[10px]">
                      {r.direction === "entrada" ? "↓ Entrada" : "↑ Saída"}
                    </Badge>
                  </td>
                  <td className="font-mono text-xs">{r.cmrNumber ?? "—"}</td>
                  <td className="font-mono text-xs">{r.plate ?? "—"}</td>
                  <td className="text-xs">{formatDate(r.loadedAt)}</td>
                  <td>
                    <StatusPill status={r.state === "associated" ? "green" : r.state === "orphan" ? "red" : "neutral"}>
                      {r.state === "associated" ? "Associado" : r.state === "orphan" ? "Órfão" : r.state}
                    </StatusPill>
                  </td>
                  <td><Button size="sm" variant="outline" asChild><Link href={`/docs/${r.id}`}>Abrir</Link></Button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
