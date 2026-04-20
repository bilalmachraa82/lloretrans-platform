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
  CheckCircle2,
  AlertTriangle,
  Calendar,
  Printer,
  Mail,
  ArrowUpRight,
  ShieldCheck,
} from "lucide-react";

export const metadata = {
  title: "Proposta — Plataforma Operacional Lloretrans × AiTiPro",
  description:
    "Proposta de implementação da plataforma operacional dos 6 módulos · Grupo Patrícia Pilar · Versão 1.0 · 20 Abril 2026.",
  robots: { index: false, follow: false },
};

const VERSION = "1.0";
const DATE = "20 de Abril, 2026";
const ADDRESSED_TO = "Clarice Santos · Direcção Lloretrans";

const MVPS = [
  {
    code: "A",
    slug: "km",
    icon: TruckIcon,
    title: "Validação de Quilómetros",
    dor: "Administrativas entram em duas aplicações, viagem a viagem, a cruzar Logue Trans com Frotcom. Erros passam para a factura.",
    entrega:
      "Dashboard diário com semáforo verde/amarelo/vermelho. Threshold configurável (default 10 km). Bulk-approve das verdes com um clique. Export CSV para PHC.",
    semanas: "2–3",
    dependencias: "API Logue Trans (Hélio) · credenciais Frotcom (grupo)",
    tier: "Core · PRO · Enterprise",
  },
  {
    code: "B",
    slug: "ocr",
    icon: ReceiptText,
    title: "OCR Facturas de Fornecedor",
    dor: "50 fornecedores oficina, 50 layouts. Classificação por conhecimento tácito — sai com a pessoa que sabe.",
    entrega:
      "Upload → extracção automática → classificação por NIF → validação humana → export XML PHC. Cada correcção cria regra de fornecedor que aplica em próximas facturas. 9 facturas reais já carregadas.",
    semanas: "4–6",
    dependencias: "Tabela completa códigos serviço · lista top 10 fornecedores (80% volume) · formato XML PHC CS",
    tier: "Core · PRO · Enterprise",
  },
  {
    code: "C",
    slug: "docs",
    icon: FileStack,
    title: "Digitalização Central de Documentos",
    dor: "CMR, guias remessa, guias recepção, tickets frio em papel disperso. WhatsApp caótico. Colegas das Frutas precisam antes da Lloretrans.",
    entrega:
      "Hub único. 1 operador centralizado digitaliza. Associação automática à viagem por matrícula + data + nº CMR. Tag entrada/saída. Permissões cross-empresa.",
    semanas: "3–5",
    dependencias: "Volume diário documentos · scanner/MFP portaria · matriz de permissões entre empresas do grupo",
    tier: "PRO · Enterprise",
  },
  {
    code: "D",
    slug: "fuel",
    icon: Fuel,
    title: "Médias de Combustível",
    dor: "CANBUS Frotcom, bomba interna, cartões SEPSA/REPSOL/ANAMOR em 4 silos. Fuga ou erro passa despercebido semanas.",
    entrega:
      "Cruzamento dos 4 silos. L/100km por viatura com baseline adaptativo. Anomalias sinalizadas (sinalização, não bloqueio — regra da Clarice). Relatório mensal.",
    semanas: "3–4",
    dependencias: "Plano Frotcom inclui CANBUS · método ingestão dos 3 cartões externos (API, CSV ou portal)",
    tier: "PRO · Enterprise",
  },
  {
    code: "E",
    slug: "bolsa",
    icon: PackageSearch,
    title: "Bolsa de Carga + Comissões",
    dor: "Excel com 1000+ linhas/ano. Factura polaca demora 1 mês — comercial já não lembra. Comissões calculadas à mão no fim do mês.",
    entrega:
      "Fluxo com 5 estados: agendado → entregue → fornecedor facturou → cliente facturou → pago. Comissões calculadas automaticamente (Éder 18%, default 15%). Alertas de desvio de factura e atraso de pagamento. Export Excel.",
    semanas: "6–10",
    dependencias: "Integrador PHC (master clientes/fornecedores + emissão facturas) · regra de comissão formalizada",
    tier: "Enterprise",
  },
  {
    code: "F",
    slug: "oficina",
    icon: Wrench,
    title: "Folha de Obra Oficina (PWA)",
    dor: "Mecânico preenche folha em papel. Administrativa relança no PHC manualmente. Duplicação total · zero audit trail na fonte.",
    entrega:
      "PWA mobile-first offline. Mecânico regista em < 3 min. Estados iniciar / pausar / aguardar peças / retomar / fechar com tempo activo contabilizado. Assinatura canvas. Admin valida, export PHC.",
    semanas: "5–8",
    dependencias: "Piloto com 1 mecânico antes de alargar (adopção é risco #1) · template actual em papel · wifi na oficina",
    tier: "Enterprise",
  },
];

const TIERS = [
  {
    name: "Core",
    eyebrow: "Arranque · quick win",
    tagline: "1 ou 2 MVPs à escolha para fechar a ferida mais evidente primeiro.",
    invest: "€ 8k – 18k",
    monthly: "€ 450 – 900 / mês",
    includes: [
      "1–2 MVPs (tipicamente A + B)",
      "Conectores em modo simulação + export XML PHC",
      "Onboarding 2 semanas",
      "Suporte email · 48h",
      "1 revisão trimestral de scope",
    ],
  },
  {
    name: "PRO",
    eyebrow: "Operacional · 80% do benefício",
    tagline: "Quatro módulos que cobrem o dia-a-dia administrativo e operacional.",
    invest: "€ 28k – 48k",
    monthly: "€ 1 400 – 2 800 / mês",
    includes: [
      "MVP A + B + C + F (validação km, OCR, docs, oficina)",
      "Integração PHC CS escrita (via integrador do grupo)",
      "Master de fornecedores com aprendizagem contínua",
      "Dashboard direcção com KPIs operacionais",
      "Suporte prioritário · 4h úteis",
      "Revisão mensal · 2 sprints de melhoria/ano incluídos",
    ],
    featured: true,
  },
  {
    name: "Enterprise",
    eyebrow: "Portfólio completo · escala grupo",
    tagline: "Os 6 módulos + administração multi-empresa + integrações externas reais.",
    invest: "€ 52k – 92k",
    monthly: "€ 2 800 – 4 600 / mês",
    includes: [
      "6 MVPs + módulo Admin completo",
      "Multi-empresa com permissões cross (Frutas, Tomate, Cerejas)",
      "APIs Logue Trans + Frotcom + SEPSA/REPSOL/ANAMOR",
      "PWA oficina + onboarding personalizado de mecânicos",
      "SLA 99% uptime · DPA formal assinado",
      "Roadmap conjunto · sprint review mensal com direcção",
    ],
  },
];

const TIMELINE = [
  { week: "1", phase: "Sprint 0", tasks: "Acesso Neon + Vercel · credenciais Frotcom · dataset shadow", color: "bg-[hsl(220_9%_45%)]" },
  { week: "2–3", phase: "MVP A · Validação km", tasks: "Reconciliação Logue×Frotcom · dashboard · demo interna", color: "bg-[hsl(222_72%_38%)]" },
  { week: "2–7", phase: "MVP B · OCR", tasks: "Pipeline Azure DI · classificação · 10 fornecedores educados", color: "bg-[hsl(222_72%_38%)]" },
  { week: "4–8", phase: "MVP C · Docs", tasks: "Hub centralizado · associação automática · permissões cross", color: "bg-[hsl(222_72%_38%)]" },
  { week: "8–11", phase: "MVP D · Combustível", tasks: "Cruzamento 4 silos · anomalias · relatório mensal", color: "bg-[hsl(32_82%_50%)]" },
  { week: "10–18", phase: "MVP E · Bolsa", tasks: "State machine · comissões · integração PHC escrita", color: "bg-[hsl(32_82%_50%)]" },
  { week: "13–19", phase: "MVP F · Oficina PWA", tasks: "Piloto com 1 mecânico · alargar · export PHC", color: "bg-[hsl(0_72%_50%)]" },
];

const DEPENDENCIES = [
  {
    label: "API Logue Trans",
    owner: "Hélio · Lloretrans",
    bloqueia: "MVP A e C em modo live",
    mitigacao: "Stubs activos até API chegar · reunião técnica 45 min nas primeiras 72h",
  },
  {
    label: "Integrador PHC CS",
    owner: "Parceiro actual do grupo",
    bloqueia: "Escrita automática em MVP B, E, F",
    mitigacao: "Demo opera com export XML enquanto integrador não está disponível",
  },
  {
    label: "Plano Frotcom com CANBUS",
    owner: "Administração grupo",
    bloqueia: "Precisão do MVP D",
    mitigacao: "Viaturas sem CANBUS continuam a usar cartões · baseline híbrido",
  },
  {
    label: "Shadow session administrativa",
    owner: "Clarice · 2h",
    bloqueia: "Baselines de ROI para defender a proposta internamente",
    mitigacao: "Pode ser pós-assinatura de Sprint 0",
  },
  {
    label: "Piloto mecânico MVP F",
    owner: "Responsável oficina · 3 semanas",
    bloqueia: "Adopção do módulo oficina",
    mitigacao: "Arrancar com 1 mecânico antes de alargar · reversibilidade total",
  },
];

const STATS = [
  { n: "6", label: "Módulos independentes" },
  { n: "9", label: "Facturas reais já processadas" },
  { n: "60+", label: "Viaturas por operador suportadas" },
  { n: "EU", label: "Dados 100% em Frankfurt" },
];

export default function PropostaPage() {
  return (
    <main className="relative min-h-screen bg-[hsl(40_24%_98%)] text-[hsl(220_28%_10%)] overflow-hidden print:bg-white">
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.03] print:hidden"
        style={{
          backgroundImage: "radial-gradient(hsl(222 72% 15%) 1px, transparent 1px)",
          backgroundSize: "24px 24px",
        }}
      />
      <div className="pointer-events-none absolute inset-x-0 top-0 h-[500px] bg-[radial-gradient(ellipse_50%_40%_at_50%_0%,hsl(32_82%_55%/0.1),transparent_60%)] print:hidden" />

      {/* HEADER */}
      <header className="relative z-10 mx-auto max-w-[1100px] px-6 lg:px-10 pt-8 flex items-center justify-between border-b border-[hsl(220_14%_88%)] pb-6">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-md bg-[hsl(222_72%_30%)] text-white grid place-items-center font-display font-bold">
            A
          </div>
          <div>
            <div className="font-display font-semibold leading-none">AiTiPro</div>
            <div className="text-[10px] text-muted-foreground mt-0.5 tracking-wider uppercase">
              Proposta confidencial
            </div>
          </div>
        </div>
        <div className="hidden sm:flex items-center gap-3 print:hidden">
          <a
            href="javascript:window.print()"
            className="text-xs text-muted-foreground hover:text-foreground transition-colors inline-flex items-center gap-1.5"
          >
            <Printer className="h-3.5 w-3.5" />
            Imprimir / PDF
          </a>
          <Link
            href="mailto:bilal@aitipro.com?subject=Proposta%20Lloretrans%20·%20feedback"
            className="text-xs text-muted-foreground hover:text-foreground transition-colors inline-flex items-center gap-1.5"
          >
            <Mail className="h-3.5 w-3.5" />
            Responder
          </Link>
        </div>
      </header>

      {/* TITLE BLOCK */}
      <section className="relative z-10 mx-auto max-w-[1100px] px-6 lg:px-10 pt-16 pb-10 animate-fade-in">
        <Badge variant="outline" className="text-[11px] tracking-wider uppercase mb-5">
          Proposta comercial · Versão {VERSION} · {DATE}
        </Badge>
        <h1 className="font-display text-5xl lg:text-6xl font-semibold leading-[0.98] tracking-[-0.03em] max-w-[900px]">
          Plataforma operacional{" "}
          <span className="italic text-[hsl(222_72%_30%)]">Lloretrans</span>.
          <br />
          Seis módulos. <span className="italic">Uma resposta.</span>
        </h1>
        <div className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-muted-foreground">
          <span>Para: <strong className="text-foreground">{ADDRESSED_TO}</strong></span>
          <span className="hidden sm:inline">·</span>
          <span>Grupo Patrícia Pilar</span>
          <span className="hidden sm:inline">·</span>
          <span>De: Bilal Machraa · AiTiPro</span>
        </div>
      </section>

      {/* EXECUTIVE SUMMARY (BLUF) */}
      <section className="relative z-10 mx-auto max-w-[1100px] px-6 lg:px-10 pb-16">
        <div className="rounded-2xl border border-[hsl(222_72%_30%)]/20 bg-white shadow-elevated-sm p-8 lg:p-10">
          <div className="text-[11px] tracking-[0.2em] uppercase text-[hsl(32_82%_45%)] font-semibold mb-4">
            Sumário executivo · 60 segundos
          </div>
          <div className="grid lg:grid-cols-12 gap-6 lg:gap-10">
            <div className="lg:col-span-8 space-y-4 text-[15px] leading-relaxed">
              <p>
                A reunião de 16 de Abril identificou <strong>seis fluxos operacionais</strong> com
                dor mensurável — validação de quilómetros, OCR de facturas, digitalização central,
                médias de combustível, bolsa de carga e folhas de obra da oficina. Em todas elas, o
                denominador comum não é apenas o tempo perdido em tarefas manuais — é{" "}
                <strong className="text-[hsl(222_72%_30%)]">o controlo que escapa</strong>:
                papéis que se perdem, classificações que dependem de conhecimento tácito, cargas
                cuja factura chega um mês depois sem memória.
              </p>
              <p>
                Propomos uma <strong>plataforma integrada</strong> que cobre todos os seis fluxos
                com a mesma disciplina: a IA regista e classifica, o humano valida antes de qualquer
                acção irreversível, e cada mutação fica em auditoria append-only. Os seis módulos são
                vendáveis independentemente — comecem por um, chegam aos seis quando fizer sentido.
              </p>
              <p>
                <strong>O estado actual é uma demonstração a funcionar</strong> em
                <code className="font-mono text-[13px] bg-secondary px-1.5 py-0.5 rounded mx-1">
                  lloretrans.aitipro.com
                </code>
                com dados sintéticos deterministas e as <strong>9 facturas reais</strong> de fornecedores
                da Lloretrans já classificadas. É só pedirem para vos mostrar.
              </p>
            </div>
            <div className="lg:col-span-4 space-y-3 border-l-2 border-[hsl(222_72%_30%)]/15 pl-6 lg:pl-8">
              <SummaryLine label="Investimento" value="€ 8k – 92k" hint="consoante tier Core / PRO / Enterprise" />
              <SummaryLine label="Recorrente" value="€ 450 – 4 600 / mês" hint="SaaS + manutenção + suporte" />
              <SummaryLine label="Timeline" value="18–19 semanas" hint="plataforma completa · primeiros benefícios à 3ª semana" />
              <SummaryLine label="Próximo passo" value="Assinatura Sprint 0" hint="acesso técnico + shadow session" />
            </div>
          </div>
          <div className="mt-8 flex flex-wrap items-center gap-3 pt-6 border-t border-[hsl(220_14%_90%)]">
            <Button asChild size="lg" className="shadow-elevated-sm">
              <Link href="https://lloretrans.aitipro.com" target="_blank" rel="noopener">
                Abrir a demo
              </Link>
            </Button>
            <Button asChild size="lg" variant="outline">
              <Link href="mailto:bilal@aitipro.com?subject=Assinar%20proposta%20Lloretrans%20-%20Sprint%200">
                Marcar assinatura
              </Link>
            </Button>
            <span className="text-xs text-muted-foreground ml-auto">
              Validade: 30 dias · preços em euros sem IVA
            </span>
          </div>
        </div>
      </section>

      {/* STATS BAND */}
      <section className="relative z-10 mx-auto max-w-[1100px] px-6 lg:px-10 pb-16">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-px bg-[hsl(220_14%_88%)] border border-[hsl(220_14%_88%)] rounded-xl overflow-hidden">
          {STATS.map((s) => (
            <div key={s.label} className="bg-white p-6 text-center">
              <div className="font-display text-4xl font-semibold tabular text-[hsl(222_72%_22%)]">{s.n}</div>
              <div className="text-[11px] uppercase tracking-wider text-muted-foreground mt-1">{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* CONTEXTO */}
      <Section id="contexto" eyebrow="Contexto" title="Seis fluxos. Uma mesma frase-âncora.">
        <div className="grid lg:grid-cols-12 gap-10 items-start">
          <div className="lg:col-span-7 space-y-4 text-[15px] leading-relaxed">
            <p>
              Na reunião de 16 de Abril de 2026, a Clarice Santos e o Éder Monteiro percorreram o
              portfólio operacional da Lloretrans — da portaria à facturação. O briefing foi directo:
              há dores em cada etapa, mas o foco não é velocidade.
            </p>
            <p>
              Mapeámos os seis fluxos discutidos, atribuímos um MVP a cada, e construímos uma demo
              ao vivo em que a Clarice e qualquer stakeholder do grupo podem entrar e ver em prática
              — sem formulários, sem onboarding, apenas um URL público e 12 perfis pré-seeded.
            </p>
            <p>
              Esta proposta formaliza o âmbito, o investimento e o calendário. Nenhuma frase aqui
              inventa coisas que a Clarice não pediu — cada MVP corresponde a uma dor concreta
              transcrita da reunião.
            </p>
          </div>
          <div className="lg:col-span-5">
            <div className="rounded-xl bg-[hsl(40_30%_96%)] border border-[hsl(220_14%_88%)] p-8">
              <div className="text-[hsl(32_82%_45%)] text-5xl font-display leading-none mb-3 select-none">
                &ldquo;
              </div>
              <p className="font-display text-2xl leading-snug tracking-[-0.02em]">
                Não é só tempo. A nossa preocupação também é o{" "}
                <span className="italic text-[hsl(222_72%_30%)]">controle</span>.
              </p>
              <p className="font-display text-lg leading-snug tracking-[-0.02em] mt-3 text-foreground/70">
                A IA regista. O humano valida.
              </p>
              <div className="mt-5 pt-5 border-t border-[hsl(220_14%_88%)] text-xs text-muted-foreground">
                Clarice Santos · Lloretrans · 16/04/2026
              </div>
            </div>
          </div>
        </div>
      </Section>

      {/* ÂMBITO — 6 MVPs */}
      <Section id="ambito" eyebrow="Âmbito" title="Os seis módulos · um a um.">
        <div className="space-y-5">
          {MVPS.map((m, i) => {
            const Icon = m.icon;
            return (
              <article
                key={m.slug}
                className="rounded-xl border border-[hsl(220_14%_88%)] bg-white p-6 lg:p-8 animate-fade-in"
                style={{ animationDelay: `${i * 40}ms` }}
              >
                <div className="grid lg:grid-cols-12 gap-6 lg:gap-10">
                  <div className="lg:col-span-3">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="h-12 w-12 rounded-lg bg-[hsl(222_72%_30%)]/10 grid place-items-center">
                        <Icon className="h-6 w-6 text-[hsl(222_72%_30%)]" />
                      </div>
                      <div>
                        <div className="font-mono text-[10px] text-muted-foreground tracking-wider uppercase">
                          MVP · {m.code}
                        </div>
                        <div className="font-display text-xl font-semibold leading-tight mt-0.5">
                          {m.title}
                        </div>
                      </div>
                    </div>
                    <div className="text-xs space-y-1.5">
                      <div>
                        <span className="text-muted-foreground">Esforço:</span>{" "}
                        <span className="font-mono font-semibold">{m.semanas} sem</span>
                      </div>
                      <div className="text-muted-foreground">{m.tier}</div>
                    </div>
                  </div>
                  <div className="lg:col-span-9 space-y-4 text-sm">
                    <div>
                      <div className="text-[10px] uppercase tracking-wider text-[hsl(0_72%_45%)] font-semibold mb-1">
                        Dor
                      </div>
                      <p className="text-foreground/80 leading-relaxed">{m.dor}</p>
                    </div>
                    <div>
                      <div className="text-[10px] uppercase tracking-wider text-[hsl(152_55%_32%)] font-semibold mb-1">
                        Entrega
                      </div>
                      <p className="text-foreground/80 leading-relaxed">{m.entrega}</p>
                    </div>
                    <div>
                      <div className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold mb-1">
                        Dependências
                      </div>
                      <p className="text-foreground/70 leading-relaxed text-xs">{m.dependencias}</p>
                    </div>
                    <div className="pt-2">
                      <Link
                        href={`https://lloretrans.aitipro.com/login?target=${m.slug}`}
                        target="_blank"
                        rel="noopener"
                        className="text-sm font-medium text-[hsl(222_72%_30%)] hover:underline inline-flex items-center gap-1"
                      >
                        Ver em funcionamento na demo <ArrowUpRight className="h-3.5 w-3.5" />
                      </Link>
                    </div>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      </Section>

      {/* TIERS / INVESTIMENTO */}
      <Section
        id="investimento"
        eyebrow="Investimento"
        title="Três tiers. Compram-se por escada."
        intro="Os preços são ranges porque dependem de decisões de scope (número de fornecedores OCR, integração PHC escrita, multi-empresa). O preço final é fixado após Sprint 0 — duas semanas de descoberta técnica que já ficam dentro do investimento."
      >
        <div className="grid gap-5 md:grid-cols-3">
          {TIERS.map((tier) => (
            <div
              key={tier.name}
              className={`rounded-xl p-7 relative ${
                tier.featured
                  ? "bg-[hsl(222_72%_14%)] text-white shadow-elevated-lg border-2 border-[hsl(222_72%_30%)]"
                  : "bg-white border border-[hsl(220_14%_88%)]"
              }`}
            >
              {tier.featured && (
                <Badge className="absolute -top-3 left-7 bg-[hsl(32_82%_55%)] text-[hsl(222_72%_12%)] border-0">
                  Recomendado
                </Badge>
              )}
              <div
                className={`text-[10px] uppercase tracking-[0.18em] font-semibold mb-2 ${
                  tier.featured ? "text-[hsl(32_82%_65%)]" : "text-[hsl(32_82%_45%)]"
                }`}
              >
                {tier.eyebrow}
              </div>
              <div className="font-display text-3xl font-semibold">{tier.name}</div>
              <div className={`text-sm mt-2 leading-relaxed ${tier.featured ? "text-white/70" : "text-muted-foreground"}`}>
                {tier.tagline}
              </div>
              <div className="mt-6 pt-6 border-t border-dashed border-current/20">
                <div className={`text-xs uppercase tracking-wider ${tier.featured ? "text-white/60" : "text-muted-foreground"}`}>
                  Implementação única
                </div>
                <div className="font-display text-2xl font-semibold mt-1 tabular">{tier.invest}</div>
                <div className={`text-xs mt-3 uppercase tracking-wider ${tier.featured ? "text-white/60" : "text-muted-foreground"}`}>
                  Recorrente
                </div>
                <div className="font-mono text-sm font-semibold mt-1">{tier.monthly}</div>
              </div>
              <ul className="mt-6 space-y-2.5 text-sm">
                {tier.includes.map((i) => (
                  <li key={i} className="flex gap-2.5">
                    <CheckCircle2
                      className={`h-4 w-4 shrink-0 mt-0.5 ${
                        tier.featured ? "text-[hsl(32_82%_65%)]" : "text-[hsl(152_55%_38%)]"
                      }`}
                    />
                    <span className={tier.featured ? "text-white/85" : "text-foreground/80"}>{i}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div className="mt-8 text-sm text-muted-foreground text-center">
          Incluído em todos os tiers: alojamento em Neon EU Frankfurt · deploy Vercel fra1 · audit log append-only ·
          export XML PHC · onboarding stakeholders · revisão trimestral de scope.
        </div>
      </Section>

      {/* TIMELINE */}
      <Section
        id="timeline"
        eyebrow="Timeline"
        title="18 a 19 semanas para o portfólio completo."
        intro="Sequenciado por dependência, não por ordem alfabética. MVP A arranca cedo porque é quick-win com dados já existentes; F fica para o fim porque o risco de adopção é o mais alto do portfólio."
      >
        <div className="rounded-xl border border-[hsl(220_14%_88%)] bg-white p-6 lg:p-8 overflow-x-auto">
          <div className="min-w-[700px] space-y-3">
            {TIMELINE.map((t) => (
              <div key={t.phase} className="grid grid-cols-[80px_1fr_2fr_40px] gap-4 items-center text-sm">
                <div className="font-mono text-xs text-muted-foreground">Sem {t.week}</div>
                <div className="font-semibold">{t.phase}</div>
                <div className="text-foreground/70 text-xs">{t.tasks}</div>
                <div className={`h-2.5 rounded-full ${t.color}`} />
              </div>
            ))}
          </div>
        </div>
        <div className="mt-5 text-xs text-muted-foreground flex flex-wrap gap-x-6 gap-y-1">
          <span className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-[hsl(220_9%_45%)]" /> Descoberta
          </span>
          <span className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-[hsl(222_72%_38%)]" /> Módulos fundacionais
          </span>
          <span className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-[hsl(32_82%_50%)]" /> Módulos dependentes de integração
          </span>
          <span className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-[hsl(0_72%_50%)]" /> Módulo de maior risco de adopção
          </span>
        </div>
      </Section>

      {/* DEPENDÊNCIAS & RISCOS */}
      <Section
        id="dependencias"
        eyebrow="Dependências"
        title="O que precisamos de vocês para avançar."
        intro="Sem estas peças, a proposta perde precisão e podem aparecer surpresas a meio do projecto. Listadas por criticidade, com mitigação em cada uma."
      >
        <div className="rounded-xl border border-[hsl(220_14%_88%)] bg-white overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-[hsl(40_30%_96%)]">
              <tr>
                <th className="text-left px-5 py-3 text-[11px] uppercase tracking-wider text-muted-foreground font-semibold">Dependência</th>
                <th className="text-left px-5 py-3 text-[11px] uppercase tracking-wider text-muted-foreground font-semibold">Responsável</th>
                <th className="text-left px-5 py-3 text-[11px] uppercase tracking-wider text-muted-foreground font-semibold">Bloqueia</th>
                <th className="text-left px-5 py-3 text-[11px] uppercase tracking-wider text-muted-foreground font-semibold">Mitigação</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[hsl(220_14%_92%)]">
              {DEPENDENCIES.map((d) => (
                <tr key={d.label}>
                  <td className="px-5 py-3.5 font-semibold text-[hsl(0_72%_38%)]">
                    <div className="flex items-center gap-2">
                      <AlertTriangle className="h-3.5 w-3.5" />
                      {d.label}
                    </div>
                  </td>
                  <td className="px-5 py-3.5 text-foreground/80">{d.owner}</td>
                  <td className="px-5 py-3.5 text-foreground/80">{d.bloqueia}</td>
                  <td className="px-5 py-3.5 text-muted-foreground text-xs">{d.mitigacao}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Section>

      {/* QUESTÕES EM ABERTO · G6/G7/G8 */}
      <Section
        id="questoes-abertas"
        eyebrow="Questões em aberto"
        title="O que precisamos de resolver — e quem decide."
        intro="Cada item abaixo foi identificado na reunião ou em auditoria posterior. São questões binárias ou operacionais que mudam âmbito e custo — não ficam para improvisar em produção."
      >
        <div className="space-y-4">
          <OpenQuestion
            tag="G6"
            severity="Operacional"
            title="Cobertura fim-de-semana e janela 24h"
            body="Na reunião a Clarice referiu: «ao domingo não temos ninguém». A plataforma recupera horas, mas permanece aberto se queremos habilitar MVP A/D a correr sem supervisão nessas janelas — com alertas Slack/e-mail para ocorrências fora-de-padrão — ou se o processo fica estritamente 09–18."
            responsavel="Clarice + Direcção"
            prazo="Decisão até final de Sprint 0"
          />
          <OpenQuestion
            tag="G7"
            severity="Binário · alto impacto"
            title="PHC CS vs PHC GO — confirmar versão exacta"
            body="A factura PREVROD tem «Software PHC GO» no rodapé. O briefing assume PHC CS. São produtos com APIs, integradores e custos distintos. Pergunta directa ao Hélio + administração do grupo: qual é a versão e quais os módulos licenciados? O scope de integração (e o preço) depende desta resposta."
            responsavel="Hélio · integrador actual"
            prazo="Resolver antes da assinatura Sprint 0"
          />
          <OpenQuestion
            tag="G8"
            severity="Risco de adopção"
            title="Plano de onboarding do mecânico (MVP F)"
            body="A Clarice levantou a objecção: «mecânicos com 50 anos, vai dar computador, não é com ninguém, papel». Plano proposto: 1 dia de treino presencial com 1 mecânico piloto, 2 semanas de acompanhamento no terreno, fallback em papel + OCR a ligar automaticamente à folha. Adopção é KPI formal da Fase 0, medida à semana 4 e 12."
            responsavel="Responsável oficina + Bilal"
            prazo="Arranque no piloto · Semana 13"
          />
          <OpenQuestion
            tag="G5"
            severity="Validação comercial"
            title="Baselines actuais · shadow session"
            body="A Clarice disse «ou perdemos muito tempo» sobre cada um dos 6 módulos, mas não há números. 2–3h de shadow session com a administrativa da facturação e o Éder mede o ponto de partida. Sem baseline, o ROI é anedótico, não argumento defensável à administração."
            responsavel="Administrativa facturação + Éder"
            prazo="Semana 1 de Sprint 0"
          />
        </div>
      </Section>

      {/* COMPLIANCE */}
      <Section id="compliance" eyebrow="Compliance" title="RGPD por defeito. Sem ressalvas.">
        <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-4">
          <ComplianceCard
            title="Dados em Frankfurt"
            body="Neon Postgres + Vercel deploy fra1. Zero data centers US no caminho crítico. Retenção configurável por tipo de documento."
          />
          <ComplianceCard
            title="Audit imutável"
            body="Cada mutação (aprovar, classificar, transitar) escreve linha append-only em audit_log com utilizador, antes/depois, motivo."
          />
          <ComplianceCard
            title="Human-in-the-loop"
            body="Nenhuma acção irreversível é feita sem validação humana. Regra explícita da Clarice, codificada em cada Server Action."
          />
          <ComplianceCard
            title="NDA + DPA"
            body="Assinamos NDA antes de qualquer dado real entrar na plataforma. DPA formal incluído no tier Enterprise."
          />
        </div>
      </Section>

      {/* PRÓXIMOS PASSOS */}
      <Section id="proximos-passos" eyebrow="Próximos passos" title="Do sim à primeira demo operacional.">
        <ol className="space-y-4">
          <StepItem
            n="1"
            title="Vocês abrem a demo"
            body="https://lloretrans.aitipro.com · sem login, escolham a persona Clarice. Cliquem pelos 6 módulos, testem os deep-links da proposta."
            when="Hoje"
          />
          <StepItem
            n="2"
            title="Reunião de assinatura · 45 min"
            body="Validam o tier escolhido (sugerimos PRO), assinam NDA mútuo + carta de intenção para Sprint 0. Enviamos factura pró-forma no próprio dia."
            when="Esta semana"
          />
          <StepItem
            n="3"
            title="Sprint 0 arranca · 2 semanas"
            body="Acesso à API Logue Trans com o Hélio. Shadow session de 2h com administrativa para medir baselines. Acesso ao integrador PHC. Scope final dos tiers fechado."
            when="Dia +5"
          />
          <StepItem
            n="4"
            title="Primeira entrega operacional"
            body="Dashboard de validação km (MVP A) em produção na vossa instância própria, com dados reais. A partir daqui é pura entrega de valor semanal."
            when="Dia +21"
          />
        </ol>
        <div className="mt-10 rounded-xl bg-gradient-to-br from-[hsl(222_72%_30%)] via-[hsl(222_72%_20%)] to-[hsl(222_72%_14%)] text-white p-8 lg:p-10 relative overflow-hidden">
          <div
            className="absolute inset-0 opacity-[0.08] pointer-events-none"
            style={{ backgroundImage: "radial-gradient(white 1px, transparent 1px)", backgroundSize: "20px 20px" }}
          />
          <div className="relative z-10 grid lg:grid-cols-12 gap-6 items-center">
            <div className="lg:col-span-8">
              <h3 className="font-display text-3xl lg:text-4xl font-semibold leading-tight tracking-[-0.02em]">
                Pronto para fechar Sprint 0?
              </h3>
              <p className="mt-4 text-white/75 leading-relaxed max-w-2xl">
                Um email de sim chega. Respondemos em 24h com agenda de reunião para assinatura.
                Se houver dúvidas, marcamos 30 min em vez disso.
              </p>
            </div>
            <div className="lg:col-span-4 flex flex-col gap-3 lg:items-end">
              <Button asChild size="lg" className="bg-white text-[hsl(222_72%_22%)] hover:bg-white/90 border-0 shadow-elevated w-full lg:w-auto">
                <Link href="mailto:bilal@aitipro.com?subject=Avançar%20com%20Sprint%200%20Lloretrans&body=Olá%20Bilal%2C%0A%0AVamos%20avançar%20com%20o%20tier%3A%20%5BCore%20%2F%20PRO%20%2F%20Enterprise%5D%0A%0ASemana%20preferida%20para%20assinatura%3A%20%5B...%5D%0A%0AOutras%20notas%3A%0A%5B...%5D%0A%0AObrigada.">
                  Enviar sim →
                </Link>
              </Button>
              <Button asChild size="lg" variant="outline" className="border-white/30 text-white hover:bg-white/10 w-full lg:w-auto">
                <Link href="mailto:bilal@aitipro.com?subject=Dúvidas%20sobre%20proposta%20Lloretrans">
                  Tenho dúvidas
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </Section>

      {/* SIGNATURE BLOCK */}
      <section className="relative z-10 mx-auto max-w-[1100px] px-6 lg:px-10 pb-20 pt-4">
        <div className="rounded-xl border border-[hsl(220_14%_88%)] bg-white p-8 lg:p-10">
          <div className="grid lg:grid-cols-2 gap-10">
            <div>
              <div className="text-[11px] uppercase tracking-wider text-muted-foreground font-semibold mb-3">
                Subscrição AiTiPro
              </div>
              <div className="font-display text-2xl font-semibold">Bilal Machraa</div>
              <div className="text-sm text-muted-foreground">Fundador · AiTiPro</div>
              <div className="mt-3 text-sm space-y-1">
                <div>
                  <Link href="mailto:bilal@aitipro.com" className="text-[hsl(222_72%_30%)] hover:underline">
                    bilal@aitipro.com
                  </Link>
                </div>
                <div className="text-muted-foreground text-xs">Lisboa · Portugal · {DATE}</div>
              </div>
            </div>
            <div className="lg:text-right">
              <div className="text-[11px] uppercase tracking-wider text-muted-foreground font-semibold mb-3">
                Documento
              </div>
              <div className="text-sm space-y-1">
                <div>
                  Proposta v{VERSION} · gerada a {DATE}
                </div>
                <div className="text-muted-foreground">
                  Para uso interno do Grupo Patrícia Pilar · confidencial
                </div>
                <div className="text-muted-foreground text-xs pt-2">
                  Referências: <Link href="https://sustentareport.aitipro.com/proposta" className="hover:underline" target="_blank" rel="noopener">sustentareport.aitipro.com/proposta</Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="relative z-10 border-t border-[hsl(220_14%_88%)] print:hidden">
        <div className="mx-auto max-w-[1100px] px-6 lg:px-10 py-8 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-muted-foreground">
          <div className="flex items-center gap-2">
            <ShieldCheck className="h-3.5 w-3.5" />
            <span>Documento privado · válido 30 dias a partir de {DATE}</span>
          </div>
          <div className="flex items-center gap-4">
            <Link href="https://lloretrans.aitipro.com" className="hover:text-foreground transition-colors">
              Demo ao vivo
            </Link>
            <Link href="mailto:bilal@aitipro.com" className="hover:text-foreground transition-colors">
              bilal@aitipro.com
            </Link>
          </div>
        </div>
      </footer>
    </main>
  );
}

function Section({
  id,
  eyebrow,
  title,
  intro,
  children,
}: {
  id: string;
  eyebrow: string;
  title: string;
  intro?: string;
  children: React.ReactNode;
}) {
  return (
    <section
      id={id}
      className="relative z-10 mx-auto max-w-[1100px] px-6 lg:px-10 py-16 lg:py-20 scroll-mt-20"
    >
      <div className="max-w-3xl mb-10">
        <div className="text-[11px] tracking-[0.2em] uppercase text-[hsl(32_82%_45%)] font-semibold mb-3">
          {eyebrow}
        </div>
        <h2 className="font-display text-4xl lg:text-[44px] font-semibold leading-tight tracking-[-0.02em]">
          {title}
        </h2>
        {intro && <p className="mt-5 text-foreground/70 leading-relaxed text-[15px]">{intro}</p>}
      </div>
      {children}
    </section>
  );
}

function SummaryLine({ label, value, hint }: { label: string; value: string; hint: string }) {
  return (
    <div>
      <div className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">{label}</div>
      <div className="font-display text-lg font-semibold leading-tight mt-0.5">{value}</div>
      <div className="text-xs text-muted-foreground mt-0.5 leading-relaxed">{hint}</div>
    </div>
  );
}

function OpenQuestion({
  tag,
  severity,
  title,
  body,
  responsavel,
  prazo,
}: {
  tag: string;
  severity: string;
  title: string;
  body: string;
  responsavel: string;
  prazo: string;
}) {
  return (
    <article className="rounded-xl border border-[hsl(220_14%_88%)] bg-white p-6 lg:p-7">
      <div className="grid lg:grid-cols-[auto_1fr] gap-4 lg:gap-6 items-start">
        <div className="flex lg:flex-col items-baseline lg:items-start gap-2 lg:gap-1.5 lg:min-w-[110px]">
          <Badge className="bg-[hsl(32_82%_55%)]/12 text-[hsl(32_82%_35%)] border-0 font-mono font-semibold">
            {tag}
          </Badge>
          <span className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">
            {severity}
          </span>
        </div>
        <div className="space-y-3">
          <h3 className="font-display text-xl font-semibold leading-tight">{title}</h3>
          <p className="text-sm text-foreground/75 leading-relaxed">{body}</p>
          <div className="flex flex-wrap gap-x-6 gap-y-1 text-xs pt-1 text-muted-foreground">
            <span>
              <span className="font-semibold text-foreground/80">Responsável:</span> {responsavel}
            </span>
            <span>
              <span className="font-semibold text-foreground/80">Prazo:</span> {prazo}
            </span>
          </div>
        </div>
      </div>
    </article>
  );
}

function ComplianceCard({ title, body }: { title: string; body: string }) {
  return (
    <div className="rounded-xl border border-[hsl(220_14%_88%)] bg-white p-6">
      <ShieldCheck className="h-5 w-5 text-[hsl(222_72%_30%)] mb-4" />
      <h3 className="font-display text-lg font-semibold mb-2">{title}</h3>
      <p className="text-sm text-foreground/70 leading-relaxed">{body}</p>
    </div>
  );
}

function StepItem({ n, title, body, when }: { n: string; title: string; body: string; when: string }) {
  return (
    <li className="grid grid-cols-[48px_1fr] gap-5 items-start">
      <div className="h-10 w-10 rounded-full bg-[hsl(222_72%_30%)]/10 text-[hsl(222_72%_30%)] grid place-items-center font-mono font-semibold">
        {n}
      </div>
      <div className="flex-1 pt-1">
        <div className="flex items-baseline justify-between gap-4">
          <h3 className="font-display text-xl font-semibold tracking-tight">{title}</h3>
          <div className="text-xs font-medium text-muted-foreground whitespace-nowrap flex items-center gap-1">
            <Calendar className="h-3 w-3" />
            {when}
          </div>
        </div>
        <p className="text-sm text-foreground/75 leading-relaxed mt-1.5">{body}</p>
      </div>
    </li>
  );
}
