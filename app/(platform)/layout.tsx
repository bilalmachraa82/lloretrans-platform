export const dynamic = "force-dynamic";

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
} from "lucide-react";
import { cn } from "@/lib/utils";

const MVPS = [
  { slug: "km", title: "MVP A · Validação km", icon: TruckIcon, href: "/km" },
  { slug: "ocr", title: "MVP B · OCR Facturas", icon: ReceiptText, href: "/ocr" },
  { slug: "docs", title: "MVP C · Docs Centrais", icon: FileStack, href: "/docs" },
  { slug: "fuel", title: "MVP D · Combustível", icon: Fuel, href: "/fuel" },
  { slug: "bolsa", title: "MVP E · Bolsa de Carga", icon: PackageSearch, href: "/bolsa" },
  { slug: "oficina", title: "MVP F · Oficina (PWA)", icon: Wrench, href: "/oficina" },
];

async function logout(): Promise<void> {
  "use server";
  await clearSession();
  redirect("/");
}

export default async function PlatformLayout({ children }: { children: React.ReactNode }) {
  const session = await getSession();
  if (!session) redirect("/login");

  const available = MVPS.filter((m) => canAccessMvp(session.role, m.slug));
  const adminAccess = canAccessMvp(session.role, "admin");

  const sidebarContent = (
    <>
      <Link href="/" className="flex items-center gap-2 px-2">
        <div className="h-8 w-8 rounded-md bg-primary text-primary-foreground grid place-items-center font-bold">L</div>
        <div>
          <div className="text-sm font-semibold">Lloretrans</div>
          <div className="text-[11px] text-muted-foreground -mt-0.5">AiTiPro Platform</div>
        </div>
      </Link>
      <nav className="mt-8 space-y-1">
        <SidebarLink href="/dashboard" icon={LayoutDashboard}>
          Dashboard
        </SidebarLink>
        <div className="mt-4 mb-2 px-2 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
          MVPs
        </div>
        {available.map((m) => (
          <SidebarLink key={m.slug} href={m.href} icon={m.icon}>
            {m.title}
          </SidebarLink>
        ))}
        {adminAccess && (
          <>
            <div className="mt-4 mb-2 px-2 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
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
      <aside className="hidden lg:flex w-64 border-r border-border bg-card px-4 py-6 flex-col shrink-0">
        {sidebarContent}
      </aside>

      <main className="flex-1 min-w-0 overflow-auto bg-background">
        <header className="sticky top-0 z-20 flex items-center justify-between border-b border-border bg-background/85 backdrop-blur px-4 sm:px-8 py-3 gap-3">
          <div className="flex items-center gap-3">
            <details className="lg:hidden relative">
              <summary className="list-none cursor-pointer rounded-md border border-border bg-background p-2 hover:bg-secondary">
                <Menu className="h-4 w-4" />
              </summary>
              <div className="absolute left-0 top-full mt-2 w-72 rounded-lg border border-border bg-card shadow-elevated-lg p-4 flex flex-col max-h-[calc(100vh-80px)] overflow-auto">
                {sidebarContent}
              </div>
            </details>
            <Badge variant="outline" className="text-[10px] whitespace-nowrap">
              {process.env.USE_LIVE_APIS === "true" ? "APIs Live" : "Stub · dados sintéticos"}
            </Badge>
            <span className="hidden md:inline text-xs text-muted-foreground">Ambiente de demonstração</span>
          </div>
          <div className="hidden sm:block text-xs text-muted-foreground">
            RGPD · dados UE · auditoria append-only
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
        "flex items-center gap-2 rounded-md px-2 py-1.5 text-sm text-foreground/80 hover:bg-secondary hover:text-foreground transition-colors",
      )}
    >
      <Icon className="h-4 w-4" />
      {children}
    </Link>
  );
}
