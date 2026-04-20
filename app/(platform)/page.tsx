import Link from "next/link";
import { getSession } from "@/lib/auth/session";
import { redirect } from "next/navigation";
import { db } from "@/db/client";
import {
  kmReconciliations,
  invoices,
  documents,
  fuelAnomalies,
  freightLoads,
  workOrders,
} from "@/db/schema";
import { eq, count, and, gte } from "drizzle-orm";
import { canAccessMvp } from "@/lib/auth/types";
import { PageHeader } from "@/components/ui/page-header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  TruckIcon,
  ReceiptText,
  FileStack,
  Fuel,
  PackageSearch,
  Wrench,
  ArrowRight,
} from "lucide-react";
import { formatNumber } from "@/lib/money";

async function loadKpis() {
  const now = new Date();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

  const [kmYellow, kmRed, invPending, invApproved, docsOrphan, fuelOpen, freightOpen, woDraft] = await Promise.all([
    db.select({ n: count() }).from(kmReconciliations).where(eq(kmReconciliations.state, "yellow")),
    db.select({ n: count() }).from(kmReconciliations).where(eq(kmReconciliations.state, "red")),
    db.select({ n: count() }).from(invoices).where(eq(invoices.state, "pending_review")),
    db
      .select({ n: count() })
      .from(invoices)
      .where(and(eq(invoices.state, "approved"), gte(invoices.approvedAt, monthStart))),
    db.select({ n: count() }).from(documents).where(eq(documents.state, "orphan")),
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

const MVP_CARDS = [
  {
    slug: "km",
    title: "MVP A — Validação de km",
    description: "Reconciliação Logue Trans vs Frotcom · semáforo verde/amarelo/vermelho",
    href: "/km",
    icon: TruckIcon,
    accent: "text-primary",
  },
  {
    slug: "ocr",
    title: "MVP B — OCR Facturas",
    description: "9 facturas reais extraídas · classificação aprendida por fornecedor",
    href: "/ocr",
    icon: ReceiptText,
    accent: "text-primary",
  },
  {
    slug: "docs",
    title: "MVP C — Digitalização Central",
    description: "Hub de CMR + guias · associação automática à viagem",
    href: "/docs",
    icon: FileStack,
    accent: "text-primary",
  },
  {
    slug: "fuel",
    title: "MVP D — Combustível",
    description: "CANBUS vs abastecimentos · anomalias por viatura",
    href: "/fuel",
    icon: Fuel,
    accent: "text-primary",
  },
  {
    slug: "bolsa",
    title: "MVP E — Bolsa de Carga",
    description: "Ciclo agendar → facturar → pagar · comissões automáticas",
    href: "/bolsa",
    icon: PackageSearch,
    accent: "text-primary",
  },
  {
    slug: "oficina",
    title: "MVP F — Oficina (PWA)",
    description: "Folha de obra no telemóvel · offline-first · assinatura digital",
    href: "/oficina",
    icon: Wrench,
    accent: "text-primary",
  },
] as const;

export default async function DashboardPage() {
  const session = await getSession();
  if (!session) redirect("/login");

  const kpis = await loadKpis();

  const tiles: Array<{ label: string; value: string; slug: string; hint?: string }> = [
    {
      label: "Reconciliações em atenção",
      value: formatNumber(kpis.km.yellow + kpis.km.red),
      slug: "km",
      hint: `${kpis.km.yellow} amarelas · ${kpis.km.red} vermelhas`,
    },
    {
      label: "Facturas a validar",
      value: formatNumber(kpis.invoices.pending),
      slug: "ocr",
      hint: `${kpis.invoices.approvedMonth} aprovadas este mês`,
    },
    {
      label: "Documentos sem viagem",
      value: formatNumber(kpis.documents.orphan),
      slug: "docs",
      hint: "A associar manualmente",
    },
    {
      label: "Anomalias combustível",
      value: formatNumber(kpis.fuel.openAnomalies),
      slug: "fuel",
      hint: "Abertas · desvio > 15% do baseline",
    },
    {
      label: "Cargas bolsa (mês)",
      value: formatNumber(kpis.freight.month),
      slug: "bolsa",
    },
    {
      label: "Folhas oficina em rascunho",
      value: formatNumber(kpis.workshop.draft),
      slug: "oficina",
    },
  ];

  return (
    <div className="space-y-8">
      <PageHeader
        title={`Olá, ${session.userName.split(" ")[0]}`}
        description="Visão única sobre os 6 módulos. Os KPIs actualizam em tempo real conforme o seed."
        actions={<Badge variant="secondary">{new Date().toLocaleDateString("pt-PT")}</Badge>}
      />

      <section>
        <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-3">
          KPIs agora
        </h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {tiles
            .filter((t) => canAccessMvp(session.role, t.slug))
            .map((t) => (
              <Card key={t.label}>
                <CardContent className="p-5">
                  <div className="text-xs text-muted-foreground">{t.label}</div>
                  <div className="mt-1 text-3xl font-semibold font-mono">{t.value}</div>
                  {t.hint && <div className="mt-1 text-xs text-muted-foreground">{t.hint}</div>}
                </CardContent>
              </Card>
            ))}
        </div>
      </section>

      <section>
        <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-3">
          Módulos disponíveis
        </h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {MVP_CARDS.filter((m) => canAccessMvp(session.role, m.slug)).map((m) => {
            const Icon = m.icon;
            return (
              <Link key={m.slug} href={m.href} className="group">
                <Card className="h-full transition-colors group-hover:border-primary/60">
                  <CardHeader>
                    <Icon className={`h-6 w-6 ${m.accent}`} />
                    <CardTitle className="text-base mt-3">{m.title}</CardTitle>
                    <CardDescription>{m.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Button variant="outline" size="sm" asChild>
                      <span>
                        Abrir
                        <ArrowRight className="h-3.5 w-3.5" />
                      </span>
                    </Button>
                  </CardContent>
                </Card>
              </Link>
            );
          })}
        </div>
      </section>
    </div>
  );
}
