import Link from "next/link";
import { requireSession } from "@/lib/auth/session";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { PrintPageAction } from "@/components/print-page-action";
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
  Mail,
  ArrowUpRight,
  ShieldCheck,
  Presentation,
} from "lucide-react";

export const metadata = {
  title: "Proposta — Plataforma Operacional Lloretrans × AiTiPro",
  description:
    "Proposta de implementação da plataforma operacional Lloretrans 5+1 · Grupo Patrícia Pilar · Versão 1.4 · 30 Abril 2026.",
  robots: { index: false, follow: false },
};

const VERSION = "1.4";
const DATE = "30 de Abril, 2026";
const ADDRESSED_TO = "Clarice Santos · Direcção Lloretrans";

const MVPS = [
  {
    code: "A",
    slug: "km",
    icon: TruckIcon,
    title: "Validação de Quilómetros",
    dor: "Administrativas entram em duas aplicações, viagem a viagem, a cruzar Logue Trans com Frotcom. Erros passam para a factura.",
    entrega:
      "Dashboard diário com semáforo verde/amarelo/vermelho. Threshold confirmado 3 km. Bulk-approve das verdes com um clique. Export CSV para PHC Advanced.",
    semanas: "2–3",
    dependencias: "API Logue Trans (Hélio) · credenciais Frotcom (grupo)",
    tier: "Incluído no pacote 5+1",
    invest: "€ 4.000",
  },
  {
    code: "B",
    slug: "ocr",
    icon: ReceiptText,
    title: "OCR Facturas de Fornecedor",
    dor: "50 fornecedores oficina, 50 layouts. Classificação por conhecimento tácito — sai com a pessoa que sabe.",
    entrega:
      "Upload → extracção automática → classificação por NIF → validação humana → export XML PHC Advanced. Cada correcção cria regra de fornecedor que aplica em próximas facturas. 9 facturas reais já carregadas.",
    semanas: "4–6",
    dependencias: "Tabela completa códigos serviço · lista top 10 fornecedores (80% volume) · formato XML PHC Advanced",
    tier: "Incluído no pacote 5+1",
    invest: "€ 11.500",
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
    tier: "Incluído no pacote 5+1",
    invest: "€ 6.500",
  },
  {
    code: "D",
    slug: "fuel",
    icon: Fuel,
    title: "Médias de Combustível",
    dor: "Cepsa/Repsol/Radius/bomba interna + Frotcom API pendente. O cruzamento manual deixa fuga ou erro passar despercebido semanas.",
    entrega:
      "Cruzamento dos abastecimentos reais por fornecedor. L/100km por viatura com baseline adaptativo quando a leitura Frotcom estiver disponível. Anomalias sinalizadas, não bloqueadas — regra da Clarice.",
    semanas: "3–4",
    dependencias: "API Frotcom de leitura por confirmar · ingestão periódica Cepsa/Repsol/Radius/bomba interna",
    tier: "Roadmap · +€ 7.500 pós-Frotcom",
    invest: "+€ 7.500",
  },
  {
    code: "E",
    slug: "bolsa",
    icon: PackageSearch,
    title: "Bolsa de Carga + Comissões",
    dor: "Excel com 1000+ linhas/ano. Factura polaca demora 1 mês — comercial já não lembra. Comissões calculadas à mão no fim do mês.",
    entrega:
      "Excel real de 306 cargas em tabela auditada, com R/NR, CMR, facturas fornecedor/cliente e comissões por regra confirmada: 20% do lucro total + €2,50 nacional ou €5 internacional em viatura Lloretrans.",
    semanas: "6–10",
    dependencias: "Integrador PHC Advanced (master clientes/fornecedores + emissão facturas) · confirmar se PREÇO CLIENTE/PAGO TRANSPORTADOR representam venda/custo; Excel mostra margem global -€1.800",
    tier: "Incluído no pacote 5+1",
    invest: "€ 10.500",
  },
  {
    code: "F",
    slug: "oficina",
    icon: Wrench,
    title: "Folha de Obra Oficina (PWA)",
    dor: "Mecânico preenche folha em papel. Administrativa relança no PHC Advanced manualmente. Duplicação total · zero audit trail na fonte.",
    entrega:
      "PWA mobile-first offline. Mecânico regista em < 3 min. Estados iniciar / pausar / aguardar peças / retomar / fechar com tempo activo contabilizado. Assinatura canvas. Admin valida, export PHC Advanced.",
    semanas: "5–8",
    dependencias: "Piloto com 1 mecânico antes de alargar (adopção é risco #1) · template actual em papel · wifi na oficina",
    tier: "Incluído no pacote 5+1",
    invest: "€ 9.000",
  },
];

const INVESTMENT_BREAKDOWN = [
  { label: "Sprint 0", detail: "Validação técnica · PHC Advanced · Frotcom · Logue Trans", amount: "€ 3.500" },
  { label: "Módulo A", detail: "Validação km Logue Trans × Frotcom", amount: "€ 4.000" },
  { label: "Módulo B", detail: "OCR facturas fornecedor + classificação + export PHC Advanced", amount: "€ 11.500" },
  { label: "Módulo C", detail: "Digitalização central de documentos", amount: "€ 6.500" },
  { label: "Módulo E", detail: "Bolsa de carga + comissões", amount: "€ 10.500" },
  { label: "Módulo F", detail: "Folha de obra digital oficina", amount: "€ 9.000" },
];

const PHASED_OPTIONS = [
  {
    name: "Entrada mínima defensável",
    eyebrow: "Gatinhar",
    modules: "Sprint 0 + A + C",
    amount: "€ 14.000",
    note: "Valida integrações, quilómetros e hub documental com o menor compromisso inicial.",
    bullets: ["Primeiro quick win visível.", "Resolve controlo documental e quilómetros.", "Abre a porta para OCR quando houver confiança."],
    fit: "Compra prudente para provar método, equipa e dados antes de aumentar âmbito.",
  },
  {
    name: "Núcleo documental + OCR",
    eyebrow: "Andar",
    modules: "Sprint 0 + A + B + C",
    amount: "€ 25.500",
    note: "Ataca o trabalho administrativo repetitivo: documentos, quilómetros e facturas de fornecedor.",
    bullets: ["Inclui as 9 facturas reais já classificadas.", "Ataca o trabalho administrativo mais repetitivo.", "Não cobre comissões nem folha de obra oficina."],
    fit: "Compra equilibrada se a administração pedir ROI rápido antes da operação completa.",
  },
  {
    name: "Recomendado",
    eyebrow: "Correr",
    modules: "Sprint 0 + A + B + C + E + F",
    amount: "€ 45.000",
    note: "Preço fechado da proposta actual; maximiza controlo transversal em 10 semanas.",
    bullets: ["Maior controlo transversal em 10 semanas.", "Inclui bolsa, comissões e oficina.", "Evita reabrir negociação módulo a módulo."],
    fit: "Compra recomendada porque responde ao mapa completo levantado com Clarice e Éder.",
  },
];

const PHASE_ROI = [
  {
    label: "Gatinhar",
    option: "Sprint 0 + A + C",
    implementation: "€ 14.000",
    year1: 24800,
    year2: 35600,
    year3: 46400,
    threshold: "€ 1.289/mês",
    note: "Paga-se se km + documentos libertarem ou protegerem €15.467/ano.",
  },
  {
    label: "Andar",
    option: "Sprint 0 + A + B + C",
    implementation: "€ 25.500",
    year1: 36300,
    year2: 47100,
    year3: 57900,
    threshold: "€ 1.608/mês",
    note: "Paga-se se o núcleo administrativo provar €19.300/ano.",
  },
  {
    label: "Correr",
    option: "Sprint 0 + A + B + C + E + F",
    implementation: "€ 45.000",
    year1: 55800,
    year2: 66600,
    year3: 77400,
    threshold: "€ 2.150/mês",
    note: "Paga-se se os cinco módulos provarem €25.800/ano.",
  },
];

const TIERS = [
  {
    name: "Lloretrans 5+1",
    eyebrow: "Pacote recomendado · preço fechado",
    tagline: "Cinco fluxos entregues em 10 semanas, com combustível em roadmap activo após validação Frotcom.",
    invest: "€ 45.000",
    monthly: "€ 900 / mês",
    includes: [
      "Sprint 0 incluída · 1 semana · €3.500 dentro do total",
      "Módulos A + B + C + E + F entregues em 10 semanas",
      "Pagamento 30 / 40 / 30",
      "Expert PHC Advanced interno como parceiro técnico",
      "Preço fechado · sem variação · IVA não incluído",
    ],
    featured: true,
  },
  {
    name: "Módulo D",
    eyebrow: "Combustível · roadmap activo",
    tagline: "Fica fechado como opção adicional, mas só entra quando a Frotcom confirmar acesso técnico.",
    invest: "+€ 7.500",
    monthly: "Sem cobrança hoje",
    includes: [
      "Cruzamento Cepsa / Repsol / Radius / bomba interna",
      "Litros / 100 km por viatura quando houver leitura Frotcom",
      "Anomalias sinalizadas, nunca bloqueadas automaticamente",
      "Validação técnica feita durante a Sprint 0",
      "Adição contratual posterior · sem custo no pacote inicial",
    ],
  },
  {
    name: "Safety valve",
    eyebrow: "Protecção de risco · Sprint 0",
    tagline: "Se aparecer bloqueio técnico crítico, o contrato pára com custo limitado à semana de validação.",
    invest: "€ 3.500",
    monthly: "Não aplicável",
    includes: [
      "Workshop com expert PHC Advanced interno",
      "Confirmação Frotcom + Logue Trans",
      "Medição de volume documental real",
      "Parecer técnico escrito",
      "Se houver bloqueio crítico, só a Sprint 0 é paga",
    ],
  },
];

const TIMELINE = [
  { week: "1", phase: "Sprint 0", tasks: "Expert PHC Advanced interno · validação Frotcom/Logue Trans · plano fechado", color: "bg-[hsl(220_9%_45%)]" },
  { week: "2–3", phase: "Módulo A · Validação km", tasks: "Reconciliação Logue Trans × Frotcom · dashboard · primeira demo interna", color: "bg-[hsl(222_72%_38%)]" },
  { week: "3–5", phase: "Módulo C · Docs", tasks: "Hub centralizado · associação automática · permissões cross-empresa", color: "bg-[hsl(222_72%_38%)]" },
  { week: "4–7", phase: "Módulo B · OCR", tasks: "Extracção PDF · classificação por NIF · regras por fornecedor", color: "bg-[hsl(222_72%_38%)]" },
  { week: "6–8", phase: "Módulo E · Bolsa", tasks: "Webapp completa · comissões · export Excel · validação Clarice", color: "bg-[hsl(32_82%_50%)]" },
  { week: "8–10", phase: "Módulo F · Oficina", tasks: "Webapp mobile · piloto com 1 mecânico · refinamento · alargar", color: "bg-[hsl(0_72%_50%)]" },
  { week: "10+", phase: "Módulo D · Roadmap", tasks: "Adição quando a Frotcom confirmar API de leitura", color: "bg-[hsl(32_82%_50%)]" },
];

const DEPENDENCIES = [
  {
    label: "API Logue Trans",
    owner: "Hélio · Lloretrans",
    bloqueia: "MVP A e C em modo live",
    mitigacao: "Stubs activos até API chegar · reunião técnica 45 min nas primeiras 72h",
  },
  {
    label: "Expert PHC Advanced interno",
    owner: "Departamento interno do grupo",
    bloqueia: "Escrita automática em MVP B, E, F",
    mitigacao: "Demo opera com export XML enquanto o formato de escrita não fica validado internamente",
  },
  {
    label: "API Frotcom de leitura",
    owner: "Administração grupo",
    bloqueia: "Precisão do MVP D",
    mitigacao: "Enquanto não houver leitura live, o MVP D sinaliza com abastecimentos reais + odómetro disponível",
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
  { n: "5+1", label: "Fluxos · 5 entregues, 1 roadmap" },
  { n: "9", label: "Facturas reais já processadas" },
  { n: "60+", label: "Viaturas por operador suportadas" },
  { n: "UE", label: "Dados em repouso na UE" },
];

const ROI_HURDLES = [
  { label: "Custo ano 1", value: "€ 55.800", detail: "€45.000 implementação + 12 meses × €900" },
  { label: "Payback 36 meses", value: "€ 25.800/ano", detail: "valor mínimo a provar · €2.150/mês" },
  { label: "Payback 24 meses", value: "€ 33.300/ano", detail: "valor mínimo a provar · €2.775/mês" },
];

const ROI_MODULES = [
  {
    code: "A",
    title: "Validação km",
    evidence: "160 viagens no cenário de demonstração · 126 verdes · 23 amarelas · 11 vermelhas · threshold 3 km",
    calculation: "Se a baseline confirmar 3 h/dia de validação manual: 3 h × 220 dias = 660 h/ano libertadas para excepções.",
    control: "34 excepções deixam de ficar escondidas em Excel: ficam separadas por estado, utilizador e decisão.",
  },
  {
    code: "B",
    title: "OCR facturas",
    evidence: "9 facturas reais · 9 fornecedores · €6.097,70 brutos · 29 linhas · confiança média 92,4%",
    calculation: "Fórmula: facturas/mês × minutos evitados por factura × custo carregado/hora ÷ 60.",
    control: "Cada correcção cria regra por fornecedor; classificação deixa de depender da pessoa que conhece o layout.",
  },
  {
    code: "C",
    title: "Documentos",
    evidence: "4 amostras reais: CMR, guia recepção, guia transporte e ticket frio · permissões por empresa já modeladas",
    calculation: "Fórmula: documentos/mês × segundos evitados por documento + custo de documentos órfãos/duplicados.",
    control: "Rastreabilidade por CMR, matrícula, data, hash de origem e empresa autorizada.",
  },
  {
    code: "D",
    title: "Combustível",
    evidence: "2.161 abastecimentos reais · 413.831,51 L · €586.948,08 em 3 meses · 183 matrículas",
    calculation: "Se 0,5% do custo anualizado for fuga/erro evitável: €2,35M × 0,5% = ~€11.739/ano; D paga-se em ~7,7 meses quando entrar.",
    control: "Não é cobrado hoje. Sem Frotcom confirmado, D é sinalização e evidência, não decisão automática.",
  },
  {
    code: "E",
    title: "Bolsa + comissões",
    evidence: "306 cargas reais · 41 clientes · 26 transportadores · 86 rotas · 263 facturas cliente · 153 facturas fornecedor",
    calculation: "O Excel carregado mostra margem global -€1.800. Se o padrão se repetir em 1.000 cargas/ano, o risco escala para ~€5.882/ano.",
    control: "Margem negativa, R/NR, factura tardia e comissão calculada à mão passam a fila auditada.",
  },
  {
    code: "F",
    title: "Oficina",
    evidence: "24 folhas seedadas em frota real · checklist de 17 itens · 90 min activos por ordem · assinatura digital",
    calculation: "Fórmula: folhas/mês × minutos de relançamento evitados + correcção de tempos activos/pausas.",
    control: "Papel passa a audit log: quem abriu, pausou, fechou, assinou, validou e exportou para PHC Advanced.",
  },
];

export default async function PropostaPage() {
  await requireSession();

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
          <PrintPageAction />
          <Link
            href="mailto:bilal.machraa@aitipro.com?subject=Proposta%20Lloretrans%20·%20feedback"
            className="inline-flex min-h-11 items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
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
        <h1 className="font-display text-5xl lg:text-6xl font-semibold leading-[0.98] tracking-normal max-w-[900px]">
          Plataforma operacional{" "}
          <span className="italic text-[hsl(222_72%_30%)]">Lloretrans</span>.
          <br />
          Demo primeiro. <span className="italic">Decisão por fases.</span>
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
          <div className="text-[11px] tracking-[0.2em] uppercase text-[hsl(32_82%_35%)] font-semibold mb-4">
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
                Propomos uma <strong>plataforma integrada</strong> que cobre cinco fluxos no contrato
                recomendado e deixa o sexto em roadmap activo. Mas a decisão não precisa de ser um
                bloco indivisível: a administração pode <strong>gatinhar, andar ou correr</strong>,
                mantendo os mesmos preços unitários e a mesma lógica de controlo.
              </p>
              <p>
                <strong>O estado actual é uma demonstração a funcionar</strong> em
                <code className="font-mono text-[13px] bg-secondary px-1.5 py-0.5 rounded mx-1">
                  lloretrans.aitipro.com
                </code>
                com dados sintéticos deterministas e as <strong>9 facturas reais</strong> de fornecedores
                da Lloretrans já classificadas. A recomendação é ver a plataforma primeiro e discutir
                investimento depois, já com a equipa a perceber o que está a comprar.
              </p>
            </div>
            <div className="lg:col-span-4 space-y-3 border-l-2 border-[hsl(222_72%_30%)]/15 pl-6 lg:pl-8">
              <SummaryLine label="Opções de entrada" value="€ 14k / € 25,5k / € 45k" hint="gatinhar · andar · correr" />
              <SummaryLine label="Recomendado" value="€ 45.000" hint="Sprint 0 + A + B + C + E + F" />
              <SummaryLine label="Mensalidade fixa" value="€ 900 / mês" hint="hosting, suporte, IA e 8h técnicas" />
              <SummaryLine label="Timeline" value="10 semanas" hint="D combustível fica roadmap +€7.500" />
            </div>
          </div>
          <div className="mt-8 flex flex-wrap items-center gap-3 pt-6 border-t border-[hsl(220_14%_90%)]">
            <Button asChild size="lg" className="shadow-elevated-sm">
              <Link href="https://lloretrans.aitipro.com" target="_blank" rel="noopener">
                Abrir a demo
              </Link>
            </Button>
            <Button asChild size="lg" variant="outline">
              <Link href="mailto:bilal.machraa@aitipro.com?subject=Marcar%20demo%20Lloretrans%20%2B%20proposta">
                Marcar demo com proposta
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

      {/* ROI */}
      <Section
        id="retorno"
        eyebrow="Retorno para administração"
        title="ROI sem números inventados: meta clara, dados reais, baseline na Sprint 0."
        intro="A proposta não promete uma poupança artificial. Mostra o limiar que tem de provar, os dados reais já carregados e o controlo novo que cada MVP traz."
      >
        <div className="grid gap-4 md:grid-cols-3">
          {ROI_HURDLES.map((hurdle) => (
            <div key={hurdle.label} className="rounded-xl border border-[hsl(220_14%_88%)] bg-white p-6">
              <div className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">
                {hurdle.label}
              </div>
              <div className="font-display text-3xl font-semibold mt-2 text-[hsl(222_72%_22%)]">
                {hurdle.value}
              </div>
              <div className="text-xs text-foreground/65 leading-relaxed mt-2">{hurdle.detail}</div>
            </div>
          ))}
        </div>

        <div className="mt-6 rounded-xl border border-[hsl(222_72%_30%)]/20 bg-[hsl(222_72%_30%)] text-white p-6 lg:p-7">
          <div className="grid gap-5 lg:grid-cols-[1.1fr_1.9fr] lg:items-center">
            <div>
              <div className="text-[10px] uppercase tracking-[0.18em] font-semibold text-[hsl(32_82%_65%)]">
                Fórmula executiva
              </div>
              <div className="font-display text-2xl font-semibold mt-2">
                O pacote tem de provar €2.150/mês para payback a 36 meses.
              </div>
            </div>
            <p className="text-sm leading-relaxed text-white/78">
              A medição correcta junta três fontes: tempo administrativo libertado, erros e retrabalho evitados, e controlo financeiro recuperado. A Sprint 0 transforma as premissas em baseline: horas actuais por fluxo, volume mensal real, custo carregado/hora e risco financeiro por excepção.
            </p>
          </div>
        </div>

        <div className="mt-8 rounded-xl border border-[hsl(220_14%_88%)] bg-white p-6 lg:p-7">
          <div className="flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
            <div>
              <div className="text-[10px] uppercase tracking-[0.18em] font-semibold text-[hsl(32_82%_35%)]">
                36 meses · leitura para administração
              </div>
              <h3 className="font-display text-2xl font-semibold mt-1">
                Custo acumulado por fase e limiar de payback.
              </h3>
            </div>
            <p className="max-w-md text-xs leading-relaxed text-muted-foreground md:text-right">
              Cálculo comparável: implementação + 36 meses de mensalidade a €900/mês. A Sprint 0 valida a poupança real antes de transformar estes limiares em ROI contratual.
            </p>
          </div>
          <div className="mt-6 space-y-4">
            {PHASE_ROI.map((phase) => (
              <div key={phase.label} className="rounded-lg border border-[hsl(220_14%_90%)] bg-[hsl(40_30%_98%)] p-4">
                <div className="grid gap-4 lg:grid-cols-[180px_1fr_180px] lg:items-center">
                  <div>
                    <div className="font-display text-lg font-semibold">{phase.label}</div>
                    <div className="mt-1 font-mono text-[11px] text-[hsl(222_72%_30%)]">{phase.option}</div>
                    <div className="mt-2 text-xs text-muted-foreground">Implementação: {phase.implementation}</div>
                  </div>
                  <div className="space-y-2">
                    {[
                      ["Ano 1", phase.year1],
                      ["Ano 2", phase.year2],
                      ["Ano 3", phase.year3],
                    ].map(([year, value]) => (
                      <div key={`${phase.label}-${year}`} className="grid grid-cols-[54px_1fr_90px] items-center gap-3">
                        <div className="text-[11px] font-semibold text-muted-foreground">{year}</div>
                        <div className="h-3 rounded-full bg-[hsl(220_14%_90%)] overflow-hidden">
                          <div
                            className="h-full rounded-full bg-[hsl(152_55%_42%)]"
                            style={{ width: `${Math.max(12, Math.round((Number(value) / 77400) * 100))}%` }}
                          />
                        </div>
                        <div className="text-right font-mono text-xs font-semibold">
                          € {Number(value).toLocaleString("pt-PT")}
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="rounded-lg bg-white border border-[hsl(220_14%_88%)] p-4">
                    <div className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">
                      Payback 36 meses
                    </div>
                    <div className="font-display text-2xl font-semibold mt-1 text-[hsl(222_72%_22%)]">
                      {phase.threshold}
                    </div>
                    <div className="mt-2 text-[11px] leading-relaxed text-muted-foreground">{phase.note}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-8 rounded-xl border border-[hsl(220_14%_88%)] bg-white overflow-x-auto">
          <table className="min-w-[980px] w-full text-sm">
            <thead className="bg-[hsl(40_30%_96%)]">
              <tr>
                <th className="text-left px-5 py-3 text-[11px] uppercase tracking-wider text-muted-foreground font-semibold">MVP</th>
                <th className="text-left px-5 py-3 text-[11px] uppercase tracking-wider text-muted-foreground font-semibold">Dados reais carregados</th>
                <th className="text-left px-5 py-3 text-[11px] uppercase tracking-wider text-muted-foreground font-semibold">Cálculo defensável</th>
                <th className="text-left px-5 py-3 text-[11px] uppercase tracking-wider text-muted-foreground font-semibold">Controlo ganho</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[hsl(220_14%_92%)]">
              {ROI_MODULES.map((item) => (
                <tr key={item.code}>
                  <td className="px-5 py-4 align-top">
                    <div className="font-mono text-[11px] font-semibold text-[hsl(222_72%_30%)]">Módulo {item.code}</div>
                    <div className="font-semibold mt-1">{item.title}</div>
                  </td>
                  <td className="px-5 py-4 align-top text-foreground/78 leading-relaxed">{item.evidence}</td>
                  <td className="px-5 py-4 align-top text-foreground/78 leading-relaxed">{item.calculation}</td>
                  <td className="px-5 py-4 align-top text-foreground/70 leading-relaxed">{item.control}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <p className="mt-5 text-xs text-muted-foreground leading-relaxed">
          Nota para o conselho: estes valores são potencial de controlo, não garantia contabilística. O compromisso da Sprint 0 é medir as baselines com a equipa da Lloretrans antes de transformar cenários em ROI contratual.
        </p>
      </Section>

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
              Esta proposta formaliza o âmbito, o investimento e o calendário. O site, o email e o
              PDF passam a dizer a mesma coisa: demo funcional primeiro, decisão por fases depois,
              pacote recomendado de €45.000 quando a administração quiser a resposta completa, e
              módulo D apenas quando a Frotcom estiver confirmada.
            </p>
          </div>
          <div className="lg:col-span-5">
            <div className="rounded-xl bg-[hsl(40_30%_96%)] border border-[hsl(220_14%_88%)] p-8">
              <div className="text-[hsl(32_82%_35%)] text-5xl font-display leading-none mb-3 select-none">
                &ldquo;
              </div>
              <p className="font-display text-2xl leading-snug tracking-normal">
                Não é só tempo. A nossa preocupação também é o{" "}
                <span className="italic text-[hsl(222_72%_30%)]">controlo</span>.
              </p>
              <p className="font-display text-lg leading-snug tracking-normal mt-3 text-foreground/70">
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
                      <div>
                        <span className="text-muted-foreground">Valor:</span>{" "}
                        <span className="font-mono font-semibold">{m.invest}</span>
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
                        className="inline-flex min-h-11 items-center gap-1 text-sm font-medium text-[hsl(222_72%_30%)] hover:underline"
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
        title="Três formas de comprar. Uma recomendação."
        intro="A proposta deixa de parecer uma decisão indivisível. O conselho pode começar pequeno, avançar pelo núcleo administrativo ou aprovar o pacote completo. A recomendação continua a ser Lloretrans 5+1 porque é a única opção que cobre o mapa completo da reunião."
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
                  tier.featured ? "text-[hsl(32_82%_65%)]" : "text-[hsl(32_82%_35%)]"
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
          A mensalidade inclui operação contínua: alojamento em Neon UE Frankfurt · deploy Vercel fra1 · audit log append-only ·
          export XML PHC Advanced · suporte business-hours · 8h técnicas/mês · IA até 5.000 documentos/mês.
        </div>
        <div className="mt-10 rounded-xl border border-[hsl(220_14%_88%)] bg-white p-6 lg:p-7">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between border-b border-[hsl(220_14%_88%)] pb-5">
            <div>
              <div className="text-[10px] uppercase tracking-[0.18em] font-semibold text-[hsl(32_82%_35%)]">
                Composição do investimento
              </div>
              <h3 className="font-display text-2xl font-semibold mt-1">€ 45.000 sem variação</h3>
            </div>
            <div className="text-xs text-muted-foreground">
              Módulo D combustível: roadmap separado · +€ 7.500 · sem cobrança hoje
            </div>
          </div>
          <div className="mt-5 divide-y divide-[hsl(220_14%_90%)]">
            {INVESTMENT_BREAKDOWN.map((item) => (
              <div key={item.label} className="grid gap-2 py-3 sm:grid-cols-[120px_1fr_auto] sm:items-center">
                <div className="font-mono text-xs font-semibold text-[hsl(222_72%_30%)]">{item.label}</div>
                <div className="text-sm text-foreground/75">{item.detail}</div>
                <div className="font-mono text-sm font-semibold tabular">{item.amount}</div>
              </div>
            ))}
          </div>
          <div className="mt-5 flex items-center justify-between rounded-lg bg-[hsl(222_72%_30%)] px-4 py-3 text-white">
            <span className="text-sm font-semibold">Total implementação</span>
            <span className="font-display text-xl font-semibold">€ 45.000</span>
          </div>
        </div>
        <div className="mt-6 rounded-xl border border-[hsl(220_14%_88%)] bg-[hsl(40_30%_96%)] p-6 lg:p-7">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <div className="text-[10px] uppercase tracking-[0.18em] font-semibold text-[hsl(32_82%_35%)]">
                Gatinhar · andar · correr
              </div>
              <h3 className="font-display text-2xl font-semibold mt-1">O faseamento é parte da proposta.</h3>
            </div>
            <div className="text-xs text-muted-foreground max-w-sm sm:text-right">
              Isto resolve a objecção de credibilidade: podem validar quick wins antes de financiar o módulo seguinte.
            </div>
          </div>
          <div className="mt-7 grid gap-4 lg:grid-cols-3">
            {PHASED_OPTIONS.map((option) => (
              <div
                key={option.name}
                className={`relative flex min-h-[360px] flex-col rounded-2xl border p-6 ${
                  option.name === "Recomendado"
                    ? "border-[hsl(152_55%_45%)] bg-[linear-gradient(180deg,hsl(152_55%_96%),white)] shadow-elevated-lg lg:-translate-y-1"
                    : "border-[hsl(220_14%_88%)] bg-white shadow-elevated-sm"
                }`}
              >
                <Badge
                  className={`absolute -top-3 left-5 border-0 ${
                    option.name === "Recomendado"
                      ? "bg-[hsl(152_55%_45%)] text-[hsl(222_72%_12%)]"
                      : "bg-[hsl(220_14%_92%)] text-muted-foreground"
                  }`}
                >
                  {option.name === "Recomendado" ? "Recomendado" : option.name === "Entrada mínima defensável" ? "Opção 1" : "Opção 2"}
                </Badge>
                <div className="text-[10px] uppercase tracking-[0.16em] text-[hsl(32_82%_35%)] font-semibold mt-2">{option.eyebrow}</div>
                <div className="font-display text-xl font-semibold leading-tight mt-2">{option.name}</div>
                <div className="font-mono text-xs text-[hsl(222_72%_30%)] mt-3">{option.modules}</div>
                <div className="font-display text-3xl font-semibold mt-4">{option.amount}</div>
                <p className="text-xs text-foreground/70 leading-relaxed mt-3">{option.note}</p>
                <ul className="mt-4 space-y-2 border-t border-[hsl(220_14%_92%)] pt-4 text-xs text-foreground/68">
                  {option.bullets.map((bullet) => (
                    <li key={bullet} className="flex gap-2">
                      <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-[hsl(152_55%_42%)]" />
                      <span>{bullet}</span>
                    </li>
                  ))}
                </ul>
                <div className="mt-auto border-t border-dashed border-[hsl(220_14%_86%)] pt-4 text-[11px] leading-relaxed text-muted-foreground">
                  <strong className="text-foreground/75">{option.name === "Recomendado" ? "Recomendação:" : "Usar só se:"}</strong>{" "}
                  {option.fit}
                </div>
              </div>
            ))}
          </div>
          <p className="mt-4 text-xs text-muted-foreground leading-relaxed">
            Compra à la carte é possível pelos valores unitários acima, mas não é a recomendação: B, E e F dependem de validação PHC Advanced; D fica sempre fora do preço inicial até a Frotcom confirmar acesso técnico.
          </p>
        </div>
      </Section>

      {/* TIMELINE */}
      <Section
        id="timeline"
        eyebrow="Timeline"
        title="10 semanas até estar a operar."
        intro="Sequenciado por dependência, não por ordem alfabética. A arranca cedo porque é quick-win; C prepara B e F; E e F fecham o pacote. D fica fora do preço inicial até a Frotcom confirmar acesso técnico."
      >
        <div
          className="rounded-xl border border-[hsl(220_14%_88%)] bg-white p-6 lg:p-8 overflow-x-auto"
          tabIndex={0}
          aria-label="Timeline de implementação, com deslocação horizontal em ecrãs estreitos"
        >
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
            <span className="h-2 w-2 rounded-full bg-[hsl(222_72%_38%)]" /> Módulos incluídos
          </span>
          <span className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-[hsl(32_82%_50%)]" /> Bolsa + roadmap combustível
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
        title="O que precisamos da vossa equipa para avançar."
        intro="Sem estas peças, a proposta perde precisão e podem aparecer surpresas a meio do projecto. Listadas por criticidade, com mitigação em cada uma."
      >
        <div className="rounded-xl border border-[hsl(220_14%_88%)] bg-white overflow-x-auto">
          <table className="min-w-[760px] w-full text-sm">
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
            title="PHC Advanced — confirmado 20/04/2026"
            body="Éder confirmou: é PHC Advanced (não CS nem GO). A PREVROD, que aparece com «PHC GO», é um fornecedor externo com software Cegid próprio — não o PHC Advanced da Lloretrans. Falta validar com o expert PHC Advanced interno do grupo os módulos licenciados (MFrota?) e o formato de escrita para desenhar a integração sem custo externo."
            responsavel="Éder · expert PHC Advanced interno"
            prazo="Antes do piloto"
          />
          <OpenQuestion
            tag="G8"
            severity="Risco de adopção"
            title="Plano de onboarding do mecânico (MVP F)"
            body="A Clarice levantou a objecção: «mecânicos com 50 anos, vai dar computador, não é com ninguém, papel». Plano proposto: 1 dia de treino presencial com 1 mecânico piloto, 2 semanas de acompanhamento no terreno, fallback em papel + OCR a ligar automaticamente à folha. Adopção é KPI formal do piloto F, medida durante o arranque e após o primeiro mês de utilização."
            responsavel="Responsável oficina + Bilal"
            prazo="Semanas 8-10 · piloto F"
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
            body="Neon Postgres + Vercel deploy fra1 para dados operacionais. Claude/Anthropic só entra com DPA aprovado ou fica desligado por fluxo. Retenção configurável por tipo de documento."
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
            body="Assinamos NDA antes de qualquer dado real entrar na plataforma. DPA formal incluído no pacote Lloretrans 5+1."
          />
        </div>
      </Section>

      {/* PRÓXIMOS PASSOS */}
      <Section id="proximos-passos" eyebrow="Próximos passos" title="Da demonstração à decisão de investimento.">
        <ol className="space-y-4">
          <StepItem
            n="1"
            title="Marcar demonstração com a Clarice"
            body="Objectivo: mostrar a plataforma a funcionar antes de discutir preço. A Clarice valida se os fluxos reflectem a operação real e se há algo crítico a corrigir antes do conselho."
            when="4 ou 5 de Maio à tarde"
          />
          <StepItem
            n="2"
            title="Deixar proposta + acesso à demo"
            body="Depois da demonstração, enviamos o link vivo e a proposta. A conversa passa a ser: que fase aprovar primeiro, que números validar na Sprint 0 e quem tem de estar na decisão."
            when="Após a demo"
          />
          <StepItem
            n="3"
            title="Escolha da fase"
            body="Gatinhar (€14.000), andar (€25.500) ou correr (€45.000). A recomendação é o pacote completo, mas a proposta já permite uma decisão menor se houver competição interna por orçamento."
            when="Antes do conselho"
          />
          <StepItem
            n="4"
            title="Sprint 0 valida os números"
            body="Mede horas actuais, volume mensal, dados PHC Advanced/Frotcom/Logue Trans e risco por excepção. Só depois se transforma potencial de ROI em compromisso contratual."
            when="Semana 1"
          />
        </ol>
        <div className="mt-10 rounded-xl bg-gradient-to-br from-[hsl(222_72%_30%)] via-[hsl(222_72%_20%)] to-[hsl(222_72%_14%)] text-white p-8 lg:p-10 relative overflow-hidden">
          <div
            className="absolute inset-0 opacity-[0.08] pointer-events-none"
            style={{ backgroundImage: "radial-gradient(white 1px, transparent 1px)", backgroundSize: "20px 20px" }}
          />
          <div className="relative z-10 grid lg:grid-cols-12 gap-6 items-center">
            <div className="lg:col-span-8">
              <h3 className="font-display text-3xl lg:text-4xl font-semibold leading-tight tracking-normal">
                Próximo movimento: ver a plataforma com a Clarice.
              </h3>
              <p className="mt-4 text-white/75 leading-relaxed max-w-2xl">
                O melhor uso desta proposta é em simultâneo com a demo. Primeiro validam que a solução corresponde à operação; depois escolhem a fase que faz sentido defender junto da administração.
              </p>
            </div>
            <div className="lg:col-span-4 flex flex-col gap-3 lg:items-end">
              <Button asChild size="lg" className="bg-white text-[hsl(222_72%_22%)] hover:bg-white/90 border-0 shadow-elevated w-full lg:w-auto">
                <Link href="mailto:bilal.machraa@aitipro.com?subject=Marcar%20demo%20Lloretrans&body=Olá%20Bilal%2C%0A%0APodemos%20marcar%20uma%20demonstração%20da%20plataforma%20Lloretrans%20para%20validar%20os%20fluxos%20antes%20da%20decisão%20de%20investimento.%0A%0ADisponibilidade%3A%0A-%20Segunda%2C%204%20de%20Maio%2C%20à%20tarde%0A-%20Terça%2C%205%20de%20Maio%2C%20à%20tarde%0A%0AObrigada.">
                  <Presentation className="h-4 w-4" />
                  Marcar demo
                </Link>
              </Button>
              <Button asChild size="lg" variant="outline" className="border-white/30 bg-transparent text-white hover:bg-white/10 w-full lg:w-auto">
                <Link href="https://lloretrans.aitipro.com" target="_blank" rel="noopener">
                  Abrir plataforma
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
                  <Link href="mailto:bilal.machraa@aitipro.com" className="inline-flex min-h-11 items-center text-[hsl(222_72%_30%)] hover:underline">
                    bilal.machraa@aitipro.com
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
                  Demo privada: <Link href="https://lloretrans.aitipro.com" className="inline-flex min-h-11 items-center hover:underline" target="_blank" rel="noopener">lloretrans.aitipro.com</Link>
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
            <Link href="https://lloretrans.aitipro.com" className="inline-flex min-h-11 items-center hover:text-foreground transition-colors">
              Demo ao vivo
            </Link>
            <Link href="mailto:bilal.machraa@aitipro.com" className="inline-flex min-h-11 items-center hover:text-foreground transition-colors">
              bilal.machraa@aitipro.com
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
        <div className="text-[11px] tracking-[0.2em] uppercase text-[hsl(32_82%_35%)] font-semibold mb-3">
          {eyebrow}
        </div>
        <h2 className="font-display text-4xl lg:text-[44px] font-semibold leading-tight tracking-normal">
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
          <h3 className="font-display text-xl font-semibold tracking-normal">{title}</h3>
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
