export const dynamic = "force-dynamic";

import Image from "next/image";
import { redirect } from "next/navigation";
import Link from "next/link";
import { getSession, clearSession } from "@/lib/auth/session";
import { ROLE_LABELS, canAccessMvp } from "@/lib/auth/types";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  LayoutDashboard,
  TruckIcon,
  ReceiptText,
  FileStack,
  Fuel,
  PackageSearch,
  Wrench,
  Settings,
  LogOut,
  Menu,
  Smartphone,
  Users,
  FileText,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface MvpEntry {
  slug: string;
  letter: string;
  title: string;
  tagline: string;
  icon: React.ComponentType<{ className?: string }>;
  href: string;
}

const MVPS: MvpEntry[] = [
  { slug: "km", letter: "A", title: "Validação km", tagline: "Logue Trans × Frotcom", icon: TruckIcon, href: "/km" },
  { slug: "ocr", letter: "B", title: "Facturas de fornecedor", tagline: "Leitura · PHC Advanced", icon: ReceiptText, href: "/ocr" },
  { slug: "docs", letter: "C", title: "Documentos centrais", tagline: "CMR · guias · tickets", icon: FileStack, href: "/docs" },
  { slug: "fuel", letter: "D", title: "Combustível", tagline: "Cepsa · Repsol · Radius · bomba", icon: Fuel, href: "/fuel" },
  { slug: "bolsa", letter: "E", title: "Bolsa de carga", tagline: "Estados · comissões", icon: PackageSearch, href: "/bolsa" },
  { slug: "oficina", letter: "F", title: "Oficina", tagline: "Mecânico · aplicação móvel", icon: Wrench, href: "/oficina" },
];

async function logout(): Promise<void> {
  "use server";
  await clearSession();
  redirect("/");
}

export default async function PlatformLayout({ children }: { children: React.ReactNode }) {
  const session = await getSession();
  if (!session) redirect("/login");

  const isDemoSupervisor = session.role === "admin" || session.role === "clarice";
  const available = MVPS.filter((m) => canAccessMvp(session.role, m.slug));
  const adminAccess = canAccessMvp(session.role, "admin");

  const sidebarContent = (
    <>
      <Link href="/" className="flex min-h-11 items-center gap-3 px-2">
        <Image src="/aitipro-logo-light.png" alt="AiTiPro" width={132} height={30} className="h-6 w-auto" priority />
        <div>
          <div className="text-sm font-semibold">Lloretrans</div>
          <div className="text-[11px] text-muted-foreground -mt-0.5">Plataforma AiTiPro</div>
        </div>
      </Link>

      <nav className="mt-8 space-y-1">
        <SidebarLink href="/dashboard" icon={LayoutDashboard}>
          Painel
        </SidebarLink>

        {isDemoSupervisor ? (
          <>
            <div className="mt-5 mb-2 flex items-baseline justify-between px-2">
              <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                Operação Lloretrans
              </span>
              <span className="text-[9px] text-[hsl(32_82%_35%)] uppercase tracking-wider font-semibold">
                6 módulos
              </span>
            </div>
            {MVPS.map((m, i) => (
              <SidebarJourneyLink
                key={m.slug}
                href={m.href}
                icon={m.icon}
                letter={m.letter}
                step={i + 1}
                title={m.title}
                tagline={m.tagline}
              />
            ))}

            <div className="mt-5 mb-2 px-2 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
              Atalhos
            </div>
            <SidebarLink href="/oficina/new" icon={Smartphone}>
              Abrir folha de obra piloto
            </SidebarLink>
            <SidebarLink href="/login" icon={Users}>
              Trocar perfil demo
            </SidebarLink>
            {session.role === "admin" ? (
              <SidebarLink href="/proposta" icon={FileText}>
                Ver proposta formal
              </SidebarLink>
            ) : (
              <SidebarLink href="/apresentacao" icon={FileText}>
                Apresentação da plataforma
              </SidebarLink>
            )}
          </>
        ) : (
          <>
            <div className="mt-4 mb-2 px-2 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
              Módulos
            </div>
            {available.map((m) => (
              <SidebarLink key={m.slug} href={m.href} icon={m.icon}>
                Módulo {m.letter} · {m.title}
              </SidebarLink>
            ))}
          </>
        )}

        {adminAccess && (
          <>
            <div className="mt-5 mb-2 px-2 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
              Admin
            </div>
            <SidebarLink href="/admin" icon={Settings}>
              Masters & Audit
            </SidebarLink>
          </>
        )}
      </nav>

      <div className="mt-auto space-y-3 pt-6">
        <div className="rounded-md bg-secondary p-3">
          <div className="text-xs font-semibold">{session.userName}</div>
          <div className="text-[11px] text-muted-foreground">{ROLE_LABELS[session.role]}</div>
          <div className="mt-1 text-[11px] text-muted-foreground">{session.companyName}</div>
        </div>
        <form action={logout}>
          <Button type="submit" variant="outline" className="w-full">
            <LogOut className="h-4 w-4" />
            Sair
          </Button>
        </form>
      </div>
    </>
  );

  return (
    <div className="flex min-h-screen">
      <aside className="hidden lg:flex w-72 border-r border-border bg-card px-4 py-6 flex-col shrink-0">
        {sidebarContent}
      </aside>

      <main className="flex-1 min-w-0 overflow-auto bg-background">
        {isDemoSupervisor && (
          <div className="border-b border-[hsl(32_82%_55%)]/30 bg-[hsl(40_40%_96%)]">
            <div className="px-4 sm:px-8 py-2 flex items-center gap-3 text-[11px] flex-wrap">
              <Badge className="bg-[hsl(32_82%_55%)] text-[hsl(222_72%_12%)] border-0 text-[10px]">
                Demo validada
              </Badge>
              <span className="text-foreground/70">
                Dados importados do pacote AITIPRO/Eder · 26 ficheiros · produção depende de PHC Advanced, Frotcom e Logue Trans.
              </span>
              <Link
                href="/oficina/new"
                className="inline-flex min-h-11 items-center text-[hsl(222_72%_30%)] font-medium hover:underline"
              >
                Abrir folha de obra piloto
              </Link>
              <Link href="/login" className="inline-flex min-h-11 items-center text-[hsl(222_72%_30%)] font-medium hover:underline">
                Trocar perfil demo
              </Link>
            </div>
          </div>
        )}

        <header className="sticky top-0 z-20 flex items-center justify-between border-b border-border bg-background/85 backdrop-blur px-4 sm:px-8 py-3 gap-3">
          <div className="flex items-center gap-3">
            <details className="lg:hidden relative">
              <summary
                className="list-none cursor-pointer rounded-md border border-border bg-background p-2 hover:bg-secondary"
                aria-label="Abrir menu de navegação"
              >
                <Menu className="h-4 w-4" />
              </summary>
              <div className="absolute left-0 top-full mt-2 w-[calc(100vw-2rem)] max-w-80 rounded-lg border border-border bg-card shadow-elevated-lg p-4 flex flex-col max-h-[calc(100vh-80px)] overflow-auto">
                {sidebarContent}
              </div>
            </details>
            <Badge variant="outline" className="text-[10px] whitespace-nowrap">
              {process.env.USE_LIVE_APIS === "true" ? "Modo produção" : "Modo validação"}
            </Badge>
            <span className="hidden md:inline text-xs text-muted-foreground">
              Fontes reais carregadas · integrações por activar
            </span>
          </div>
          <div className="hidden sm:block text-xs text-muted-foreground">
            RGPD · dados UE · registo de auditoria
          </div>
        </header>
        <div className="px-4 sm:px-8 py-6 max-w-[1600px]">{children}</div>
      </main>
    </div>
  );
}

function SidebarLink({
  href,
  icon: Icon,
  children,
}: {
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      className={cn(
        "flex min-h-11 items-center gap-2 rounded-md px-2 py-1.5 text-sm text-foreground/80 hover:bg-secondary hover:text-foreground transition-colors",
      )}
    >
      <Icon className="h-4 w-4" />
      {children}
    </Link>
  );
}

function SidebarJourneyLink({
  href,
  icon: Icon,
  letter,
  step,
  title,
  tagline,
}: {
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  letter: string;
  step: number;
  title: string;
  tagline: string;
}) {
  return (
    <Link
      href={href}
      className="group flex min-h-11 items-start gap-2.5 rounded-md px-2 py-2 text-sm text-foreground/85 hover:bg-secondary transition-colors"
    >
      <div className="relative shrink-0">
        <div className="h-7 w-7 rounded-md bg-[hsl(222_72%_30%)]/8 text-[hsl(222_72%_30%)] grid place-items-center group-hover:bg-[hsl(222_72%_30%)]/15 transition-colors">
          <Icon className="h-3.5 w-3.5" />
        </div>
        <span className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-[hsl(32_82%_55%)] text-[hsl(222_72%_12%)] text-[9px] font-mono font-bold grid place-items-center">
          {step}
        </span>
      </div>
      <div className="flex-1 min-w-0 leading-tight">
        <div className="text-[13px] font-medium flex items-baseline gap-1.5">
          <span className="text-muted-foreground font-mono text-[10px]">{letter}</span>
          <span>{title}</span>
        </div>
        <div className="text-[10px] text-muted-foreground truncate">{tagline}</div>
      </div>
    </Link>
  );
}
