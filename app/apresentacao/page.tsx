import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  ArrowRight,
  ClipboardCheck,
  FileStack,
  Fuel,
  PackageSearch,
  ReceiptText,
  TruckIcon,
  Wrench,
} from "lucide-react";

export const metadata = {
  title: "Apresentação Lloretrans — Demo operacional AiTiPro",
  description:
    "Apresentação sem preços para validar a plataforma operacional Lloretrans antes da proposta comercial.",
  robots: { index: false, follow: false },
};

const MODULES = [
  {
    code: "A",
    title: "Validação de quilómetros",
    icon: TruckIcon,
    pain: "Administrativas cruzam Logue Trans com Frotcom viagem a viagem.",
    solution: "Semáforo diário, threshold de 3 km, aprovação por excepção e histórico auditado.",
    validation: "Confirmar threshold, excepções e quem aprova antes de afectar facturação.",
    demo: "/login?target=km",
  },
  {
    code: "B",
    title: "OCR facturas fornecedor",
    icon: ReceiptText,
    pain: "50 fornecedores, layouts diferentes e classificação dependente de conhecimento tácito.",
    solution: "Upload, extracção, classificação por NIF, validação humana e memória por fornecedor.",
    validation: "Confirmar classificação por fornecedor, export PHC Advanced e limites da decisão humana.",
    demo: "/login?target=ocr",
  },
  {
    code: "C",
    title: "Digitalização central",
    icon: FileStack,
    pain: "CMR, guias e tickets de frio dispersos em papel e WhatsApp.",
    solution: "Hub documental por viagem, matrícula, data, empresa autorizada e estado.",
    validation: "Confirmar ponto único de digitalização, permissões por empresa e pesquisa operacional.",
    demo: "/login?target=docs",
  },
  {
    code: "D",
    title: "Combustível",
    icon: Fuel,
    pain: "Cepsa, Repsol, Radius e bomba interna vivem em ficheiros separados.",
    solution: "Cruzamento por matrícula e fornecedor, anomalias sinalizadas e decisão humana.",
    validation: "Confirmar dados disponíveis hoje e dependência técnica da API Frotcom.",
    demo: "/login?target=fuel",
  },
  {
    code: "E",
    title: "Bolsa de carga",
    icon: PackageSearch,
    pain: "Excel com cargas, facturas tardias e comissões calculadas no fim do mês.",
    solution: "Fluxo auditado por estado, documentos associados e comissões calculadas pela regra confirmada.",
    validation: "Confirmar sentido das colunas, regra de comissão e tratamento da margem negativa.",
    demo: "/login?target=bolsa",
  },
  {
    code: "F",
    title: "Folha de obra oficina",
    icon: Wrench,
    pain: "Mecânico regista em papel e administrativa relança no PHC Advanced.",
    solution: "PWA mobile-first, checklist real, estados de trabalho, assinatura e validação administrativa.",
    validation: "Confirmar adopção pelo mecânico, tempo por folha e validação administrativa.",
    demo: "/login?target=oficina",
  },
];

const DEMO_STEPS = [
  "Começar pelo dashboard da Clarice: visão global e estado dos módulos.",
  "Abrir km, OCR e documentos para validar as dores administrativas.",
  "Mostrar bolsa e comissões com o Excel real convertido em fluxo auditado.",
  "Mostrar oficina no telemóvel para discutir adopção do mecânico.",
  "Fechar com combustível como módulo dependente de confirmação Frotcom.",
];

export default function ApresentacaoPage() {
  return (
    <main className="min-h-screen bg-[hsl(40_24%_98%)] text-[hsl(220_28%_10%)]">
      <div
        className="pointer-events-none fixed inset-0 opacity-[0.03]"
        style={{
          backgroundImage: "radial-gradient(hsl(222 72% 15%) 1px, transparent 1px)",
          backgroundSize: "24px 24px",
        }}
      />

      <header className="relative mx-auto flex max-w-[1180px] items-center justify-between px-6 py-8 lg:px-10">
        <Link href="/" className="flex min-h-11 items-center gap-3">
          <div className="grid h-10 w-10 place-items-center rounded-md bg-[hsl(222_72%_30%)] font-display font-bold text-white">
            A
          </div>
          <div>
            <div className="font-display text-base font-semibold leading-none">AiTiPro</div>
            <div className="mt-0.5 text-[10px] uppercase tracking-wider text-muted-foreground">
              Apresentação operacional
            </div>
          </div>
        </Link>
        <Button asChild variant="outline" size="sm">
          <Link href="/login">Abrir demo</Link>
        </Button>
      </header>

      <section className="relative mx-auto max-w-[1180px] px-6 pb-14 pt-10 lg:px-10 lg:pb-20 lg:pt-16">
        <Badge variant="outline" className="mb-5 text-[11px] uppercase tracking-wider">
        Lloretrans · Grupo Patrícia Pilar · sem discussão de preço
        </Badge>
        <div className="grid gap-10 lg:grid-cols-[1.35fr_0.65fr] lg:items-end">
          <div>
            <h1 className="font-display text-5xl font-semibold leading-[0.98] tracking-normal lg:text-7xl">
              Validar a plataforma antes de falar de investimento.
            </h1>
            <p className="mt-7 max-w-3xl text-lg leading-relaxed text-foreground/70">
              Esta apresentação serve para uma coisa: confirmar com a Clarice se o que foi construído
              representa a operação real da Lloretrans. Só depois faz sentido discutir faseamento,
              prioridade e proposta comercial.
            </p>
          </div>
          <div className="rounded-xl border border-[hsl(220_14%_88%)] bg-white p-6 shadow-elevated-sm">
            <div className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[hsl(32_82%_35%)]">
              Critério da reunião
            </div>
            <p className="mt-3 font-display text-2xl font-semibold leading-snug">
              A plataforma corresponde à expectativa operacional?
            </p>
            <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
              Se sim, a conversa seguinte é prioridade e retorno. Se não, corrigimos antes de pôr
              preço em cima da mesa.
            </p>
          </div>
        </div>
      </section>

      <section className="relative border-y border-[hsl(220_14%_88%)] bg-white">
        <div className="mx-auto grid max-w-[1180px] gap-8 px-6 py-14 lg:grid-cols-[0.8fr_1.2fr] lg:px-10">
          <div>
            <div className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[hsl(32_82%_35%)]">
              O que ouvimos
            </div>
            <h2 className="mt-4 font-display text-4xl font-semibold leading-tight">
              O problema não é só tempo. É controlo.
            </h2>
          </div>
          <div className="rounded-xl bg-[hsl(40_30%_96%)] p-8">
            <p className="font-display text-3xl leading-snug">
              &ldquo;Não é só tempo, a nossa preocupação também é o controlo.&rdquo;
            </p>
            <p className="mt-5 text-sm text-muted-foreground">
              Clarice Santos · reunião de 16 de Abril de 2026
            </p>
          </div>
        </div>
      </section>

      <section className="relative mx-auto max-w-[1180px] px-6 py-16 lg:px-10 lg:py-20">
        <div className="mb-10 max-w-3xl">
          <div className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[hsl(32_82%_35%)]">
            O que já está feito
          </div>
          <h2 className="mt-4 font-display text-4xl font-semibold leading-tight">
            Não é mockup. É uma demo navegável com evidência real.
          </h2>
        </div>
        <div className="grid gap-4 md:grid-cols-4">
          <Proof n="9" label="facturas reais classificadas" />
          <Proof n="306" label="cargas do Excel convertidas" />
          <Proof n="2161" label="abastecimentos reais carregados" />
          <Proof n="17" label="itens da folha de oficina" />
        </div>
      </section>

      <section className="relative mx-auto max-w-[1180px] px-6 pb-16 lg:px-10 lg:pb-20">
        <div className="mb-10 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <div className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[hsl(32_82%_35%)]">
              Seis dores · seis respostas
            </div>
            <h2 className="mt-4 max-w-3xl font-display text-4xl font-semibold leading-tight">
              Mostrar solução por dor, não vender preço por módulo.
            </h2>
          </div>
          <Button asChild>
            <Link href="/login">
              Entrar como Clarice <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          {MODULES.map((module) => {
            const Icon = module.icon;
            return (
              <article key={module.code} className="rounded-xl border border-[hsl(220_14%_88%)] bg-white p-6">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="grid h-11 w-11 place-items-center rounded-lg bg-[hsl(222_72%_30%)]/10">
                      <Icon className="h-5 w-5 text-[hsl(222_72%_30%)]" />
                    </div>
                    <div>
                      <div className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
                        Módulo {module.code}
                      </div>
                      <h3 className="font-display text-xl font-semibold">{module.title}</h3>
                    </div>
                  </div>
                  <Link
                    href={module.demo}
                    className="inline-flex min-h-11 items-center text-xs font-medium text-[hsl(222_72%_30%)] hover:underline"
                  >
                    Ver
                  </Link>
                </div>
                <div className="mt-5 grid gap-4 sm:grid-cols-2">
                  <div>
                    <div className="text-[10px] font-semibold uppercase tracking-wider text-[hsl(0_72%_45%)]">
                      Dor
                    </div>
                    <p className="mt-2 text-sm leading-relaxed text-foreground/70">{module.pain}</p>
                  </div>
                  <div>
                    <div className="text-[10px] font-semibold uppercase tracking-wider text-[hsl(152_55%_32%)]">
                      Solução
                    </div>
                    <p className="mt-2 text-sm leading-relaxed text-foreground/70">{module.solution}</p>
                  </div>
                </div>
                <div className="mt-5 rounded-lg border border-[hsl(220_14%_90%)] bg-[hsl(40_30%_96%)] p-4">
                  <div className="text-[10px] font-semibold uppercase tracking-wider text-[hsl(32_82%_35%)]">
                    Validar com Clarice
                  </div>
                  <p className="mt-2 text-sm leading-relaxed text-foreground/72">{module.validation}</p>
                </div>
              </article>
            );
          })}
        </div>
      </section>

      <section className="relative border-y border-[hsl(220_14%_88%)] bg-[hsl(222_72%_12%)] text-white">
        <div className="mx-auto grid max-w-[1180px] gap-10 px-6 py-16 lg:grid-cols-[0.8fr_1.2fr] lg:px-10 lg:py-20">
          <div>
            <div className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[hsl(32_82%_65%)]">
              Roteiro da demo
            </div>
            <h2 className="mt-4 font-display text-4xl font-semibold leading-tight">
              30 minutos para validar expectativa.
            </h2>
            <p className="mt-5 text-white/70">
              A demo deve acabar com uma lista curta: o que corresponde, o que falta, o que muda a
              prioridade e quem precisa de ver a seguir.
            </p>
          </div>
          <ol className="space-y-3">
            {DEMO_STEPS.map((step, index) => (
              <li key={step} className="flex gap-4 rounded-lg border border-white/10 bg-white/5 p-4">
                <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-[hsl(32_82%_55%)] font-mono text-sm font-semibold text-[hsl(222_72%_12%)]">
                  {index + 1}
                </span>
                <span className="text-sm leading-relaxed text-white/82">{step}</span>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section className="relative mx-auto max-w-[1180px] px-6 py-16 lg:px-10 lg:py-20">
        <div className="rounded-2xl border border-[hsl(220_14%_88%)] bg-white p-8 lg:p-10">
          <div className="grid gap-8 lg:grid-cols-[0.75fr_1.25fr]">
            <div>
              <ClipboardCheck className="mb-5 h-8 w-8 text-[hsl(222_72%_30%)]" />
              <h2 className="font-display text-3xl font-semibold leading-tight">
                Só depois da validação falamos de proposta.
              </h2>
            </div>
            <div className="grid gap-4 text-sm leading-relaxed text-foreground/72 md:grid-cols-3">
              <p>
                <strong className="text-foreground">1. Validar expectativa.</strong> A Clarice diz se
                a demo espelha a operação.
              </p>
              <p>
                <strong className="text-foreground">2. Corrigir lacunas.</strong> Ajustamos copy,
                dados ou fluxo antes do conselho.
              </p>
              <p>
                <strong className="text-foreground">3. Falar de faseamento.</strong> Só nessa altura
                entram prioridade, ROI e investimento.
              </p>
            </div>
          </div>
          <div className="mt-8 flex flex-wrap gap-3 border-t border-[hsl(220_14%_90%)] pt-6">
            <Button asChild size="lg">
              <Link href="/login">Abrir plataforma</Link>
            </Button>
            <Button asChild size="lg" variant="outline">
              <Link href="mailto:bilal.machraa@aitipro.com?subject=Demo%20Lloretrans%20-%20validacao">
                Marcar validação
              </Link>
            </Button>
          </div>
        </div>
      </section>
    </main>
  );
}

function Proof({ n, label }: { n: string; label: string }) {
  return (
    <div className="rounded-xl border border-[hsl(220_14%_88%)] bg-white p-6 text-center">
      <div className="font-mono text-4xl font-semibold text-[hsl(222_72%_30%)]">{n}</div>
      <div className="mt-2 text-[11px] uppercase tracking-wider text-muted-foreground">{label}</div>
    </div>
  );
}
