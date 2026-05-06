import Link from "next/link";
import { getSession } from "@/lib/auth/session";
import { redirect } from "next/navigation";
import { db } from "@/db/client";
import {
  kmReconciliations,
  invoices,
  documents,
  documentPermissions,
  fuelAnomalies,
  freightLoads,
  workOrders,
  auditLog,
  users,
} from "@/db/schema";
import { eq, count, and, gte, desc } from "drizzle-orm";
import { canAccessMvp } from "@/lib/auth/types";
import type { AuthSession } from "@/lib/auth/types";
import { resolvePermissionScope } from "../docs/helpers";
import { PageHeader } from "@/components/ui/page-header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatRelative } from "@/lib/dates";
import {
  TruckIcon,
  ReceiptText,
  FileStack,
  Fuel,
  PackageSearch,
  Wrench,
  ArrowUpRight,
} from "lucide-react";
import { formatNumber } from "@/lib/money";

async function loadKpis(session: AuthSession) {
  const now = new Date();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const docScope = resolvePermissionScope(session);
  const docsOrphanQuery = docScope
    ? db
        .select({ n: count() })
        .from(documents)
        .innerJoin(
          documentPermissions,
          and(eq(documentPermissions.documentId, documents.id), eq(documentPermissions.companyId, docScope)),
        )
        .where(eq(documents.state, "orphan"))
    : db.select({ n: count() }).from(documents).where(eq(documents.state, "orphan"));

  const [kmYellow, kmRed, invPending, invApproved, docsOrphan, fuelOpen, freightOpen, woDraft] = await Promise.all([
    db.select({ n: count() }).from(kmReconciliations).where(eq(kmReconciliations.state, "yellow")),
    db.select({ n: count() }).from(kmReconciliations).where(eq(kmReconciliations.state, "red")),
    db.select({ n: count() }).from(invoices).where(eq(invoices.state, "pending_review")),
    db
      .select({ n: count() })
      .from(invoices)
      .where(and(eq(invoices.state, "approved"), gte(invoices.approvedAt, monthStart))),
    docsOrphanQuery,
    db.select({ n: count() }).from(fuelAnomalies).where(eq(fuelAnomalies.state, "open")),
    db
      .select({ n: count() })
      .from(freightLoads)
      .where(and(gte(freightLoads.createdAt, monthStart))),
    db.select({ n: count() }).from(workOrders).where(eq(workOrders.state, "draft")),
  ]);

  return {
    km: { yellow: kmYellow[0]?.n ?? 0, red: kmRed[0]?.n ?? 0 },
    invoices: { pending: invPending[0]?.n ?? 0, approvedMonth: invApproved[0]?.n ?? 0 },
    documents: { orphan: docsOrphan[0]?.n ?? 0 },
    fuel: { openAnomalies: fuelOpen[0]?.n ?? 0 },
    freight: { month: freightOpen[0]?.n ?? 0 },
    workshop: { draft: woDraft[0]?.n ?? 0 },
  };
}

const MODULE_CARDS = [
  {
    slug: "km",
    title: "Validação de km",
    eyebrow: "Módulo A",
    description: "Reconciliação Logue Trans × Frotcom · semáforo · aprovação em lote · registo",
    href: "/km",
    icon: TruckIcon,
  },
  {
    slug: "ocr",
    title: "Facturas de fornecedor",
    eyebrow: "Módulo B",
    description: "Facturas reais calibradas por fornecedor · preparação PHC Advanced",
    href: "/ocr",
    icon: ReceiptText,
  },
  {
    slug: "docs",
    title: "Documentos centrais",
    eyebrow: "Módulo C",
    description: "Hub CMR + guias · associação automática · permissões por empresa",
    href: "/docs",
    icon: FileStack,
  },
  {
    slug: "fuel",
    title: "Combustível",
    eyebrow: "Módulo D",
    description: "Cepsa/Repsol/Radius/bomba · leitura de bordo em validação · anomalias por viatura",
    href: "/fuel",
    icon: Fuel,
  },
  {
    slug: "bolsa",
    title: "Bolsa de carga",
    eyebrow: "Módulo E",
    description: "Ciclo de agendamento, facturação e pagamento · comissões automáticas · alertas",
    href: "/bolsa",
    icon: PackageSearch,
  },
  {
    slug: "oficina",
    title: "Oficina",
    eyebrow: "Módulo F",
    description: "Folha de obra móvel · funciona sem rede · assinatura · exportação PHC Advanced",
    href: "/oficina",
    icon: Wrench,
  },
] as const;

const TILE_ACTION_LABELS: Record<string, string> = {
  km: "Validar exceções",
  ocr: "Validar facturas",
  docs: "Associar órfãos",
  fuel: "Ver ranking",
  bolsa: "Abrir ciclo",
  oficina: "Validar folhas",
};

function humanAuditLabel(action: string, entityType: string): string {
  const labels: Record<string, string> = {
    "workorder.submit": "Folha de obra submetida",
    "workorder.start": "Trabalho iniciado",
    "workorder.create": "Folha de obra criada",
    "workorder.pause": "Folha de obra pausada",
    "workorder.wait_parts": "Folha de obra a aguardar peças",
    "workorder.resume": "Folha de obra retomada",
    "workorder.approve": "Folha de obra aprovada",
    "workorder.reject": "Folha de obra devolvida",
    "freight.transition": "Carga avançou de estado",
    "freight.rollback": "Carga revertida",
    "freight.create": "Carga criada",
    "invoice.upload": "Factura recebida",
    "invoice.approve": "Factura aprovada",
    "invoice.export": "Factura preparada para PHC Advanced",
    "document.ingest": "Documento recebido",
    "document.associate": "Documento associado à viagem",
    "document.dissociate": "Documento desassociado",
    "km.approve": "Quilómetros aprovados",
    "km.use_gps": "Quilómetros corrigidos por GPS",
    "km.manual_override": "Quilómetros corrigidos manualmente",
    "km.reject": "Quilómetros rejeitados",
    "fuel.anomaly_resolve": "Anomalia de combustível resolvida",
    "fuel.anomaly_reopen": "Anomalia de combustível reaberta",
  };
  const entityLabels: Record<string, string> = {
    work_order: "Folha de obra actualizada",
    invoice: "Factura actualizada",
    document: "Documento actualizado",
    freight_load: "Carga actualizada",
    km_reconciliation: "Validação de quilómetros actualizada",
    fuel_anomaly: "Anomalia de combustível actualizada",
  };
  return labels[action] ?? entityLabels[entityType] ?? "Evento registado";
}

export default async function DashboardPage() {
  const session = await getSession();
  if (!session) redirect("/login");

  const [kpis, recent] = await Promise.all([
    loadKpis(session),
    db
      .select({
        id: auditLog.id,
        action: auditLog.action,
        entityType: auditLog.entityType,
        createdAt: auditLog.createdAt,
        userName: users.name,
      })
      .from(auditLog)
      .leftJoin(users, eq(users.id, auditLog.userId))
      .orderBy(desc(auditLog.createdAt))
      .limit(5),
  ]);

  const tiles: Array<{ label: string; value: number; slug: string; hint?: string; accent?: "destructive" | "default" }> = [
    {
      label: "Em atenção · km",
      value: kpis.km.yellow + kpis.km.red,
      slug: "km",
      hint: `${kpis.km.yellow} amarelas · ${kpis.km.red} vermelhas`,
    },
    {
      label: "Facturas a validar",
      value: kpis.invoices.pending,
      slug: "ocr",
      hint: `${kpis.invoices.approvedMonth} aprovadas este mês`,
    },
    {
      label: "Documentos sem viagem",
      value: kpis.documents.orphan,
      slug: "docs",
      hint: "A associar manualmente",
      accent: kpis.documents.orphan > 50 ? "destructive" : "default",
    },
    {
      label: "Anomalias combustível",
      value: kpis.fuel.openAnomalies,
      slug: "fuel",
      hint: "Desvio > 15% da referência",
      accent: kpis.fuel.openAnomalies > 0 ? "destructive" : "default",
    },
    { label: "Cargas bolsa (mês)", value: kpis.freight.month, slug: "bolsa" },
    { label: "Folhas oficina em rascunho", value: kpis.workshop.draft, slug: "oficina" },
  ];

  return (
    <div className="space-y-10 animate-fade-in">
      <div className="hero-gradient -mx-8 -mt-6 px-8 pt-8 pb-6 border-b border-border/70">
        <PageHeader
          eyebrow={`Sessão activa · ${session.companyName}`}
          title={`Olá, ${session.userName.split(" ")[0]}`}
          description="Visão única sobre os 6 módulos operacionais. Os indicadores actualizam à medida que a equipa usa o sistema."
          actions={
            <Badge variant="secondary" className="tabular">
              {new Date().toLocaleDateString("pt-PT", { weekday: "long", day: "2-digit", month: "long" })}
            </Badge>
          }
        />
      </div>

      <section>
        <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-[0.14em] mb-4">
          Indicadores · agora
        </h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {tiles
            .filter((t) => canAccessMvp(session.role, t.slug))
            .map((t) => (
                <Link key={t.label} href={`/${t.slug}`} className="group">
                  <Card className="h-full group-hover:border-primary/40 group-hover:shadow-elevated transition-all">
                    <CardContent className="p-5">
                      <div className="flex items-start justify-between">
                        <div>
                          <div className="text-[11px] uppercase tracking-wider text-muted-foreground">
                            {t.label}
                          </div>
                          <div
                            className={`mt-1.5 font-display text-3xl font-semibold tabular ${
                              t.accent === "destructive" ? "text-destructive" : ""
                            }`}
                          >
                            {formatNumber(t.value)}
                          </div>
                          {t.hint && (
                            <div className="mt-1 text-xs text-muted-foreground">{t.hint}</div>
                          )}
                        </div>
                        <div className="shrink-0 rounded-full border border-border bg-muted/40 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.12em] text-muted-foreground transition-colors group-hover:border-primary/40 group-hover:text-primary">
                          {TILE_ACTION_LABELS[t.slug] ?? "Abrir"}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
        </div>
      </section>

      <section>
        <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-[0.14em] mb-4">
          Módulos disponíveis
        </h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {MODULE_CARDS.filter((m) => canAccessMvp(session.role, m.slug)).map((m) => {
            const Icon = m.icon;
            return (
              <Link key={m.slug} href={m.href} className="group">
                <Card className="h-full transition-all group-hover:border-primary/50">
                  <CardHeader className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-primary/15 to-primary/5 grid place-items-center">
                        <Icon className="h-5 w-5 text-primary" />
                      </div>
                      <Badge variant="secondary" className="text-[10px]">
                        {m.eyebrow}
                      </Badge>
                    </div>
                    <div>
                      <CardTitle className="text-base">{m.title}</CardTitle>
                      <CardDescription className="mt-1.5">{m.description}</CardDescription>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="inline-flex items-center gap-1 text-sm font-medium text-primary group-hover:gap-2 transition-all">
                      Abrir
                      <ArrowUpRight className="h-3.5 w-3.5" />
                    </div>
                  </CardContent>
                </Card>
              </Link>
            );
          })}
        </div>
      </section>

      {recent.length > 0 && (
        <section>
          <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-[0.14em] mb-4">
            Actividade recente · registo de auditoria
          </h2>
          <Card>
            <CardContent className="p-0 divide-y divide-border/60">
              {recent.map((r) => (
                <div key={r.id} className="flex items-center justify-between px-5 py-3 text-sm">
                  <div>
                    <span>{humanAuditLabel(r.action, r.entityType)}</span>
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {r.userName ?? "—"} · {formatRelative(r.createdAt)}
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </section>
      )}
    </div>
  );
}
