import Image from "next/image";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  ArrowRight,
  CheckCircle2,
  CircleAlert,
  ClipboardCheck,
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
    "Apresentação executiva sem preços para validar com a Clarice Santos a plataforma operacional Lloretrans antes da proposta comercial.",
  robots: { index: false, follow: false },
};

const PROOF = [
  { value: "6", label: "fluxos mapeados", note: "km, OCR, documentos, combustível, bolsa, oficina" },
  { value: "9", label: "facturas OCR", note: "9 facturas reais usadas para ensinar o classificador por fornecedor" },
  { value: "306", label: "cargas reais", note: "convertidas do Excel operacional" },
  { value: "2161", label: "abastecimentos", note: "dados reais carregados na demo" },
];

const EXECUTIVE_MESSAGES = [
  {
    title: "Não estamos a mostrar um conceito.",
    body: "A reunião deve partir de uma plataforma navegável, já alinhada com os fluxos discutidos com a Clarice e o Éder.",
    icon: ShieldCheck,
  },
  {
    title: "Não estamos a pedir fé cega.",
    body: "A decisão desta reunião é validar se a demonstração espelha a operação real antes de se falar de investimento.",
    icon: ClipboardCheck,
  },
  {
    title: "Não estamos a esconder dependências.",
    body: "PHC Advanced, Frotcom e adopção da oficina aparecem nesta apresentação como temas explícitos de validação.",
    icon: CircleAlert,
  },
];

const MODULES = [
  {
    code: "A",
    title: "Validação de quilómetros",
    icon: TruckIcon,
    pain: "A administrativa cruza Logue Trans com Frotcom viagem a viagem e o erro segue para a facturação.",
    currentState: "Semáforo operacional, threshold de 3 km, histórico auditado e aprovação por excepção.",
    proof: "A Clarice consegue ver logo o dia em atenção e abrir só o que precisa de validar.",
    validate: "Se o threshold, os estados e o fluxo de aprovação correspondem ao processo real.",
    href: "/login?target=km",
  },
  {
    code: "B",
    title: "OCR de facturas fornecedor",
    icon: ReceiptText,
    pain: "O conhecimento de classificação está na pessoa e não no sistema; cada fornecedor tem o seu formato.",
    currentState: "Upload, extracção, classificação por NIF, memória por fornecedor e export orientado a PHC Advanced.",
    proof: "As 9 facturas reais já foram usadas para ensinar a classificação por fornecedor.",
    validate: "Se a lógica de classificação e o grau de validação humana estão certos.",
    href: "/login?target=ocr",
  },
  {
    code: "C",
    title: "Digitalização central",
    icon: FileStack,
    pain: "CMR, guias e tickets vivem espalhados entre papel, WhatsApp e pesquisa manual.",
    currentState: "Hub documental único por viagem, matrícula, data, empresa e estado.",
    proof: "A apresentação deixa claro quem pesquisa, quem digitaliza e quem confirma.",
    validate: "Se este deve ser o ponto único de entrada documental da operação.",
    href: "/login?target=docs",
  },
  {
    code: "D",
    title: "Combustível",
    icon: Fuel,
    pain: "Os dados existem, mas estão separados por fornecedor e sem leitura consolidada por viatura.",
    currentState: "A demo cruza abastecimentos por matrícula e fornecedor e sinaliza anomalias com decisão humana.",
    proof: "Já estão carregadas 2161 linhas reais.",
    validate: "Se a leitura actual serve para gestão e qual o impacto da dependência da API Frotcom.",
    href: "/login?target=fuel",
  },
  {
    code: "E",
    title: "Bolsa de carga",
    icon: PackageSearch,
    pain: "O comercial trabalha sobre Excel longo, memória tardia e comissões calculadas no fim do mês.",
    currentState: "Fluxo auditado por estado, documentos ligados a cada carga e regra de comissão reflectida na plataforma.",
    proof: "O Excel real de 306 cargas já foi convertido para navegação operacional.",
    validate:
      "Se a leitura da margem, dos estados e das colunas bate certo com a prática da Lloretrans, e onde o Excel precisa de saneamento antes de entrar em produção.",
    href: "/login?target=bolsa",
  },
  {
    code: "F",
    title: "Folha de obra da oficina",
    icon: Wrench,
    pain: "O mecânico regista em papel e a administrativa relança tudo no PHC Advanced.",
    currentState: "PWA mobile-first com checklist, estados, assinatura e validação administrativa.",
    proof: "A folha de obra já pode ser mostrada em telemóvel como experiência real de uso.",
    validate: "Se o mecânico adopta o fluxo e se a administrativa ganha controlo sem duplicação.",
    href: "/login?target=oficina",
  },
];

const DEPENDENCIES = [
  {
    title: "PHC Advanced",
    owner: "expert interno do grupo",
    note: "A plataforma prepara e estrutura; a validação com o expert interno decide o grau de integração efectiva.",
  },
  {
    title: "Frotcom",
    owner: "acesso técnico de leitura",
    note: "Combustível entra com base real na demo, mas a profundidade final depende da confirmação da leitura disponível.",
  },
  {
    title: "Oficina",
    owner: "piloto com utilizador real",
    note: "A qualidade do módulo F depende menos de tecnologia e mais de adopção no terreno.",
  },
];

const DEMO_STEPS = [
  "Abrir o dashboard da Clarice e ler a operação em dois minutos.",
  "Entrar nos módulos A, B e C para validar controlo administrativo.",
  "Mostrar o módulo E com as cargas reais convertidas do Excel.",
  "Fechar com oficina em telemóvel e combustível como dependência assumida.",
  "Sair da reunião com uma resposta clara: corresponde ou não corresponde?",
];

const COUNCIL_REASONS = [
  {
    title: "Já existe plataforma",
    body: "A reunião parte de fluxos navegáveis com dados reais, e não de uma promessa em PowerPoint.",
  },
  {
    title: "Sprint 0 é arranque",
    body: "A primeira semana fecha acessos, saneamento, integração e piloto. Não é descoberta teórica.",
  },
  {
    title: "Decisão humana preservada",
    body: "IA prepara, classifica e sinaliza; a aprovação continua do lado Lloretrans em passos irreversíveis.",
  },
  {
    title: "Preparado para crescer no grupo",
    body: "A arquitectura, permissões e segregação documental já foram pensadas para mais empresas e mais equipas.",
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
      <div className="pointer-events-none fixed inset-x-0 top-0 h-[520px] bg-[radial-gradient(circle_at_top_left,rgba(42,229,160,0.18),transparent_42%),radial-gradient(circle_at_top_right,rgba(202,116,45,0.14),transparent_36%)]" />

      <header className="relative mx-auto flex max-w-[1320px] items-center justify-between px-6 py-8 lg:px-10">
        <Link
          href="/"
          className="flex min-h-11 items-center gap-4 rounded-2xl border border-[#e2e8f0] bg-white px-4 py-3 shadow-elevated-sm"
        >
          <Image
            src="/aitipro-logo.png"
            alt="AiTiPro"
            width={154}
            height={36}
            className="h-7 w-auto"
            priority
          />
          <div className="hidden h-7 w-px bg-[#e2e8f0] sm:block" />
          <div className="hidden sm:block">
            <div className="text-[10px] font-semibold uppercase tracking-[0.22em] text-[#ca742d]">
              Apresentação de validação
            </div>
            <div className="mt-1 text-xs text-[#6b7280]">Lloretrans · sem preços · antes do conselho</div>
          </div>
        </Link>
        <div className="flex items-center gap-3">
          <Button
            asChild
            variant="outline"
            size="sm"
            className="border-[#cbd5e1] bg-white text-[#1e2d3d] hover:border-[#1bc88a] hover:bg-white"
          >
            <Link href="/login">Abrir demo</Link>
          </Button>
          <Button
            asChild
            size="sm"
            className="border-0 bg-[#2ae5a0] text-[#1e2d3d] shadow-none hover:bg-[#1bc88a]"
          >
            <Link href="mailto:bilal.machraa@aitipro.com?subject=Reuniao%20Lloretrans%20-%20validacao%20da%20plataforma">
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
              Clarice Santos · Lloretrans · reunião de validação antes do conselho
            </Badge>
            <h1 className="text-4xl font-semibold leading-[0.96] tracking-tight sm:text-5xl lg:text-[5.3rem]">
              Validar se esta plataforma já espelha
              <span className="block text-[#0d3b38]">a operação real da Lloretrans.</span>
            </h1>
            <p className="mt-8 max-w-3xl text-lg leading-relaxed text-[#374151] lg:text-[1.15rem]">
              Nesta reunião não se decide preço. Decide-se se os seis fluxos, os dados reais e os
              controlos visíveis na demo correspondem ao que a Clarice precisa de levar ao conselho.
              Se corresponder, a conversa seguinte passa a ser faseamento, ROI e prioridade. Se não
              corresponder, ajusta-se antes de circular qualquer proposta.
            </p>
          </div>

          <aside className="border-l border-[#cbd5e1] pl-0 lg:pl-10">
            <div className="grid gap-5 rounded-[28px] border border-[#e2e8f0] bg-white p-7 shadow-elevated-lg">
              <div>
                <div className="text-[10px] font-semibold uppercase tracking-[0.24em] text-[#ca742d]">
                  Objetivo da reunião
                </div>
                <p className="mt-3 text-3xl font-semibold leading-tight tracking-tight">
                  Sair da reunião com um validar, ajustar ou avançar.
                </p>
              </div>
              <div className="grid gap-3 text-sm text-[#4b5563]">
                <p>
                  <strong className="text-[#1e2d3d]">Hoje:</strong> confirmar se a demo espelha a
                  operação real.
                </p>
                <p>
                  <strong className="text-[#1e2d3d]">Depois:</strong> decidir o que a Clarice leva ao
                  conselho.
                </p>
                <p>
                  <strong className="text-[#1e2d3d]">Regra base:</strong> decisão humana em todos os
                  passos irreversíveis.
                </p>
              </div>
            </div>
          </aside>
        </div>
      </section>

      <section className="relative border-y border-[#e2e8f0] bg-[#2d3a4a] text-white">
        <div className="mx-auto grid max-w-[1320px] gap-10 px-6 py-16 lg:grid-cols-[0.92fr_1.08fr] lg:px-10 lg:py-20">
          <div>
            <div className="text-[11px] font-semibold uppercase tracking-[0.22em] text-[#2ae5a0]">
              Mensagem central da reunião
            </div>
            <h2 className="mt-5 text-4xl font-semibold leading-tight tracking-tight lg:text-5xl">
              &ldquo;Não é só tempo. A nossa preocupação também é o controlo.&rdquo;
            </h2>
            <p className="mt-5 max-w-xl text-base leading-relaxed text-white/76">
              A plataforma foi desenhada para responder a essa frase. Menos papel, menos Excel
              paralelo, mais trilho de decisão e mais capacidade de ler a operação sem depender de memória
              individual.
            </p>
            <p className="mt-8 text-sm uppercase tracking-[0.16em] text-white/46">
              Clarice Santos · reunião de 16 de Abril de 2026
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
              A conversa já pode partir de evidências, não de promessas.
            </h2>
            <p className="mt-5 max-w-lg text-base leading-relaxed text-[#4b5563]">
              A demonstração junta dados reais, regras reais e fricções reais. O objectivo da Clarice
              nesta apresentação não é imaginar uma solução futura. É validar se o que já está montado
              merece seguir para a fase de decisão.
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
                O que a Clarice vai validar
              </div>
              <h2 className="mt-4 text-4xl font-semibold leading-tight tracking-tight lg:text-5xl">
                Seis dores. Seis respostas. Uma leitura de reunião.
              </h2>
            </div>
            <p className="max-w-2xl text-base leading-relaxed text-[#4b5563]">
              Esta parte não serve para vender módulos. Serve para comparar dor actual, estado da demo,
              prova visível e pergunta de validação. É isso que transforma a apresentação num instrumento
              de decisão em vez de uma página bonita.
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
                        Ver na demo <ArrowRight className="ml-2 h-4 w-4" />
                      </Link>
                    </div>
                  </div>

                  <InfoBlock label="Dor actual" body={module.pain} />
                  <InfoBlock label="O que já está construído" body={module.currentState} />

                  <div className="grid gap-4">
                    <InfoBlock label="Prova na reunião" body={module.proof} compact />
                    <InfoBlock label="Validar com Clarice" body={module.validate} compact emphasis />
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
                A credibilidade da apresentação melhora quando as dependências aparecem de frente.
                Isto protege a conversa comercial e mostra que a AiTiPro não está a vender o que não
                controla.
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
                    Dono da validação
                  </div>
                  <p className="mt-2 text-sm font-medium text-[#374151]">{dependency.owner}</p>
                  <p className="mt-4 text-sm leading-relaxed text-[#4b5563]">{dependency.note}</p>
                </article>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="relative bg-[#0d3b38] text-white">
        <div className="mx-auto grid max-w-[1320px] gap-10 px-6 py-16 lg:grid-cols-[0.8fr_1.2fr] lg:px-10 lg:py-22">
          <div>
            <div className="text-[11px] font-semibold uppercase tracking-[0.22em] text-[#2ae5a0]">
              Roteiro sugerido
            </div>
            <h2 className="mt-4 text-4xl font-semibold leading-tight tracking-tight lg:text-5xl">
              Trinta minutos. Uma pergunta. Uma resposta útil.
            </h2>
            <p className="mt-5 max-w-xl text-base leading-relaxed text-white/72">
              A reunião deve ser curta, concreta e orientada a validação. O objectivo não é percorrer
              todas as funcionalidades. É sair com uma leitura segura sobre o encaixe real da solução.
            </p>
          </div>

          <ol className="grid gap-4">
            {DEMO_STEPS.map((step, index) => (
              <li
                key={step}
                className="flex gap-4 rounded-2xl border border-white/10 bg-white/8 p-5 backdrop-blur"
              >
                <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-[#2ae5a0] font-mono text-sm font-semibold text-[#1e2d3d]">
                  {index + 1}
                </span>
                <span className="pt-1 text-sm leading-relaxed text-white/82">{step}</span>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section className="relative mx-auto max-w-[1320px] px-6 py-16 lg:px-10 lg:py-22">
        <div className="grid gap-10 lg:grid-cols-[0.8fr_1.2fr] lg:items-end">
          <div>
            <div className="text-[11px] font-semibold uppercase tracking-[0.22em] text-[#ca742d]">
              Porque esta abordagem é defensável
            </div>
            <h2 className="mt-4 text-4xl font-semibold leading-tight tracking-tight lg:text-5xl">
              Quatro razões para a Clarice validar antes de levar ao conselho.
            </h2>
          </div>
          <p className="max-w-2xl text-base leading-relaxed text-[#4b5563]">
            A apresentação ganha força quando mostra por que razão esta solução merece atenção interna:
            já existe produto, a primeira semana não é teatro comercial, a decisão continua humana e a
            arquitectura já foi pensada para escalar do Lloretrans para o grupo.
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
                Fecho recomendado
              </div>
              <h2 className="mt-4 text-3xl font-semibold leading-tight tracking-tight lg:text-4xl">
                Primeiro validar. Depois fasear. Só depois propor.
              </h2>
            </div>
            <div className="grid gap-4 text-sm leading-relaxed text-white/76">
              <p>
                <strong className="text-white">Plataforma:</strong> mostrar a demo com a Clarice e
                recolher validação operacional.
              </p>
              <p>
                <strong className="text-white">Administração:</strong> levar apenas o que já foi
                validado e enquadrado.
              </p>
              <p>
                <strong className="text-white">Proposta:</strong> entra depois, com faseamento, ROI e
                próximos passos.
              </p>
            </div>
          </div>

          <div className="mt-8 flex flex-wrap items-center gap-3 border-t border-white/12 pt-6">
            <Button
              asChild
              size="lg"
              className="border-0 bg-[#2ae5a0] text-[#1e2d3d] shadow-none hover:bg-[#1bc88a]"
            >
              <Link href="/login">Abrir a plataforma</Link>
            </Button>
            <p className="text-sm text-white/70">
              Depois da validação, seguem-se faseamento, ROI e proposta formal.
            </p>
            <div className="ml-auto hidden rounded-xl bg-white px-4 py-3 lg:block">
              <Image src="/aitipro-logo.png" alt="AiTiPro" width={138} height={32} className="h-6 w-auto" />
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
