import Image from "next/image";
import Link from "next/link";
import type { LucideIcon } from "lucide-react";
import {
  ArrowRight,
  ClipboardCheck,
  Database,
  FileStack,
  Fuel,
  PackageSearch,
  ReceiptText,
  Server,
  ShieldCheck,
  TruckIcon,
  UserCheck,
  Wrench,
} from "lucide-react";
import { Button } from "@/components/ui/button";

export const metadata = {
  title: "Lloretrans · Plataforma operacional",
  description:
    "Plataforma operacional desenhada com a operação Lloretrans: seis fluxos integrados, dados na UE e aprovação humana em cada decisão.",
};

const PROOF = [
  { value: "6", label: "fluxos operacionais", note: "Quilómetros, facturas, documentos, combustível, bolsa e oficina." },
  { value: "306", label: "cargas reais", note: "Excel histórico convertido para navegação operacional." },
  { value: "2 161", label: "abastecimentos", note: "Cruzados por matrícula e fornecedor no ambiente." },
  { value: "60", label: "viaturas", note: "Volume operacional alvo da plataforma." },
];

const PRODUCT_SHOTS = [
  {
    src: "/product-shots/dashboard-crop.png",
    title: "Dashboard operacional",
    body: "Visão consolidada dos módulos, alertas críticos e trabalho pendente.",
  },
  {
    src: "/product-shots/ocr-crop.png",
    title: "Facturas fornecedor",
    body: "Extracção, confiança, validação humana e preparação para PHC Advanced.",
  },
  {
    src: "/product-shots/bolsa-crop.png",
    title: "Bolsa de carga",
    body: "Cargas, margem, comissões e atrasos sobre dados importados.",
  },
];

const MODULES = [
  {
    code: "A",
    slug: "km",
    title: "Validação de quilómetros",
    icon: TruckIcon,
    pain: "Cruzamento manual entre Logue Trans e Frotcom, com risco de erro antes da facturação.",
    answer: "Semáforo por viagem, diferença de 3 km, histórico auditado e aprovação por excepção.",
  },
  {
    code: "B",
    slug: "ocr",
    title: "Facturas fornecedor",
    icon: ReceiptText,
    pain: "Cada fornecedor tem o seu formato e a classificação depende de conhecimento tácito.",
    answer: "Upload, extracção, classificação por NIF, memória por fornecedor e export orientado a PHC Advanced.",
  },
  {
    code: "C",
    slug: "docs",
    title: "Digitalização central",
    icon: FileStack,
    pain: "CMR, guias e tickets ficam dispersos entre papel, WhatsApp e pesquisa manual.",
    answer: "Hub documental único por viagem, matrícula, data, empresa e estado.",
  },
  {
    code: "D",
    slug: "fuel",
    title: "Combustível",
    icon: Fuel,
    pain: "Cepsa, Repsol, Radius e bomba interna vivem em ficheiros separados.",
    answer: "Cruzamento por matrícula e fornecedor, anomalias sinalizadas e decisão humana.",
  },
  {
    code: "E",
    slug: "bolsa",
    title: "Bolsa de carga",
    icon: PackageSearch,
    pain: "Excel longo, memória tardia e comissões calculadas no fim do mês.",
    answer: "Fluxo por estados, documentos ligados à carga e regras de comissão reflectidas na plataforma.",
  },
  {
    code: "F",
    slug: "oficina",
    title: "Folha de obra da oficina",
    icon: Wrench,
    pain: "O mecânico regista em papel e a administrativa relança tudo no PHC Advanced.",
    answer: "Aplicação móvel com checklist, estados, assinatura e validação administrativa.",
  },
];

const TRUST = [
  {
    title: "Dados na União Europeia",
    body: "Base de dados em Frankfurt e servidor aplicacional na União Europeia.",
    icon: Server,
  },
  {
    title: "Registo de auditoria",
    body: "Cada mutação fica registada com utilizador, antes/depois, motivo e momento da acção.",
    icon: Database,
  },
  {
    title: "Decisão humana",
    body: "A IA prepara, classifica e sinaliza. A aprovação irreversível fica do lado Lloretrans.",
    icon: UserCheck,
  },
  {
    title: "Integrações assumidas",
    body: "Ligações previstas para PHC Advanced, Logue Trans, Frotcom, Cepsa, Repsol e Radius.",
    icon: ShieldCheck,
  },
];

export default function LandingPage() {
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
          <div className="hidden h-7 w-px bg-[#e2e8f0] sm:block" />
          <div className="hidden sm:block">
            <div className="text-[10px] font-semibold uppercase tracking-[0.22em] text-[#ca742d]">
              Plataforma operacional
            </div>
            <div className="mt-1 text-xs text-[#6b7280]">Lloretrans · Grupo Patrícia Pilar</div>
          </div>
        </Link>

        <nav className="flex w-full items-center justify-end gap-3 sm:w-auto">
          <Link href="#modulos" className="hidden min-h-11 items-center text-sm text-[#4b5563] hover:text-[#1e2d3d] md:inline-flex">
            Módulos
          </Link>
          <Link href="#produto" className="hidden min-h-11 items-center text-sm text-[#4b5563] hover:text-[#1e2d3d] lg:inline-flex">
            Produto
          </Link>
          <Link href="/apresentacao" className="hidden min-h-11 items-center text-sm text-[#4b5563] hover:text-[#1e2d3d] lg:inline-flex">
            Apresentação
          </Link>
          <Button
            asChild
            size="sm"
            className="w-full border-0 bg-[#0d3b38] text-white shadow-none hover:bg-[#134f4b] sm:w-auto"
          >
            <Link href="/login">Abrir plataforma</Link>
          </Button>
        </nav>
      </header>

      <section className="relative mx-auto max-w-[1320px] px-6 pb-16 pt-10 lg:px-10 lg:pb-22 lg:pt-16">
        <div className="grid gap-12 lg:grid-cols-[1.08fr_0.92fr] lg:items-end">
          <div className="max-w-4xl">
            <h1 className="text-4xl font-semibold leading-[0.98] tracking-tight sm:text-5xl lg:text-[4.7rem]">
              A operação Lloretrans
              <span className="block text-[#0d3b38]">numa plataforma única.</span>
            </h1>
            <p className="mt-8 max-w-3xl text-lg leading-relaxed text-[#374151] lg:text-[1.15rem]">
              Quilómetros, facturas de fornecedor, documentos, combustível, bolsa de carga
              e oficina ficam ligados num ambiente comum. A plataforma trabalha com dados reais,
              preserva aprovação humana e deixa rasto auditável de cada decisão.
            </p>
            <div className="mt-8 flex flex-wrap items-center gap-3">
              <Button
                asChild
                size="lg"
                className="border-0 bg-[#0d3b38] text-white shadow-none hover:bg-[#134f4b]"
              >
                <Link href="/login">Abrir plataforma</Link>
              </Button>
              <Button
                asChild
                size="lg"
                variant="outline"
                className="border-[#cbd5e1] bg-white text-[#1e2d3d] hover:border-[#1bc88a] hover:bg-white"
              >
                <Link href="/apresentacao">Abrir apresentação executiva</Link>
              </Button>
            </div>
          </div>

          <aside className="grid gap-4 rounded-[28px] border border-[#e2e8f0] bg-white p-6 shadow-elevated-lg">
            <div className="flex items-start gap-3 border-b border-[#e2e8f0] pb-5">
              <div className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-[#1e2d3d] text-[#2ae5a0]">
                <ClipboardCheck className="h-5 w-5" />
              </div>
              <div>
                <div className="text-[10px] font-semibold uppercase tracking-[0.22em] text-[#ca742d]">
                  Princípio operacional
                </div>
                <p className="mt-2 text-2xl font-semibold leading-tight">
                  A IA prepara. A pessoa decide. O sistema regista.
                </p>
              </div>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              {PROOF.map((item) => (
                <article key={item.label} className="rounded-2xl border border-[#edf2f0] bg-[#f8fffc] p-4">
                  <div className="font-mono text-3xl font-semibold text-[#0d3b38]">{item.value}</div>
                  <div className="mt-2 text-[10px] font-semibold uppercase tracking-[0.16em] text-[#6b7280]">
                    {item.label}
                  </div>
                  <p className="mt-2 text-xs leading-relaxed text-[#4b5563]">{item.note}</p>
                </article>
              ))}
            </div>
          </aside>
        </div>
      </section>

      <section id="produto" className="relative mx-auto max-w-[1320px] px-6 pb-16 lg:px-10 lg:pb-22">
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
                Produto em ecrã
              </div>
              <h2 className="mt-4 text-3xl font-semibold leading-tight tracking-tight lg:text-4xl">
                Dados, estados e decisões visíveis.
              </h2>
              <p className="mt-4 text-base leading-relaxed text-[#4b5563]">
                As capturas são do ambiente operacional Lloretrans, com indicadores, facturas,
                cargas e validações navegáveis por perfil.
              </p>
            </div>
            <div className="grid gap-4">
              {PRODUCT_SHOTS.slice(1).map((shot) => (
                <article
                  key={shot.title}
                  className="grid gap-4 rounded-2xl border border-[#e2e8f0] bg-[#f8fffc] p-4 sm:grid-cols-[0.92fr_1.08fr]"
                >
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
              Controlo operacional
            </div>
            <h2 className="mt-5 text-4xl font-semibold leading-tight tracking-tight lg:text-5xl">
              &ldquo;Não é só tempo. A nossa preocupação também é o controlo.&rdquo;
            </h2>
          </div>
          <div className="grid gap-4 md:grid-cols-3">
            <PrincipleCard
              title="Sem decisão silenciosa"
              body="Qualquer passo irreversível precisa de aprovação humana."
              icon={UserCheck}
            />
            <PrincipleCard
              title="Rasto por acção"
              body="Utilizador, antes/depois e motivo ficam registados em cada mutação."
              icon={ClipboardCheck}
            />
            <PrincipleCard
              title="Dados separados por empresa"
              body="Permissões e documentos preparados para operação multi-empresa."
              icon={ShieldCheck}
            />
          </div>
        </div>
      </section>

      <section id="modulos" className="relative bg-white">
        <div className="mx-auto max-w-[1320px] px-6 py-16 lg:px-10 lg:py-22">
          <div className="grid gap-6 border-b border-[#e2e8f0] pb-8 lg:grid-cols-[0.9fr_1.1fr] lg:items-end">
            <div>
              <div className="text-[11px] font-semibold uppercase tracking-[0.22em] text-[#ca742d]">
                Os seis módulos
              </div>
              <h2 className="mt-4 text-4xl font-semibold leading-tight tracking-tight lg:text-5xl">
                Seis dores. Seis respostas. Operação coberta de ponta a ponta.
              </h2>
            </div>
            <p className="max-w-2xl text-base leading-relaxed text-[#4b5563]">
              Cada módulo parte de uma dor concreta da operação Lloretrans e mostra o
              que já está navegável no ambiente actual.
            </p>
          </div>

          <div className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {MODULES.map((module) => (
              <ModuleCard key={module.code} module={module} />
            ))}
          </div>
        </div>
      </section>

      <section id="confianca" className="relative border-y border-[#e2e8f0] bg-[#f0f5f4]">
        <div className="mx-auto max-w-[1320px] px-6 py-16 lg:px-10 lg:py-20">
          <div className="grid gap-10 lg:grid-cols-[0.72fr_1.28fr] lg:items-start">
            <div>
              <div className="text-[11px] font-semibold uppercase tracking-[0.22em] text-[#ca742d]">
                Confiança técnica
              </div>
              <h2 className="mt-4 text-4xl font-semibold leading-tight tracking-tight">
                Infraestrutura clara, dependências assumidas.
              </h2>
              <p className="mt-5 max-w-xl text-base leading-relaxed text-[#4b5563]">
                O sistema foi desenhado para operar com dados na União Europeia, auditoria
                por acção e integração progressiva com os sistemas já usados pela Lloretrans.
              </p>
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              {TRUST.map((item) => (
                <TrustCard key={item.title} item={item} />
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="relative mx-auto max-w-[1320px] px-6 py-16 lg:px-10 lg:py-22">
        <div className="rounded-[32px] border border-[#1e2d3d]/10 bg-[linear-gradient(135deg,#1e2d3d,#0d3b38)] px-8 py-9 text-white shadow-elevated-lg lg:px-10">
          <div className="grid gap-8 lg:grid-cols-[0.88fr_1.12fr] lg:items-end">
            <div>
              <div className="text-[11px] font-semibold uppercase tracking-[0.22em] text-[#2ae5a0]">
                Acesso à plataforma
              </div>
              <h2 className="mt-4 text-3xl font-semibold leading-tight tracking-tight lg:text-4xl">
                Abrir o ambiente e percorrer os fluxos.
              </h2>
            </div>
            <p className="text-sm leading-relaxed text-white/76">
              O acesso usa perfis operacionais. O perfil de Direcção Operacional dá
              visão consolidada das 60 viaturas, validação de quilómetros do dia e folhas
              de oficina pendentes.
            </p>
          </div>
          <div className="mt-8 flex flex-wrap items-center gap-3 border-t border-white/12 pt-6">
            <Button
              asChild
              size="lg"
              className="border-0 bg-white text-[#1e2d3d] shadow-none hover:bg-white/90"
            >
              <Link href="/login">Abrir plataforma</Link>
            </Button>
            <Button
              asChild
              size="lg"
              variant="outline"
              className="border-white/30 bg-transparent text-white hover:bg-white/10"
            >
              <Link href="/apresentacao">Abrir apresentação</Link>
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

function PrincipleCard({ title, body, icon: Icon }: { title: string; body: string; icon: LucideIcon }) {
  return (
    <article className="flex h-full flex-col rounded-2xl border border-white/12 bg-white/8 p-6">
      <Icon className="h-6 w-6 text-[#2ae5a0]" />
      <h3 className="mt-5 text-2xl font-semibold leading-snug tracking-tight">{title}</h3>
      <p className="mt-3 text-sm leading-relaxed text-white/72">{body}</p>
    </article>
  );
}

function ModuleCard({
  module,
}: {
  module: {
    code: string;
    slug: string;
    title: string;
    icon: LucideIcon;
    pain: string;
    answer: string;
  };
}) {
  const Icon = module.icon;

  return (
    <article className="flex h-full flex-col rounded-[24px] border border-[#e2e8f0] bg-[#f8fffc] p-6 shadow-elevated-sm">
      <div className="flex items-start justify-between gap-4">
        <div className="grid h-12 w-12 shrink-0 place-items-center rounded-xl bg-[#1e2d3d] text-[#2ae5a0]">
          <Icon className="h-5 w-5" />
        </div>
        <div className="font-mono text-[11px] uppercase tracking-[0.16em] text-[#6b7280]">
          Módulo {module.code}
        </div>
      </div>
      <h3 className="mt-5 text-2xl font-semibold leading-tight tracking-tight">{module.title}</h3>
      <div className="mt-5 grid gap-4 text-sm leading-relaxed">
        <div>
          <div className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[#ca742d]">Dor actual</div>
          <p className="mt-2 text-[#4b5563]">{module.pain}</p>
        </div>
        <div>
          <div className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[#0d3b38]">Resposta</div>
          <p className="mt-2 text-[#4b5563]">{module.answer}</p>
        </div>
      </div>
      <Link
        href={`/login?target=${module.slug}`}
        className="mt-auto inline-flex min-h-11 items-center pt-6 text-sm font-medium text-[#0d3b38] hover:underline"
      >
        Abrir módulo <ArrowRight className="ml-2 h-4 w-4" />
      </Link>
    </article>
  );
}

function TrustCard({ item }: { item: { title: string; body: string; icon: LucideIcon } }) {
  const Icon = item.icon;

  return (
    <article className="rounded-2xl border border-[#e2e8f0] bg-white p-6 shadow-elevated-sm">
      <Icon className="h-6 w-6 text-[#0d3b38]" />
      <h3 className="mt-5 text-2xl font-semibold leading-tight tracking-tight">{item.title}</h3>
      <p className="mt-3 text-sm leading-relaxed text-[#4b5563]">{item.body}</p>
    </article>
  );
}
