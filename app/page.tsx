import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  TruckIcon,
  ReceiptText,
  FileStack,
  Fuel,
  PackageSearch,
  Wrench,
  ArrowUpRight,
  CheckCircle2,
  ShieldCheck,
  Zap,
  Globe,
} from "lucide-react";

export const metadata = {
  title: "AiTiPro — Operações de frota sem papel, sem Excel",
  description:
    "Plataforma completa para transportadoras portuguesas. 6 módulos integrados. Dados na UE. Humano em cada decisão.",
};

const MODULES = [
  {
    code: "A",
    slug: "km",
    title: "Validação de quilómetros",
    problem: "Administrativa perde 2h/dia a cruzar Logue Trans com GPS Frotcom. Erros viajam para a factura.",
    solution: "Reconciliação automática. Semáforo verde/amarelo/vermelho. Um clique aprova o dia.",
    icon: TruckIcon,
    metric: "<15 min",
    metricLabel: "validar 1 dia",
  },
  {
    code: "B",
    slug: "ocr",
    title: "OCR facturas fornecedor",
    problem: "50 fornecedores, 50 layouts. Conhecimento tácito de quem classifica sai com a pessoa.",
    solution: "Primeira factura de cada fornecedor: tu ensinas o sistema. A partir daí, automática. Export XML PHC Advanced.",
    icon: ReceiptText,
    metric: "9",
    metricLabel: "facturas reais mapeadas",
  },
  {
    code: "C",
    slug: "docs",
    title: "Digitalização central",
    problem: "CMR, guias, tickets de frio em papel disperso. WhatsApp caótico. Documentos perdem-se.",
    solution: "Hub único. 1 operador digitaliza. Associação automática à viagem por matrícula + data.",
    icon: FileStack,
    metric: "4",
    metricLabel: "amostras reais",
  },
  {
    code: "D",
    slug: "fuel",
    title: "Combustível",
    problem: "Cepsa/Repsol/Radius Velocity + bomba interna em ficheiros. Frotcom API de leitura pendente. Cruzamento manual.",
    solution: "Cruzamento automático dos abastecimentos. L/100 km por viatura quando houver leitura. Anomalias sinalizadas, decisão humana.",
    icon: Fuel,
    metric: "2161",
    metricLabel: "linhas reais",
  },
  {
    code: "E",
    slug: "bolsa",
    title: "Bolsa de carga",
    problem: "Excel 1000+ linhas. Factura cliente chega 1 mês depois. Comissões calculadas à mão.",
    solution: "Fluxo com 5 estados: do pedido à cobrança. Comissões automáticas. Alertas de desvio e atraso.",
    icon: PackageSearch,
    metric: "306",
    metricLabel: "cargas reais Excel",
  },
  {
    code: "F",
    slug: "oficina",
    title: "Folha de obra oficina",
    problem: "Mecânico preenche papel. Administrativa relança no PHC Advanced. Duplicação total.",
    solution: "App mobile offline-first. Mecânico em 3 minutos. Admin valida. Export PHC Advanced.",
    icon: Wrench,
    metric: "17",
    metricLabel: "itens checklist papel",
  },
];

export default function LandingPage() {
  return (
    <main className="relative min-h-screen bg-[hsl(40_24%_98%)] text-[hsl(220_28%_10%)] overflow-hidden">
      {/* Background texture */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage:
            "radial-gradient(hsl(222 72% 15%) 1px, transparent 1px)",
          backgroundSize: "24px 24px",
        }}
      />
      <div className="pointer-events-none absolute inset-x-0 top-0 h-[800px] bg-[radial-gradient(ellipse_50%_40%_at_50%_0%,hsl(32_82%_55%/0.12),transparent_60%),radial-gradient(ellipse_40%_30%_at_90%_10%,hsl(222_72%_38%/0.1),transparent_55%)]" />

      {/* Top bar */}
      <header className="relative z-10 mx-auto max-w-[1400px] px-6 lg:px-10 pt-8 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2.5">
          <div className="h-9 w-9 rounded-md bg-[hsl(222_72%_30%)] text-white grid place-items-center font-display font-bold shadow-elevated-sm">
            A
          </div>
          <div>
            <div className="font-display text-base font-semibold leading-none">AiTiPro</div>
            <div className="text-[10px] text-muted-foreground mt-0.5 tracking-wider uppercase">Plataforma Lloretrans</div>
          </div>
        </Link>
        <nav className="flex items-center gap-3">
          <Link href="#modules" className="hidden md:inline text-sm text-foreground/70 hover:text-foreground transition-colors">
            Os 6 módulos
          </Link>
          <Link href="#trust" className="hidden md:inline text-sm text-foreground/70 hover:text-foreground transition-colors">
            Confiança
          </Link>
          <Link href="#pricing" className="hidden md:inline text-sm text-foreground/70 hover:text-foreground transition-colors">
            Planos
          </Link>
          <Link href="#roadmap" className="hidden lg:inline text-sm text-foreground/70 hover:text-foreground transition-colors">
            Como começamos
          </Link>
          <Link href="/proposta" className="hidden lg:inline text-sm text-foreground/70 hover:text-foreground transition-colors">
            Proposta
          </Link>
          <Button asChild variant="outline" size="sm">
            <Link href="/login">Aceder à demo →</Link>
          </Button>
        </nav>
      </header>

      {/* HERO */}
      <section className="relative z-10 mx-auto max-w-[1400px] px-6 lg:px-10 pt-20 lg:pt-28 pb-16 lg:pb-24">
        <div className="grid lg:grid-cols-12 gap-10 lg:gap-16 items-end">
          <div className="lg:col-span-7 space-y-8 animate-fade-in">
            <Badge variant="outline" className="text-[11px] tracking-wider uppercase">
              Desenhado com a operação Lloretrans · Grupo Patrícia Pilar
            </Badge>
            <h1 className="font-display text-5xl sm:text-6xl lg:text-7xl font-semibold leading-[0.98] tracking-[-0.03em]">
              Operações de frota.
              <br />
              <span className="italic text-[hsl(222_72%_30%)]">Sem papel.</span>
              <br />
              <span className="italic text-[hsl(222_72%_30%)]">Sem Excel.</span>
            </h1>
            <p className="text-lg text-foreground/70 leading-relaxed max-w-2xl">
              Plataforma operacional para transportadoras portuguesas. Seis módulos
              integrados que cobrem o ciclo completo — do CMR na portaria ao XML
              pronto para o PHC Advanced. <span className="font-semibold text-foreground">Dados na UE. Audit log imutável em cada acção.
              Humano aprova antes de qualquer passo irreversível.</span>
            </p>
            <div className="flex flex-wrap items-center gap-3 pt-2">
              <Button asChild size="lg" className="shadow-elevated">
                <Link href="/login">Ver demo em 60 segundos →</Link>
              </Button>
              <Button asChild size="lg" variant="outline">
                <Link href="mailto:bilal@aitipro.com?subject=Agendar%20apresentação%20Lloretrans">
                  Agendar apresentação
                </Link>
              </Button>
            </div>
          </div>

          {/* Capacity column (editorial) */}
          <div className="lg:col-span-5 animate-fade-in" style={{ animationDelay: "120ms" }}>
            <div className="border-l-2 border-[hsl(222_72%_30%)]/20 pl-6 lg:pl-10 py-2 space-y-5">
              <HeroStat
                big="60+"
                label="viaturas por operador"
                sub="Reconciliação km diária em < 15 min"
              />
              <HeroStat
                big="< 3 min"
                label="folha de obra completa"
                sub="Mecânico regista offline · admin valida"
              />
              <HeroStat
                big="1×"
                label="passagem XML para PHC Advanced"
                sub="Classificação aprende por fornecedor"
              />
              <HeroStat
                big="UE"
                label="dados em repouso"
                sub="Neon Postgres · Frankfurt · sem CDN US"
              />
            </div>
            <p className="text-[11px] text-muted-foreground mt-5 pl-6 lg:pl-10 leading-relaxed">
              Ambiente de demonstração com fixtures reais do evidence pack e dados determinísticos complementares.
              Produção replica o mesmo modelo contra os vossos sistemas, após confirmação das integrações.
            </p>
          </div>
        </div>
      </section>

      {/* PULL QUOTE / TESTIMONIAL */}
      <section className="relative z-10 border-y border-[hsl(220_14%_88%)] bg-[hsl(40_30%_96%)]">
        <div className="mx-auto max-w-[1400px] px-6 lg:px-10 py-16 lg:py-20">
          <div className="grid lg:grid-cols-12 gap-10 lg:gap-16 items-start">
            <div className="lg:col-span-8">
              <div className="text-[hsl(32_82%_45%)] text-6xl lg:text-7xl font-display leading-none mb-4 select-none">
                &ldquo;
              </div>
              <p className="font-display text-3xl lg:text-4xl leading-snug tracking-[-0.02em]">
                Não é só tempo. A nossa preocupação também é o{" "}
                <span className="italic text-[hsl(222_72%_30%)]">controle</span>.
              </p>
              <p className="mt-6 text-foreground/70 leading-relaxed max-w-2xl">
                A IA regista. O humano valida. Cada acção, mesmo um clique, escreve entrada imutável
                no <span className="font-mono text-sm">audit_log</span>. É esse o compromisso da
                plataforma — acelerar sem tirar decisão a ninguém.
              </p>
            </div>
            <div className="lg:col-span-4 lg:pt-4">
              <div className="flex items-center gap-4">
                <div className="h-14 w-14 rounded-full bg-gradient-to-br from-[hsl(222_72%_45%)] to-[hsl(222_72%_22%)] text-white grid place-items-center font-display text-lg font-semibold">
                  CS
                </div>
                <div>
                  <div className="font-semibold text-sm">Clarice Santos</div>
                  <div className="text-xs text-muted-foreground">Lloretrans · Grupo Patrícia Pilar</div>
                  <div className="text-xs text-muted-foreground mt-0.5">Reunião 16/04/2026</div>
                </div>
              </div>
              <div className="mt-6 grid grid-cols-3 gap-4 text-center">
                <Stat n="60" label="viaturas" />
                <Stat n="4" label="empresas grupo" />
                <Stat n="9" label="facturas reais" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 6 MODULES */}
      <section id="modules" className="relative z-10 mx-auto max-w-[1400px] px-6 lg:px-10 py-20 lg:py-28">
        <div className="max-w-3xl mb-12 lg:mb-16">
          <div className="text-[11px] tracking-[0.2em] uppercase text-[hsl(32_82%_45%)] font-semibold mb-4">
            Seis módulos · um só sistema
          </div>
          <h2 className="font-display text-4xl lg:text-5xl font-semibold leading-tight tracking-[-0.02em]">
            Cada módulo resolve <span className="italic">uma dor concreta</span>.
            Compras um, três ou os seis.
          </h2>
          <p className="mt-5 text-foreground/70 text-lg leading-relaxed">
            Construídos a partir da transcrição literal da reunião com a Clarice. Cada um tem a sua
            própria spec, plano de implementação e critérios de aceitação. Nenhum depende dos outros
            para arrancar.
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {MODULES.map((m, i) => {
            const Icon = m.icon;
            return (
              <Link
                key={m.slug}
                href={`/login?target=${m.slug}`}
                className="group animate-fade-in"
                style={{ animationDelay: `${i * 60}ms` }}
              >
                <article className="h-full rounded-xl border border-[hsl(220_14%_88%)] bg-white p-6 lg:p-7 transition-all duration-200 group-hover:border-[hsl(222_72%_30%)]/40 group-hover:shadow-elevated-lg group-hover:-translate-y-0.5 relative overflow-hidden">
                  <div className="flex items-start justify-between mb-5">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-lg bg-[hsl(222_72%_30%)]/8 grid place-items-center">
                        <Icon className="h-5 w-5 text-[hsl(222_72%_30%)]" />
                      </div>
                      <div className="font-mono text-[10px] text-muted-foreground tracking-wider">
                        MVP · {m.code}
                      </div>
                    </div>
                    <ArrowUpRight className="h-4 w-4 text-muted-foreground group-hover:text-[hsl(222_72%_30%)] group-hover:-translate-y-0.5 group-hover:translate-x-0.5 transition-all" />
                  </div>
                  <h3 className="font-display text-xl font-semibold leading-tight mb-3">{m.title}</h3>
                  <div className="space-y-3 text-sm">
                    <div>
                      <div className="text-[10px] uppercase tracking-wider text-[hsl(0_72%_45%)] font-semibold mb-1">
                        Dor
                      </div>
                      <p className="text-foreground/70 leading-relaxed">{m.problem}</p>
                    </div>
                    <div>
                      <div className="text-[10px] uppercase tracking-wider text-[hsl(152_55%_32%)] font-semibold mb-1">
                        Como resolve
                      </div>
                      <p className="text-foreground/70 leading-relaxed">{m.solution}</p>
                    </div>
                  </div>
                  <div className="mt-5 pt-5 border-t border-[hsl(220_14%_92%)] flex items-baseline justify-between">
                    <div>
                      <span className="font-mono text-2xl font-semibold text-[hsl(222_72%_30%)]">
                        {m.metric}
                      </span>
                      <span className="ml-2 text-xs text-muted-foreground">{m.metricLabel}</span>
                    </div>
                    <span className="text-xs text-[hsl(222_72%_30%)] font-medium group-hover:underline">
                      Ver demo →
                    </span>
                  </div>
                </article>
              </Link>
            );
          })}
        </div>
      </section>

      {/* TRUST / EU-FIRST */}
      <section
        id="trust"
        className="relative z-10 border-y border-[hsl(220_14%_88%)] bg-[hsl(222_72%_12%)] text-white"
      >
        <div className="mx-auto max-w-[1400px] px-6 lg:px-10 py-20 lg:py-24">
          <div className="grid lg:grid-cols-12 gap-10 lg:gap-16">
            <div className="lg:col-span-5">
              <div className="text-[11px] tracking-[0.2em] uppercase text-[hsl(32_82%_65%)] font-semibold mb-4">
                Confiança por defeito
              </div>
              <h2 className="font-display text-4xl lg:text-5xl font-semibold leading-tight tracking-[-0.02em]">
                Infra europeia. <br />
                Auditoria <span className="italic text-[hsl(32_82%_65%)]">append-only</span>.
              </h2>
              <p className="mt-6 text-white/70 leading-relaxed text-lg">
                Dados em repouso em Frankfurt. Zero analytics de terceiros. Cada mutação é registada
                com utilizador, antes/depois e motivo. Construída para passar o RGPD à primeira.
              </p>
            </div>
            <div className="lg:col-span-7 grid sm:grid-cols-2 gap-6">
              <TrustCard icon={Globe} title="Dados na UE" body="Neon Postgres em Frankfurt (aws-eu-central-1). Deploy Vercel fra1. IA externa só com DPA e aprovação por fluxo." />
              <TrustCard icon={ShieldCheck} title="RGPD by default" body="Audit log imutável. Retenção configurável por tipo de documento. Direito ao esquecimento via anonimização." />
              <TrustCard icon={CheckCircle2} title="Humano no loop" body="IA regista, classifica, sinaliza. Humano valida antes de qualquer acção irreversível. Zero decisões silenciosas." />
              <TrustCard icon={Zap} title="Integração nativa" body="Adaptadores preparados para Logue Trans, Frotcom, PHC Advanced, Cepsa, Repsol e Radius. Acesso técnico depende do departamento de informática e do integrador PHC Advanced do grupo." />
            </div>
          </div>
        </div>
      </section>

      {/* PRICING TIERS */}
      <section id="pricing" className="relative z-10 mx-auto max-w-[1400px] px-6 lg:px-10 py-20 lg:py-28">
        <div className="max-w-3xl mb-12">
          <div className="text-[11px] tracking-[0.2em] uppercase text-[hsl(32_82%_45%)] font-semibold mb-4">
            Planos
          </div>
          <h2 className="font-display text-4xl lg:text-5xl font-semibold leading-tight tracking-[-0.02em]">
            Três patamares. <span className="italic">Arranca onde faz sentido.</span>
          </h2>
        </div>

        <div className="grid gap-5 md:grid-cols-3">
          <PricingTier
            name="Core"
            tagline="Quick win · fechar a ferida mais evidente"
            includes={["1–2 MVPs à escolha", "Conectores em modo simulação", "Export XML PHC Advanced", "Onboarding 2 sem", "Suporte email"]}
          />
          <PricingTier
            name="PRO"
            tagline="Operacional diário · 80% do benefício"
            includes={[
              "4 MVPs (validação km + OCR + docs + oficina)",
              "Preparado para integração PHC Advanced após Sprint 0",
              "Master de fornecedores com aprendizagem",
              "Dashboard direcção",
              "Suporte prioritário",
            ]}
            featured
          />
          <PricingTier
            name="Enterprise"
            tagline="Portfólio completo · escala grupo"
            includes={[
              "6 MVPs + Admin",
              "Multi-empresa com permissões cross",
              "APIs Logue Trans + Frotcom + cartões combustível",
              "PWA oficina + onboarding mecânicos",
              "SLA 99% · DPA formal",
            ]}
          />
        </div>

        <p className="mt-10 text-sm text-muted-foreground text-center">
          Pricing por proposta directa — cada caso tem volumes e integrações específicas.{" "}
          <Link href="mailto:bilal@aitipro.com?subject=Pedido%20de%20proposta%20Lloretrans" className="text-[hsl(222_72%_30%)] underline">
            Pede orçamento →
          </Link>
        </p>
      </section>

      {/* COMO COMEÇAMOS · roadmap */}
      <section id="roadmap" className="relative z-10 mx-auto max-w-[1400px] px-6 lg:px-10 py-20 lg:py-28">
        <div className="max-w-3xl mb-12">
          <div className="text-[11px] tracking-[0.2em] uppercase text-[hsl(32_82%_45%)] font-semibold mb-4">
            Como começamos
          </div>
          <h2 className="font-display text-4xl lg:text-5xl font-semibold leading-tight tracking-[-0.02em]">
            Calendário <span className="italic">realista</span>. Ritmo curto, entregas visíveis.
          </h2>
          <p className="mt-5 text-foreground/70 text-lg leading-relaxed">
            Cada MVP entra em produção supervisionada antes de avançarmos. Sem big-bang, sem esperas
            longas. Começamos com um quick-win para calibrar confiança e ritmo.
          </p>
        </div>
        <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-4">
          <RoadmapCard
            week="Semana 1"
            title="Acessos & baseline"
            body="Kick-off com a Clarice + DPO. Credenciais Logue Trans e Frotcom. Medimos o ponto de partida — horas gastas hoje."
          />
          <RoadmapCard
            week="Semanas 2–3"
            title="MVP 1 com dados reais"
            body="Validação km vai a ar contra 60 viaturas reais. Administrativa usa em paralelo ao processo actual durante 1 semana."
          />
          <RoadmapCard
            week="Semana 4"
            title="Go-live supervisionado"
            body="Corte do processo antigo. Bilal presente em sala durante 3 dias. Ajustes finos de threshold e alertas."
          />
          <RoadmapCard
            week="Mês 2+"
            title="Iteração"
            body="Próximo MVP entra no mesmo ritmo. Revisão mensal do audit log. Scope ajustado a achados reais."
          />
        </div>
      </section>

      {/* FAQ · pressupostos */}
      <section id="faq" className="relative z-10 border-y border-[hsl(220_14%_88%)] bg-[hsl(40_30%_96%)]">
        <div className="mx-auto max-w-[1400px] px-6 lg:px-10 py-20 lg:py-24">
          <div className="grid lg:grid-cols-12 gap-10 lg:gap-16">
            <div className="lg:col-span-4">
              <div className="text-[11px] tracking-[0.2em] uppercase text-[hsl(32_82%_45%)] font-semibold mb-4">
                Pressupostos
              </div>
              <h2 className="font-display text-3xl lg:text-4xl font-semibold leading-tight tracking-[-0.02em]">
                Perguntas que fazemos antes de assinar.
              </h2>
              <p className="mt-5 text-foreground/70 leading-relaxed">
                Respostas directas às objecções que um director de operações vai pôr. Se nenhuma delas
                encaixa na tua realidade, a resposta é: <span className="italic">conversamos</span>.
              </p>
            </div>
            <div className="lg:col-span-8 space-y-2">
              <FaqItem
                q="Que dados saem da empresa?"
                a="Dados operacionais em repouso ficam na UE: Neon Postgres em Frankfurt (aws-eu-central-1) e Vercel fra1. Fluxos com Claude/Anthropic só avançam com DPA aprovado; sem isso, ficam desligados ou usam extracção local."
              />
              <FaqItem
                q="Quem assina os lançamentos no PHC Advanced?"
                a="A vossa administrativa, sempre. A plataforma gera o XML (ou o registo intermédio), mas a entrada no PHC Advanced continua sob responsabilidade da pessoa que hoje a faz. O papel da IA é preparar, não decidir."
              />
              <FaqItem
                q="E se o Frotcom falhar?"
                a="Existe fallback para Logue Trans via flag de configuração. A reconciliação continua, com aviso no dashboard. Nenhum MVP depende de um único fornecedor externo para correr."
              />
              <FaqItem
                q="Integramos com o vosso integrador PHC Advanced?"
                a="Só depois de contacto técnico confirmado com o integrador PHC Advanced do grupo. Até lá, a proposta assume XML ou registo intermédio validado pela administrativa, sem escrita directa prometida."
              />
              <FaqItem
                q="O que acontece se o mecânico não usar a app?"
                a="Plano de onboarding explícito: treino presencial de 1 dia, acompanhamento durante 2 semanas, fallback em papel com OCR a ligar automaticamente à folha. Adopção é um dos KPIs da Fase 0."
              />
            </div>
          </div>
        </div>
      </section>

      {/* FINAL CTA */}
      <section className="relative z-10 mx-auto max-w-[1400px] px-6 lg:px-10 pb-20 lg:pb-32 pt-20 lg:pt-28">
        <div className="rounded-2xl bg-gradient-to-br from-[hsl(222_72%_30%)] via-[hsl(222_72%_20%)] to-[hsl(222_72%_14%)] text-white p-10 lg:p-16 relative overflow-hidden">
          <div
            className="absolute inset-0 opacity-[0.08] pointer-events-none"
            style={{
              backgroundImage: "radial-gradient(white 1px, transparent 1px)",
              backgroundSize: "20px 20px",
            }}
          />
          <div className="relative z-10 grid lg:grid-cols-12 gap-8 items-center">
            <div className="lg:col-span-8">
              <h2 className="font-display text-4xl lg:text-5xl font-semibold tracking-[-0.02em] leading-tight">
                Pronto para deixar o papel para trás?
              </h2>
              <p className="mt-5 text-white/75 text-lg leading-relaxed max-w-2xl">
                60 segundos chegam para veres os 6 módulos em funcionamento. Dados determinísticos, login
                directo sem formulário. Em paralelo, podes descarregar a proposta formal.
              </p>
            </div>
            <div className="lg:col-span-4 flex flex-col gap-3 lg:items-end">
              <Button asChild size="lg" className="bg-white text-[hsl(222_72%_22%)] hover:bg-white/90 border-0 shadow-elevated-lg w-full lg:w-auto">
                <Link href="/login">Abrir demo →</Link>
              </Button>
              <Button asChild size="lg" variant="outline" className="border-white/30 text-white hover:bg-white/10 w-full lg:w-auto">
                <Link href="/proposta">Ver proposta formal</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="relative z-10 border-t border-[hsl(220_14%_88%)]">
        <div className="mx-auto max-w-[1400px] px-6 lg:px-10 py-10 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-muted-foreground">
          <div className="flex items-center gap-2">
            <div className="h-6 w-6 rounded bg-[hsl(222_72%_30%)] text-white grid place-items-center font-display font-semibold text-[10px]">
              A
            </div>
            <span>AiTiPro · Lisboa · Portugal</span>
          </div>
          <div className="flex items-center gap-6">
            <Link href="mailto:bilal@aitipro.com" className="hover:text-foreground transition-colors">
              bilal@aitipro.com
            </Link>
            <Link href="/login" className="hover:text-foreground transition-colors">
              Demo
            </Link>
            <span className="hidden sm:inline">RGPD · dados UE · build {new Date().getFullYear()}</span>
          </div>
        </div>
      </footer>
    </main>
  );
}

function HeroStat({ big, label, sub }: { big: string; label: string; sub: string }) {
  return (
    <div>
      <div className="flex items-baseline gap-3">
        <div className="font-mono text-4xl lg:text-5xl font-semibold tabular text-[hsl(222_72%_22%)]">{big}</div>
        <div className="text-sm font-medium">{label}</div>
      </div>
      <div className="text-xs text-muted-foreground mt-1">{sub}</div>
    </div>
  );
}

function Stat({ n, label }: { n: string; label: string }) {
  return (
    <div>
      <div className="font-mono text-2xl font-semibold tabular">{n}</div>
      <div className="text-[10px] uppercase tracking-wider text-muted-foreground mt-0.5">{label}</div>
    </div>
  );
}

function TrustCard({
  icon: Icon,
  title,
  body,
}: {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  body: string;
}) {
  return (
    <div className="rounded-xl border border-white/10 bg-white/5 backdrop-blur p-6">
      <Icon className="h-5 w-5 text-[hsl(32_82%_65%)] mb-4" />
      <h3 className="font-display text-lg font-semibold mb-2">{title}</h3>
      <p className="text-sm text-white/70 leading-relaxed">{body}</p>
    </div>
  );
}

function RoadmapCard({ week, title, body }: { week: string; title: string; body: string }) {
  return (
    <div className="rounded-xl border border-[hsl(220_14%_88%)] bg-white p-6 relative">
      <div className="text-[10px] uppercase tracking-[0.15em] text-[hsl(32_82%_45%)] font-semibold mb-2">
        {week}
      </div>
      <h3 className="font-display text-lg font-semibold mb-2 leading-tight">{title}</h3>
      <p className="text-sm text-foreground/70 leading-relaxed">{body}</p>
    </div>
  );
}

function FaqItem({ q, a }: { q: string; a: string }) {
  return (
    <details className="group rounded-lg border border-[hsl(220_14%_88%)] bg-white p-5 open:shadow-elevated-sm transition-shadow">
      <summary className="list-none cursor-pointer flex items-start justify-between gap-4">
        <span className="font-display text-base font-semibold leading-snug">{q}</span>
        <span className="text-[hsl(222_72%_30%)] text-lg font-semibold shrink-0 transition-transform group-open:rotate-45 leading-none mt-0.5">
          +
        </span>
      </summary>
      <p className="mt-4 text-sm text-foreground/70 leading-relaxed">{a}</p>
    </details>
  );
}

function PricingTier({
  name,
  tagline,
  includes,
  featured = false,
}: {
  name: string;
  tagline: string;
  includes: string[];
  featured?: boolean;
}) {
  return (
    <div
      className={`rounded-xl border p-7 relative ${
        featured
          ? "border-[hsl(222_72%_30%)] bg-[hsl(222_72%_30%)] text-white shadow-elevated-lg"
          : "border-[hsl(220_14%_88%)] bg-white"
      }`}
    >
      {featured && (
        <Badge className="absolute -top-3 left-6 bg-[hsl(32_82%_55%)] text-[hsl(222_72%_12%)] border-0">
          Recomendado
        </Badge>
      )}
      <div className="font-display text-2xl font-semibold">{name}</div>
      <div className={`text-sm mt-2 ${featured ? "text-white/70" : "text-muted-foreground"}`}>{tagline}</div>
      <ul className="mt-6 space-y-2.5 text-sm">
        {includes.map((i) => (
          <li key={i} className="flex gap-2.5">
            <CheckCircle2
              className={`h-4 w-4 shrink-0 mt-0.5 ${featured ? "text-[hsl(32_82%_65%)]" : "text-[hsl(152_55%_38%)]"}`}
            />
            <span className={featured ? "text-white/90" : "text-foreground/80"}>{i}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
