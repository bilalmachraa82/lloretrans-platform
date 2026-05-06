import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  CalendarDays,
  CircleAlert,
  Download,
  ShieldCheck,
  TimerReset,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export const metadata = {
  title: "Proposta — Lloretrans × AiTiPro",
  description:
    "Modelo de investimento por fases para a plataforma operacional Lloretrans.",
  robots: { index: false, follow: false },
};

const STEPS = [
  {
    label: "Passo 1",
    name: "Núcleo de validação",
    price: "€14.000",
    monthly: "+ €600/mês",
    scope: "Validação de quilómetros + Hub documental",
    duration: "Semana técnica + 5 semanas",
    payback: "Payback estimado: mês 6",
    result: "+€69.700 de diferença estimada a 36 meses",
    tone: "border-[#ca742d] bg-[#fff7ed]",
  },
  {
    label: "Passo 2",
    name: "Núcleo administrativo",
    price: "€25.500",
    monthly: "+ €700/mês",
    scope: "Passo 1 + OCR de facturas fornecedor",
    duration: "+ 4 semanas",
    payback: "Payback estimado: mês 8",
    result: "+€95.424 de diferença estimada a 36 meses",
    tone: "border-[#2563eb] bg-[#eff6ff]",
  },
  {
    label: "Passo 3",
    name: "Operação integrada",
    price: "€45.000",
    monthly: "+ €900/mês",
    scope: "Passo 2 + Bolsa de carga + Oficina",
    duration: "14 semanas no total",
    payback: "Payback estimado: mês 9",
    result: "+€135.936 de diferença estimada a 36 meses",
    tone: "border-[#0d3b38] bg-[#eef6f3]",
    recommended: true,
  },
];

const TECHNICAL_WEEK = [
  "Dia 1: validação com integrador PHC Advanced.",
  "Dias 2-3: API Frotcom e Logue Trans.",
  "Dia 4: volumes reais cronometrados.",
  "Dia 5: relatório go/no-go.",
];

const PENDING = [
  "Contacto do integrador PHC e formato de escrita autorizado.",
  "Documentação ou acesso de leitura Frotcom e Logue Trans.",
  "Confirmação CANBus/odómetro para fechar o módulo combustível.",
  "Separação final dos 4.000 documentos/mês entre transporte e OCR fornecedor.",
];

export default function PropostaPage() {
  return (
    <main className="min-h-screen bg-[#f0f5f4] text-[#1e2d3d] [&_h1]:font-sans [&_h2]:font-sans [&_h3]:font-sans">
      <div
        className="pointer-events-none fixed inset-0 opacity-[0.03]"
        style={{
          backgroundImage: "radial-gradient(#2d3a4a 1px, transparent 1px)",
          backgroundSize: "22px 22px",
        }}
      />

      <header className="relative mx-auto flex max-w-[1320px] flex-col gap-4 px-6 py-8 sm:flex-row sm:items-center sm:justify-between lg:px-10">
        <Link
          href="/apresentacao"
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
          <div>
            <div className="text-[9px] font-semibold uppercase tracking-[0.18em] text-[#ca742d] sm:text-[10px] sm:tracking-[0.22em]">
              Proposta comercial
            </div>
            <div className="mt-1 text-[11px] text-[#6b7280] sm:text-xs">
              Lloretrans · Grupo Patrícia Pilar
            </div>
          </div>
        </Link>

        <div className="flex w-full items-center gap-3 sm:w-auto">
          <Button asChild variant="outline" size="sm" className="flex-1 border-[#cbd5e1] bg-white text-[#1e2d3d] hover:border-[#1bc88a] hover:bg-white sm:flex-none">
            <Link href="/apresentacao">Voltar à apresentação</Link>
          </Button>
          <Button asChild size="sm" className="flex-1 border-0 bg-[#0d3b38] text-white shadow-none hover:bg-[#134f4b] sm:flex-none">
            <Link href="/proposta-v6-administracao.pdf">
              PDF curto <Download className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </div>
      </header>

      <section className="relative mx-auto max-w-[1320px] px-6 pb-12 pt-8 lg:px-10 lg:pb-16 lg:pt-14">
        <div className="grid gap-10 lg:grid-cols-[1.05fr_0.95fr] lg:items-end">
          <div>
            <Badge variant="outline" className="mb-6 border-[#ca742d]/20 bg-[#fef3e8] text-[11px] uppercase tracking-[0.2em] text-[#ca742d]">
              Só depois de validar a expectativa operacional
            </Badge>
            <h1 className="max-w-4xl text-4xl font-semibold leading-[0.98] tracking-tight sm:text-5xl lg:text-[4.6rem]">
              Investimento em três passos.
              <span className="block text-[#0d3b38]">Cada decisão é independente.</span>
            </h1>
            <p className="mt-7 max-w-3xl text-lg leading-relaxed text-[#374151]">
              A proposta não obriga a avançar tudo de uma vez. Começa com o núcleo de controlo,
              mede adopção e integrações, e só depois expande para OCR, bolsa e oficina se o valor
              operacional estiver validado.
            </p>
          </div>

          <aside className="rounded-[28px] border border-[#d8e1df] bg-white p-7 shadow-elevated-lg">
            <div className="flex items-center gap-3">
              <ShieldCheck className="h-6 w-6 text-[#1bc88a]" />
              <h2 className="text-2xl font-semibold leading-tight">Cláusula de redução de risco</h2>
            </div>
            <p className="mt-4 text-sm leading-relaxed text-[#4b5563]">
              A primeira semana técnica é sem custo. Se confirmar bloqueio técnico estrutural em
              PHC, Frotcom ou Logue Trans, a Lloretrans não paga implementação.
            </p>
            <div className="mt-5 rounded-2xl bg-[#eef6f3] px-4 py-4 text-sm font-medium leading-relaxed text-[#0d3b38]">
              Na reunião, esta página só deve aparecer depois da frase: “a plataforma corresponde
              à expectativa operacional?”
            </div>
          </aside>
        </div>
      </section>

      <section className="relative mx-auto max-w-[1320px] px-6 py-10 lg:px-10">
        <div className="grid gap-5 lg:grid-cols-3">
          {STEPS.map((step) => (
            <article key={step.label} className={`relative rounded-[28px] border-2 ${step.tone} p-7 shadow-elevated-sm`}>
              {step.recommended ? (
                <div className="absolute right-5 top-5 rounded-full bg-[#0d3b38] px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.16em] text-white">
                  Completo
                </div>
              ) : null}
              <div className="font-mono text-[11px] font-semibold uppercase tracking-[0.18em] text-[#6b7280]">
                {step.label}
              </div>
              <h2 className="mt-3 text-3xl font-semibold leading-tight tracking-tight">{step.name}</h2>
              <div className="mt-7 flex items-baseline gap-3">
                <div className="text-5xl font-semibold tracking-tight text-[#0d3b38]">{step.price}</div>
                <div className="text-sm font-medium text-[#4b5563]">preço fechado</div>
              </div>
              <div className="mt-3 rounded-2xl bg-white px-4 py-3 text-sm font-semibold text-[#1e2d3d] shadow-elevated-sm">
                {step.monthly}
              </div>
              <div className="mt-6 grid gap-3 text-sm leading-relaxed text-[#374151]">
                <p><strong>Inclui:</strong> {step.scope}</p>
                <p><strong>Duração:</strong> {step.duration}</p>
                <p><strong>Retorno:</strong> {step.payback}</p>
                <p className="font-semibold text-[#0d3b38]">{step.result}</p>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="relative mx-auto max-w-[1320px] px-6 py-10 lg:px-10">
        <div className="grid gap-6 rounded-[32px] border border-[#1e2d3d]/10 bg-white p-7 shadow-elevated-lg lg:grid-cols-[0.95fr_1.05fr] lg:p-9">
          <div>
            <div className="flex items-center gap-3 text-[11px] font-semibold uppercase tracking-[0.22em] text-[#ca742d]">
              <TimerReset className="h-4 w-4" />
              Semana 1 técnica sem custo
            </div>
            <h2 className="mt-4 text-3xl font-semibold leading-tight tracking-tight">
              O antigo Sprint 0 explicado sem ruído comercial.
            </h2>
            <p className="mt-4 max-w-xl text-sm leading-relaxed text-[#4b5563]">
              Não é um módulo adicional nem uma fase para atrasar a decisão. É a primeira semana
              do contrato, sem custo, usada para fechar integrações, dados reais e go/no-go técnico.
            </p>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            {TECHNICAL_WEEK.map((item) => (
              <div key={item} className="rounded-2xl border border-[#e2e8f0] bg-[#f8fffc] px-4 py-4 text-sm leading-relaxed text-[#374151]">
                {item}
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="relative mx-auto max-w-[1320px] px-6 py-10 lg:px-10">
        <div className="grid gap-6 lg:grid-cols-[0.82fr_1.18fr]">
          <article className="rounded-[28px] border border-[#e2e8f0] bg-[#0d3b38] p-7 text-white shadow-elevated-lg">
            <div className="flex items-center gap-3 text-[#2ae5a0]">
              <CalendarDays className="h-6 w-6" />
              <h2 className="text-2xl font-semibold tracking-tight text-white">Opção futura</h2>
            </div>
            <p className="mt-4 text-sm leading-relaxed text-white/78">
              Combustível fica como activação futura: <strong className="text-white">€7.500 se activado</strong>.
              Não é cobrado agora porque depende da confirmação técnica da leitura Frotcom/CANBus e
              do formato recorrente da bomba interna.
            </p>
          </article>

          <article className="rounded-[28px] border border-[#e2e8f0] bg-white p-7 shadow-elevated-sm">
            <div className="flex items-center gap-3">
              <CircleAlert className="h-6 w-6 text-[#ca742d]" />
              <h2 className="text-2xl font-semibold tracking-tight">Pontos que faltam fechar</h2>
            </div>
            <div className="mt-5 grid gap-3 md:grid-cols-2">
              {PENDING.map((item) => (
                <div key={item} className="rounded-2xl border border-[#e2e8f0] bg-[#f8fffc] px-4 py-4 text-sm leading-relaxed text-[#374151]">
                  {item}
                </div>
              ))}
            </div>
          </article>
        </div>
      </section>

      <section className="relative mx-auto max-w-[1320px] px-6 py-12 lg:px-10 lg:pb-20">
        <div className="rounded-[32px] border border-[#1e2d3d]/10 bg-[linear-gradient(135deg,#1e2d3d,#0d3b38)] px-8 py-9 text-white shadow-elevated-lg lg:px-10">
          <div className="grid gap-8 lg:grid-cols-[0.92fr_1.08fr] lg:items-end">
            <div>
              <div className="text-[11px] font-semibold uppercase tracking-[0.22em] text-[#2ae5a0]">
                Documento de entrega
              </div>
              <h2 className="mt-4 text-3xl font-semibold leading-tight tracking-tight lg:text-4xl">
                A versão curta v6 continua a ser a proposta formal.
              </h2>
            </div>
            <p className="text-sm leading-relaxed text-white/76">
              Esta página ajuda a explicar os valores em reunião. Para entregar à Clarice ou enviar
              à administração, usar a v6 curta em PDF.
            </p>
          </div>
          <div className="mt-8 flex flex-wrap items-center gap-3 border-t border-white/12 pt-6">
            <Button asChild size="lg" className="border-0 bg-white text-[#1e2d3d] shadow-none hover:bg-white/90">
              <Link href="/proposta-v6-administracao.pdf">
                Abrir PDF v6 <Download className="ml-2 h-4 w-4" />
              </Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="border-white/30 bg-transparent text-white shadow-none hover:bg-white/10 hover:text-white">
              <Link href="/login">
                Voltar à plataforma <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>
      </section>
    </main>
  );
}
