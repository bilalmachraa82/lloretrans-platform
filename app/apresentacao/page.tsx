import Image from "next/image";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  ArrowRight,
  CheckCircle2,
  CircleAlert,
  ClipboardCheck,
  ClipboardList,
  FileStack,
  Fuel,
  PackageSearch,
  ReceiptText,
  ShieldCheck,
  TimerReset,
  TruckIcon,
  Wrench,
} from "lucide-react";

export const metadata = {
  title: "Lloretrans | Apresentação executiva da plataforma",
  description:
    "Apresentação executiva da plataforma operacional Lloretrans.",
  robots: { index: false, follow: false },
};

const PROOF = [
  { value: "6", label: "fluxos operacionais", note: "Quilómetros, OCR, documentos, combustível, bolsa e oficina" },
  { value: "306", label: "cargas reais", note: "Convertidas do Excel histórico para fluxo auditável" },
  { value: "2 161", label: "abastecimentos", note: "Cruzados por matrícula e fornecedor na plataforma" },
  { value: "60", label: "viaturas", note: "Volume operacional alvo da plataforma" },
];

const PRODUCT_SHOTS = [
  {
    src: "/product-shots/dashboard-crop.png",
    title: "Painel operacional",
    body: "Visão consolidada dos módulos, indicadores críticos e trabalho pendente.",
  },
  {
    src: "/product-shots/ocr-crop.png",
    title: "Facturas fornecedor",
    body: "Classificação por NIF, confiança, estado de validação e preparação para PHC Advanced.",
  },
  {
    src: "/product-shots/bolsa-crop.png",
    title: "Bolsa de carga",
    body: "Cargas, margem, comissões, atrasos e filtros operacionais sobre dados importados.",
  },
];

const EXECUTIVE_MESSAGES = [
  {
    title: "Plataforma navegável.",
    body: "Os seis fluxos discutidos com a equipa Lloretrans estão construídos e percorríveis com dados reais.",
    icon: ShieldCheck,
  },
  {
    title: "Decisão humana preservada.",
    body: "A IA prepara, classifica e sinaliza. A aprovação em qualquer passo irreversível continua do lado da Lloretrans, com rasto auditável.",
    icon: ClipboardCheck,
  },
  {
    title: "Dependências assumidas de frente.",
    body: "PHC Advanced, Frotcom e adopção da oficina aparecem listados, com responsável e estado de confirmação técnica.",
    icon: CircleAlert,
  },
];

const MODULES = [
  {
    code: "A",
    title: "Validação de quilómetros",
    icon: TruckIcon,
    pain: "A administrativa cruza Logue Trans com Frotcom viagem a viagem e o erro segue para a facturação.",
    currentState: "Semáforo operacional, diferença de 3 km, histórico auditado e aprovação por excepção.",
    proof: "O dashboard destaca logo o dia em atenção e abre apenas as viagens que precisam de validação.",
    validate: "A margem de 3 km já foi indicada; falta só validar quem aprova excepções e como entram na facturação.",
    href: "/login?target=km",
  },
  {
    code: "B",
    title: "OCR de facturas fornecedor",
    icon: ReceiptText,
    pain: "O conhecimento de classificação está na pessoa e não no sistema; cada fornecedor tem o seu formato.",
    currentState: "Recepção do PDF, extracção, classificação por NIF, memória por fornecedor e preparação para PHC Advanced.",
    proof: "As facturas reais carregadas mostram extracção, confiança, estado de validação e serviço PHC Advanced proposto.",
    validate: "PDFs, códigos, matrículas e PHC Advanced foram indicados; fica pendente o contacto do integrador e a regra de escrita para PHC.",
    href: "/login?target=ocr",
  },
  {
    code: "C",
    title: "Digitalização central",
    icon: FileStack,
    pain: "CMR, guias e tickets vivem espalhados entre papel, WhatsApp e pesquisa manual.",
    currentState: "Hub documental único por viagem, matrícula, data, empresa e estado.",
    proof: "Cada documento tem responsável de pesquisa, digitalização e confirmação registado.",
    validate: "O volume de 4.000 documentos/mês foi indicado; falta só separar documentos de transporte de facturas fornecedor quando fecharmos o dimensionamento.",
    href: "/login?target=docs",
  },
  {
    code: "D",
    title: "Combustível",
    icon: Fuel,
    pain: "Os dados existem, mas estão separados por fornecedor e sem leitura consolidada por viatura.",
    currentState: "A plataforma cruza abastecimentos por matrícula e fornecedor e sinaliza anomalias com decisão humana.",
    proof: "Já estão carregadas 2161 linhas reais.",
    validate: "Exportações de combustível já foram indicadas; falta confirmar se Frotcom expõe leitura CANBus/odómetro por matrícula.",
    href: "/login?target=fuel",
  },
  {
    code: "E",
    title: "Bolsa de carga",
    icon: PackageSearch,
    pain: "O comercial trabalha sobre Excel longo, memória tardia e comissões calculadas no fim do mês.",
    currentState: "Fluxo auditado por estado, documentos ligados a cada carga e regra de comissão reflectida na plataforma.",
    proof: "O Excel real de 306 cargas já foi convertido para navegação operacional.",
    validate: "Regra base recebida: 20% do lucro + valor fixo por carga Lloretrans; confirmar apenas excepções e aprovação mensal.",
    href: "/login?target=bolsa",
  },
  {
    code: "F",
    title: "Folha de obra da oficina",
    icon: Wrench,
    pain: "O mecânico regista em papel e a administrativa relança tudo no PHC Advanced.",
    currentState: "Aplicação móvel com checklist, estados, assinatura e validação administrativa.",
    proof: "A folha de obra já pode ser mostrada em telemóvel como experiência real de uso.",
    validate: "Dispositivo confirmado: telemóvel. A semana técnica define o piloto com um mecânico e o ponto de integração PHC Advanced.",
    href: "/login?target=oficina",
  },
];

const DEPENDENCIES = [
  {
    title: "PHC Advanced",
    owner: "contacto do integrador",
    note: "A versão PHC Advanced está indicada. Falta a call técnica para confirmar conector, formato de escrita e calendário.",
  },
  {
    title: "Frotcom + Logue Trans",
    owner: "API de leitura",
    note: "O Éder indicou que pode pedir API Frotcom e que Logue Trans é possível. Falta documentação/acesso para testar campos reais.",
  },
  {
    title: "Combustível",
    owner: "leitura por viatura",
    note: "Os ficheiros existem; o orçamento final do módulo depende de confirmar CANBus/odómetro e o formato recorrente da bomba interna.",
  },
];

const CONFIRMED_DATA = [
  "Volume operacional indicado: 4.000 documentos/mês no fluxo de digitalização.",
  "Tolerância de quilómetros indicada: máximo 3 km.",
  "PHC em uso indicado: PHC Advanced.",
  "Dispositivo de oficina indicado: telemóvel.",
  "Regras de comissão recebidas: 20% do lucro + valores fixos por carga Lloretrans.",
  "Dados recebidos para protótipo: facturas, códigos de serviço, matrículas, combustível, bolsa e folha de obra.",
];

const CLOSING_QUESTIONS = [
  "Isto corresponde à expectativa operacional que querem levar à administração no dia 11?",
  "Que ponto técnico conseguimos fechar antes da administração: integrador PHC, APIs ou combustível?",
  "Se a plataforma fizer sentido, avançamos para o modelo de investimento por fases?",
];

const COUNCIL_REASONS = [
  {
    title: "Plataforma navegável",
    body: "Os seis fluxos correm hoje contra dados reais, com ecrãs navegáveis e estados operacionais visíveis.",
  },
  {
    title: "Primeira semana fechada",
    body: "Acessos, saneamento de dados, integração inicial e plano de piloto ficam fechados na primeira semana.",
  },
  {
    title: "Decisão humana preservada",
    body: "A IA prepara, classifica e sinaliza. A aprovação em passos irreversíveis fica do lado Lloretrans, com rasto auditável.",
  },
  {
    title: "Preparada para o grupo",
    body: "Arquitectura, permissões e segregação documental já desenhadas para mais empresas e mais equipas.",
  },
];

export default function ApresentacaoPage() {
  return (
    <main className="min-h-screen bg-[#f0f5f4] text-[#1e2d3d] [&_h1]:font-sans [&_h2]:font-sans [&_h3]:font-sans">
      <div
        className="pointer-events-none fixed inset-0 opacity-[0.03]"
        style={{
          backgroundImage: "radial-gradient(#2d3a4a 1px, transparent 1px)",
          backgroundSize: "22px 22px",
        }}
      />
      <div className="pointer-events-none fixed inset-x-0 top-0 h-[520px] bg-[radial-gradient(circle_at_top_left,rgba(42,229,160,0.08),transparent_42%),radial-gradient(circle_at_top_right,rgba(202,116,45,0.08),transparent_36%)]" />

      <header className="relative mx-auto flex max-w-[1320px] flex-col gap-4 px-6 py-8 sm:flex-row sm:items-center sm:justify-between lg:px-10">
        <Link
          href="/"
          className="flex min-h-11 w-full items-center gap-4 rounded-2xl border border-[#e2e8f0] bg-white px-4 py-3 shadow-elevated-sm sm:w-auto"
        >
          <Image
            src="/aitipro-logo-light.png"
            alt="AiTiPro"
            width={154}
            height={36}
            className="h-7 w-auto"
            priority
          />
          <div className="h-7 w-px bg-[#e2e8f0]" />
          <div className="block min-w-0">
            <div className="text-[9px] font-semibold uppercase tracking-[0.18em] text-[#ca742d] sm:text-[10px] sm:tracking-[0.22em]">
              Plataforma operacional
            </div>
            <div className="mt-1 text-[11px] text-[#6b7280] sm:text-xs">
              Lloretrans<span className="hidden sm:inline"> · plataforma operacional</span>
            </div>
          </div>
        </Link>
        <div className="flex w-full items-center gap-3 sm:w-auto">
          <Button
            asChild
            variant="outline"
            size="sm"
            className="flex-1 border-[#cbd5e1] bg-white text-[#1e2d3d] hover:border-[#1bc88a] hover:bg-white sm:flex-none"
          >
            <Link href="/login">Abrir plataforma</Link>
          </Button>
          <Button
            asChild
            size="sm"
            className="flex-1 border-0 bg-[#0d3b38] text-white shadow-none hover:bg-[#134f4b] sm:flex-none"
          >
            <Link href="mailto:bilal.machraa@aitipro.com?subject=Lloretrans%20%C2%B7%20proxima%20conversa">
              Marcar reunião
            </Link>
          </Button>
        </div>
      </header>

      <section className="relative mx-auto max-w-[1320px] px-6 pb-18 pt-10 lg:px-10 lg:pb-24 lg:pt-16">
        <div className="grid gap-12 lg:grid-cols-[1.2fr_0.8fr] lg:items-end">
          <div className="max-w-4xl">
            <Badge
              variant="outline"
              className="mb-6 border-[#ca742d]/20 bg-[#fef3e8] text-[11px] uppercase tracking-[0.2em] text-[#ca742d]"
            >
              Plataforma desenhada com a operação Lloretrans
            </Badge>
            <h1 className="text-4xl font-semibold leading-[0.98] tracking-tight sm:text-5xl lg:text-[4.6rem]">
              Plataforma operacional Lloretrans.
              <span className="block text-[#0d3b38]">Seis fluxos com dados reais.</span>
            </h1>
            <p className="mt-8 max-w-3xl text-lg leading-relaxed text-[#374151] lg:text-[1.15rem]">
              Seis fluxos da operação Lloretrans — quilómetros, facturas de fornecedor, documentos,
              combustível, bolsa de carga e oficina — funcionam hoje contra dados reais. Cada módulo
              mantém a aprovação humana no momento crítico e deixa rasto auditável de cada decisão.
            </p>
          </div>

          <aside className="border-l border-[#cbd5e1] pl-0 lg:pl-10">
            <div className="grid gap-5 rounded-[28px] border border-[#e2e8f0] bg-white p-7 shadow-elevated-lg">
              <div>
                <div className="text-[10px] font-semibold uppercase tracking-[0.24em] text-[#ca742d]">
                  Princípio operacional
                </div>
                <p className="mt-3 text-3xl font-semibold leading-tight tracking-tight">
                  A IA prepara. A pessoa decide. O sistema regista.
                </p>
              </div>
              <div className="grid gap-3 text-sm text-[#4b5563]">
                <p>
                  <strong className="text-[#1e2d3d]">Aprovação humana</strong> em todos os passos
                  irreversíveis.
                </p>
                <p>
                  <strong className="text-[#1e2d3d]">Registo de auditoria</strong> inviolável por utilizador,
                  antes/depois e motivo.
                </p>
                <p>
                  <strong className="text-[#1e2d3d]">Dados na UE</strong> — armazenamento e aplicação
                  na União Europeia.
                </p>
              </div>
            </div>
          </aside>
        </div>
      </section>

      <section className="relative mx-auto max-w-[1320px] px-6 pb-16 lg:px-10 lg:pb-22">
        <div className="grid gap-8 rounded-[28px] border border-[#d8e1df] bg-white p-5 shadow-elevated-lg lg:grid-cols-[1.1fr_0.9fr] lg:p-7">
          <div className="overflow-hidden rounded-[20px] border border-[#e2e8f0] bg-[#f8fffc]">
            <Image
              src={PRODUCT_SHOTS[0].src}
              alt={PRODUCT_SHOTS[0].title}
              width={1120}
              height={650}
              className="h-full min-h-[340px] w-full object-cover object-left-top"
              priority
            />
          </div>
          <div className="flex flex-col justify-between gap-6 p-2 lg:p-4">
            <div>
              <div className="text-[11px] font-semibold uppercase tracking-[0.22em] text-[#ca742d]">
                Plataforma em ecrã
              </div>
              <h2 className="mt-4 text-3xl font-semibold leading-tight tracking-tight lg:text-4xl">
                O produto já mostra dados, estados e decisões.
              </h2>
              <p className="mt-4 text-base leading-relaxed text-[#4b5563]">
                As capturas abaixo são do ambiente operacional Lloretrans: indicadores, facturas,
                cargas e validações navegáveis por perfil.
              </p>
            </div>
            <div className="grid gap-4">
              {PRODUCT_SHOTS.slice(1).map((shot) => (
                <article key={shot.title} className="grid gap-4 rounded-2xl border border-[#e2e8f0] bg-[#f8fffc] p-4 sm:grid-cols-[0.92fr_1.08fr]">
                  <div className="overflow-hidden rounded-xl border border-[#e2e8f0] bg-white">
                    <Image
                      src={shot.src}
                      alt={shot.title}
                      width={1120}
                      height={650}
                      className="h-32 w-full object-cover object-top"
                    />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold leading-tight">{shot.title}</h3>
                    <p className="mt-2 text-sm leading-relaxed text-[#4b5563]">{shot.body}</p>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="relative border-y border-[#e2e8f0] bg-[#2d3a4a] text-white">
        <div className="mx-auto grid max-w-[1320px] gap-10 px-6 py-16 lg:grid-cols-[0.92fr_1.08fr] lg:px-10 lg:py-20">
          <div>
            <div className="text-[11px] font-semibold uppercase tracking-[0.22em] text-[#2ae5a0]">
              Princípios da plataforma
            </div>
            <h2 className="mt-5 text-4xl font-semibold leading-tight tracking-tight lg:text-5xl">
              &ldquo;Não é só tempo. A nossa preocupação também é o controlo.&rdquo;
            </h2>
            <p className="mt-5 max-w-xl text-base leading-relaxed text-white/76">
              A plataforma foi desenhada para responder a essa frase. Menos papel, menos Excel
              paralelo, mais trilho de decisão e mais capacidade de ler a operação sem depender de memória
              individual.
            </p>
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            {EXECUTIVE_MESSAGES.map((message) => {
              const Icon = message.icon;
              return (
                <article
                  key={message.title}
                  className="flex h-full flex-col rounded-2xl border border-white/12 bg-white/8 p-6"
                >
                  <Icon className="h-6 w-6 text-[#2ae5a0]" />
                  <h3 className="mt-5 text-2xl font-semibold leading-snug tracking-tight">{message.title}</h3>
                  <p className="mt-3 text-sm leading-relaxed text-white/72">{message.body}</p>
                </article>
              );
            })}
          </div>
        </div>
      </section>

      <section className="relative mx-auto max-w-[1320px] px-6 py-16 lg:px-10 lg:py-22">
        <div className="grid gap-10 lg:grid-cols-[0.72fr_1.28fr] lg:items-end">
          <div>
            <div className="text-[11px] font-semibold uppercase tracking-[0.22em] text-[#ca742d]">
              Prova operacional
            </div>
            <h2 className="mt-4 text-4xl font-semibold leading-tight tracking-tight lg:text-5xl">
              Evidência operacional, não promessa.
            </h2>
            <p className="mt-5 max-w-lg text-base leading-relaxed text-[#4b5563]">
              A plataforma assenta em dados reais da operação Lloretrans: 306 cargas convertidas
              do Excel, 2 161 abastecimentos carregados e facturas reais usadas para calibrar a
              classificação por NIF e padrão de fornecedor.
            </p>
          </div>

          <div className="grid gap-4 md:grid-cols-4">
            {PROOF.map((item) => (
              <article
                key={item.label}
                className="rounded-[24px] border border-[#e2e8f0] bg-white px-6 py-7 shadow-elevated-sm"
              >
                <div className="font-mono text-4xl font-semibold text-[#0d3b38]">{item.value}</div>
                <div className="mt-3 text-[11px] font-semibold uppercase tracking-[0.18em] text-[#6b7280]">
                  {item.label}
                </div>
                <p className="mt-3 text-sm leading-relaxed text-[#4b5563]">{item.note}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="relative bg-white">
        <div className="mx-auto max-w-[1320px] px-6 py-16 lg:px-10 lg:py-22">
          <div className="grid gap-6 border-b border-[#e2e8f0] pb-8 lg:grid-cols-[0.92fr_1.08fr] lg:items-end">
            <div>
              <div className="text-[11px] font-semibold uppercase tracking-[0.22em] text-[#ca742d]">
                Os seis módulos
              </div>
              <h2 className="mt-4 text-4xl font-semibold leading-tight tracking-tight lg:text-5xl">
                Seis dores. Seis respostas. Operação coberta de ponta a ponta.
              </h2>
            </div>
            <p className="max-w-2xl text-base leading-relaxed text-[#4b5563]">
              Para cada módulo: a dor actual identificada na operação Lloretrans, o que já está
              construído na plataforma, e a evidência visível na plataforma.
            </p>
          </div>

          <div className="mt-8 space-y-4">
            {MODULES.map((module) => {
              const Icon = module.icon;
              return (
                <article
                  key={module.code}
                  className="grid gap-6 rounded-[28px] border border-[#e2e8f0] bg-[#f8fffc] px-6 py-7 shadow-elevated-sm lg:grid-cols-[0.18fr_0.28fr_0.28fr_0.26fr] lg:px-8"
                >
                  <div className="flex items-start gap-4">
                    <div className="grid h-12 w-12 shrink-0 place-items-center rounded-xl bg-[#1e2d3d] text-[#2ae5a0]">
                      <Icon className="h-5 w-5" />
                    </div>
                    <div>
                      <div className="font-mono text-[11px] uppercase tracking-[0.16em] text-[#6b7280]">
                        Módulo {module.code}
                      </div>
                      <h3 className="mt-2 text-2xl font-semibold leading-tight tracking-tight">{module.title}</h3>
                      <Link
                        href={module.href}
                        className="mt-4 inline-flex min-h-11 items-center text-sm font-medium text-[#0d3b38] hover:underline"
                      >
                        Ver na plataforma <ArrowRight className="ml-2 h-4 w-4" />
                      </Link>
                    </div>
                  </div>

                  <InfoBlock label="Dor actual" body={module.pain} />
                  <InfoBlock label="O que já está construído" body={module.currentState} />

                  <div className="grid gap-4">
                    <InfoBlock label="Evidência na plataforma" body={module.proof} compact />
                    <InfoBlock label="Ponto a confirmar" body={module.validate} compact emphasis />
                  </div>
                </article>
              );
            })}
          </div>
        </div>
      </section>

      <section className="relative border-y border-[#e2e8f0] bg-[#f0f5f4]">
        <div className="mx-auto max-w-[1320px] px-6 py-16 lg:px-10 lg:py-20">
          <div className="grid gap-10 lg:grid-cols-[0.78fr_1.22fr] lg:items-start">
            <div>
              <div className="text-[11px] font-semibold uppercase tracking-[0.22em] text-[#ca742d]">
                Dependências assumidas
              </div>
              <h2 className="mt-4 text-4xl font-semibold leading-tight tracking-tight">
                O que está claro hoje e o que precisa de confirmação.
              </h2>
              <p className="mt-5 max-w-xl text-base leading-relaxed text-[#4b5563]">
                Três pontos dependem de validação técnica externa à plataforma. Estão listados
                abaixo com responsável e estado, para que entrem na primeira semana de trabalho sem surpresas.
              </p>
            </div>

            <div className="grid gap-4 md:grid-cols-3">
              {DEPENDENCIES.map((dependency) => (
                <article
                  key={dependency.title}
                  className="rounded-2xl border border-[#e2e8f0] bg-white p-6 shadow-elevated-sm"
                >
                  <div className="flex items-center gap-3">
                    <CircleAlert className="h-5 w-5 text-[#ca742d]" />
                    <div className="text-2xl font-semibold tracking-tight">{dependency.title}</div>
                  </div>
                  <div className="mt-4 text-[10px] font-semibold uppercase tracking-[0.18em] text-[#6b7280]">
                    Responsável
                  </div>
                  <p className="mt-2 text-sm font-medium text-[#374151]">{dependency.owner}</p>
                  <p className="mt-4 text-sm leading-relaxed text-[#4b5563]">{dependency.note}</p>
                </article>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="relative bg-white">
        <div className="mx-auto max-w-[1320px] px-6 py-16 lg:px-10 lg:py-20">
          <div className="grid gap-10 lg:grid-cols-[0.78fr_1.22fr] lg:items-start">
            <div>
              <div className="text-[11px] font-semibold uppercase tracking-[0.22em] text-[#ca742d]">
                Fecho antes dos valores
              </div>
              <h2 className="mt-4 text-4xl font-semibold leading-tight tracking-tight">
                Não repetimos perguntas. Fechamos apenas o que falta para produção.
              </h2>
              <p className="mt-5 max-w-xl text-base leading-relaxed text-[#4b5563]">
                A reunião deve validar expectativa, não refazer descoberta. O chamado Sprint 0 não
                é um módulo novo: é a primeira semana técnica sem custo para confirmar integrações,
                volumes e plano de entrada em produção.
              </p>
            </div>

            <div className="grid gap-5">
              <article className="rounded-[28px] border border-[#e2e8f0] bg-[#f8fffc] p-7 shadow-elevated-sm">
                <div className="flex items-center gap-3">
                  <CheckCircle2 className="h-6 w-6 text-[#1bc88a]" />
                  <h3 className="text-2xl font-semibold tracking-tight">Já sabemos pelo Éder</h3>
                </div>
                <div className="mt-5 grid gap-3 md:grid-cols-2">
                  {CONFIRMED_DATA.map((item) => (
                    <div key={item} className="rounded-2xl border border-[#d8e1df] bg-white px-4 py-3 text-sm leading-relaxed text-[#374151]">
                      {item}
                    </div>
                  ))}
                </div>
              </article>

              <article className="rounded-[28px] border border-[#e2e8f0] bg-white p-7 shadow-elevated-sm">
                <div className="flex items-center gap-3">
                  <ClipboardList className="h-6 w-6 text-[#ca742d]" />
                  <h3 className="text-2xl font-semibold tracking-tight">Perguntas de fecho</h3>
                </div>
                <div className="mt-5 grid gap-3">
                  {CLOSING_QUESTIONS.map((question, index) => (
                    <div key={question} className="flex gap-4 rounded-2xl border border-[#e2e8f0] bg-[#f8fffc] px-4 py-4">
                      <div className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-[#1e2d3d] font-mono text-xs font-semibold text-[#2ae5a0]">
                        {index + 1}
                      </div>
                      <p className="text-sm leading-relaxed text-[#374151]">{question}</p>
                    </div>
                  ))}
                </div>
              </article>
            </div>
          </div>
        </div>
      </section>

      <section className="relative bg-[#0d3b38] text-white">
        <div className="mx-auto grid max-w-[1320px] gap-10 px-6 py-16 lg:grid-cols-[0.8fr_1.2fr] lg:px-10 lg:py-22">
          <div>
            <div className="text-[11px] font-semibold uppercase tracking-[0.22em] text-[#2ae5a0]">
              Infraestrutura
            </div>
            <h2 className="mt-4 text-4xl font-semibold leading-tight tracking-tight lg:text-5xl">
              Dados na UE. Auditoria inviolável. RGPD por defeito.
            </h2>
          </div>

          <ul className="grid gap-4 text-sm leading-relaxed text-white/82">
            <li>Base de dados em Frankfurt · servidor aplicacional na União Europeia.</li>
            <li>Registo de auditoria inviolável: utilizador, antes/depois, motivo, em cada mutação.</li>
            <li>Aprovação humana obrigatória em todos os passos irreversíveis.</li>
            <li>Ligações previstas para PHC Advanced, Logue Trans, Frotcom, Cepsa, Repsol e Radius.</li>
          </ul>
        </div>
      </section>

      <section className="relative mx-auto max-w-[1320px] px-6 py-16 lg:px-10 lg:py-22">
        <div className="grid gap-10 lg:grid-cols-[0.8fr_1.2fr] lg:items-end">
          <div>
            <div className="text-[11px] font-semibold uppercase tracking-[0.22em] text-[#ca742d]">
              O que distingue esta plataforma
            </div>
            <h2 className="mt-4 text-4xl font-semibold leading-tight tracking-tight lg:text-5xl">
              Construída para a operação real, não para slides.
            </h2>
          </div>
          <p className="max-w-2xl text-base leading-relaxed text-[#4b5563]">
            Produto navegável com dados reais, primeira semana com entregáveis fechados,
            decisão humana preservada, e arquitectura preparada para escalar dentro do grupo.
          </p>
        </div>

        <div className="mt-10 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {COUNCIL_REASONS.map((outcome) => (
            <article
              key={outcome.title}
              className="rounded-[24px] border border-[#e2e8f0] bg-white p-7 shadow-elevated-sm"
            >
              <CheckCircle2 className="h-6 w-6 text-[#1bc88a]" />
              <h3 className="mt-5 text-2xl font-semibold leading-snug tracking-tight">{outcome.title}</h3>
              <p className="mt-3 text-sm leading-relaxed text-[#4b5563]">{outcome.body}</p>
            </article>
          ))}
        </div>

        <div className="mt-10 rounded-[32px] border border-[#1e2d3d]/10 bg-[linear-gradient(135deg,#1e2d3d,#0d3b38)] px-8 py-9 text-white shadow-elevated-lg lg:px-10">
          <div className="grid gap-8 lg:grid-cols-[0.88fr_1.12fr] lg:items-end">
            <div>
              <div className="flex items-center gap-3 text-[11px] uppercase tracking-[0.22em] text-[#2ae5a0]">
                <TimerReset className="h-4 w-4" />
                Acesso à plataforma
              </div>
              <h2 className="mt-4 text-3xl font-semibold leading-tight tracking-tight lg:text-4xl">
                Abrir a plataforma e, se fizer sentido, passar aos valores.
              </h2>
            </div>
            <p className="text-sm leading-relaxed text-white/76">
              O acesso usa perfis operacionais. O perfil de Direcção Operacional dá visão
              consolidada das 60 viaturas, validação de quilómetros do dia e folhas de oficina
              pendentes. Depois da validação funcional, o modelo de investimento aparece separado
              em três passos para não misturar produto com preço.
            </p>
          </div>

          <div className="mt-8 flex flex-wrap items-center gap-3 border-t border-white/12 pt-6">
            <Button
              asChild
              size="lg"
              className="border-0 bg-white text-[#1e2d3d] shadow-none hover:bg-white/90"
            >
              <Link href="/login">Abrir a plataforma</Link>
            </Button>
            <Button
              asChild
              size="lg"
              variant="outline"
              className="border-white/30 bg-transparent text-white shadow-none hover:bg-white/10 hover:text-white"
            >
              <Link href="/proposta">Ver modelo de investimento</Link>
            </Button>
            <div className="ml-auto hidden rounded-xl bg-white px-4 py-3 lg:block">
              <Image src="/aitipro-logo-light.png" alt="AiTiPro" width={138} height={32} className="h-6 w-auto" />
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}

function InfoBlock({
  label,
  body,
  compact = false,
  emphasis = false,
}: {
  label: string;
  body: string;
  compact?: boolean;
  emphasis?: boolean;
}) {
  return (
    <div className={compact ? "" : "max-w-xl"}>
      <div
        className={`text-[10px] font-semibold uppercase tracking-[0.18em] ${
          emphasis ? "text-[#ca742d]" : "text-[#6b7280]"
        }`}
      >
        {label}
      </div>
      <p className={`mt-2 text-sm leading-relaxed ${emphasis ? "text-[#1e2d3d]" : "text-[#4b5563]"}`}>
        {body}
      </p>
    </div>
  );
}
