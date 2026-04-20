export const dynamic = "force-dynamic";

import Link from "next/link";
import { db } from "@/db/client";
import { users, companies } from "@/db/schema";
import { eq } from "drizzle-orm";
import { redirect } from "next/navigation";
import { setSession } from "@/lib/auth/session";
import { ROLE_LABELS, type Role } from "@/lib/auth/types";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft } from "lucide-react";

async function loginAs(formData: FormData): Promise<void> {
  "use server";
  const userId = formData.get("userId")?.toString();
  const target = formData.get("target")?.toString();
  if (!userId) throw new Error("userId required");
  await setSession(userId);
  const allowedTargets = ["km", "ocr", "docs", "fuel", "bolsa", "oficina", "admin"];
  if (target && allowedTargets.includes(target)) {
    redirect(`/${target}`);
  }
  redirect("/dashboard");
}

const ROLE_GROUPS: { label: string; roles: Role[]; hint: string }[] = [
  { label: "Direcção e administração", roles: ["admin", "clarice"], hint: "Acesso global · dashboard + admin" },
  { label: "Comercial · bolsa de carga", roles: ["comercial"], hint: "Só MVP E · vê as suas cargas" },
  {
    label: "Administrativas Lloretrans",
    roles: ["admin_faturacao", "admin_oficina", "admin_contas"],
    hint: "Acesso por área funcional",
  },
  { label: "Operações", roles: ["digitalizacao", "mecanico"], hint: "Entrada de dados · PWA oficina" },
  { label: "Empresas do grupo (consumo)", roles: ["frutas"], hint: "Docs autorizados cross-empresa (MVP C)" },
];

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ target?: string }>;
}) {
  const { target } = await searchParams;

  const rows = await db
    .select({
      id: users.id,
      name: users.name,
      email: users.email,
      role: users.role,
      companyName: companies.name,
    })
    .from(users)
    .leftJoin(companies, eq(companies.id, users.companyId))
    .where(eq(users.active, true));

  const byRole = new Map<string, typeof rows>();
  rows.forEach((u) => {
    const cur = byRole.get(u.role) ?? [];
    cur.push(u);
    byRole.set(u.role, cur);
  });

  return (
    <main className="min-h-screen bg-[hsl(40_24%_98%)] text-[hsl(220_28%_10%)] relative overflow-hidden">
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: "radial-gradient(hsl(222 72% 15%) 1px, transparent 1px)",
          backgroundSize: "24px 24px",
        }}
      />
      <div className="pointer-events-none absolute inset-x-0 top-0 h-[400px] bg-[radial-gradient(ellipse_50%_60%_at_50%_0%,hsl(32_82%_55%/0.1),transparent_70%)]" />

      <header className="relative z-10 mx-auto max-w-[1100px] px-6 py-8 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2.5 group">
          <ArrowLeft className="h-4 w-4 text-muted-foreground group-hover:-translate-x-0.5 transition-transform" />
          <span className="text-sm text-muted-foreground group-hover:text-foreground transition-colors">
            Voltar ao site
          </span>
        </Link>
        <Link href="/" className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-md bg-[hsl(222_72%_30%)] text-white grid place-items-center font-display font-bold">
            A
          </div>
          <span className="font-display font-semibold">AiTiPro</span>
        </Link>
      </header>

      <section className="relative z-10 mx-auto max-w-[1100px] px-6 pt-8 pb-20 animate-fade-in">
        <div className="max-w-2xl mb-12">
          <Badge variant="outline" className="mb-4 text-[11px] tracking-wider uppercase">
            Acesso à demonstração
          </Badge>
          <h1 className="font-display text-4xl lg:text-5xl font-semibold leading-tight tracking-[-0.02em]">
            Escolhe a perspectiva com que <span className="italic">queres explorar</span>.
          </h1>
          <p className="mt-5 text-foreground/70 leading-relaxed">
            Cada papel vê apenas os módulos que lhe dizem respeito. Todos os dados são determinísticos —
            podes mudar de persona sem medo, a demo reinicia-se a qualquer altura.
            {target && (
              <span className="block mt-3 text-[hsl(222_72%_30%)] text-sm font-medium">
                Entrarás directamente no módulo <code className="font-mono">{target.toUpperCase()}</code>.
              </span>
            )}
          </p>
        </div>

        <div className="space-y-8">
          {ROLE_GROUPS.map((group) => {
            const usersInGroup = group.roles.flatMap((r) => byRole.get(r) ?? []);
            if (usersInGroup.length === 0) return null;
            return (
              <div key={group.label}>
                <div className="flex items-baseline justify-between mb-3 border-b border-[hsl(220_14%_88%)] pb-2">
                  <h2 className="font-display text-base font-semibold tracking-tight">{group.label}</h2>
                  <span className="text-[11px] text-muted-foreground uppercase tracking-wider">{group.hint}</span>
                </div>
                <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                  {usersInGroup.map((u) => {
                    const initials = u.name
                      .split(" ")
                      .map((n) => n[0])
                      .slice(0, 2)
                      .join("");
                    return (
                      <form key={u.id} action={loginAs}>
                        <input type="hidden" name="userId" value={u.id} />
                        {target && <input type="hidden" name="target" value={target} />}
                        <button
                          type="submit"
                          className="w-full text-left flex items-center gap-3 rounded-lg border border-[hsl(220_14%_88%)] bg-white p-3.5 hover:border-[hsl(222_72%_30%)]/40 hover:shadow-elevated-sm transition-all group"
                        >
                          <div className="h-9 w-9 rounded-full bg-gradient-to-br from-[hsl(222_72%_45%)] to-[hsl(222_72%_22%)] text-white grid place-items-center text-xs font-semibold shrink-0">
                            {initials}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="text-sm font-medium truncate">{u.name}</div>
                            <div className="text-[11px] text-muted-foreground truncate">
                              {ROLE_LABELS[u.role as Role]}
                            </div>
                          </div>
                          <span className="text-[11px] text-[hsl(222_72%_30%)] opacity-0 group-hover:opacity-100 transition-opacity">
                            →
                          </span>
                        </button>
                      </form>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>

        <div className="mt-16 pt-8 border-t border-[hsl(220_14%_88%)] text-center text-xs text-muted-foreground space-x-3">
          <span>Neon Postgres · UE Frankfurt</span>
          <span>·</span>
          <span>Vercel fra1</span>
          <span>·</span>
          <span>Audit log append-only</span>
          <span>·</span>
          <span>RGPD by default</span>
        </div>
      </section>
    </main>
  );
}
