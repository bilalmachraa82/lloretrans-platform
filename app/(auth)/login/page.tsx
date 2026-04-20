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

interface SpotlightPersona {
  email: string;
  label: string;
  summary: string;
  angle: string;
}

const SPOTLIGHT_PERSONAS: SpotlightPersona[] = [
  {
    email: "clarice@lloretrans.pt",
    label: "Clarice Santos",
    summary: "Direcção Operacional · visão global",
    angle:
      "Entra no dashboard com as 60 viaturas, validação km do dia e folhas de oficina a validar.",
  },
  {
    email: "eder@lloretrans.pt",
    label: "Éder",
    summary: "Comercial · bolsa de carga",
    angle:
      "Só vê o MVP E. 240 cargas, state machine do ciclo completo, comissão automática por linha.",
  },
  {
    email: "joao.oliveira@lloretrans.pt",
    label: "João Oliveira",
    summary: "Mecânico · PWA oficina",
    angle:
      "PWA mobile com wizard em 6 passos. Assinatura canvas. Offline-first. Demora < 3 min.",
  },
];

const OTHER_GROUPS: { label: string; roles: Role[]; hint: string }[] = [
  { label: "Direcção & admin AiTiPro", roles: ["admin"], hint: "Acesso global · sem restrições" },
  {
    label: "Administrativas Lloretrans",
    roles: ["admin_faturacao", "admin_oficina", "admin_contas"],
    hint: "Por área funcional",
  },
  { label: "Operações & grupo", roles: ["digitalizacao", "frutas"], hint: "Digitalização central + empresas consumidoras" },
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

  const byEmail = new Map(rows.map((u) => [u.email, u] as const));
  const spotlightUsers = SPOTLIGHT_PERSONAS.map((p) => ({
    persona: p,
    user: byEmail.get(p.email) ?? null,
  })).filter((entry): entry is { persona: SpotlightPersona; user: NonNullable<typeof entry.user> } => Boolean(entry.user));
  const spotlightIds = new Set(spotlightUsers.map((s) => s.user.id));

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
        <div className="max-w-2xl mb-10">
          <Badge variant="outline" className="mb-4 text-[11px] tracking-wider uppercase">
            Acesso à demonstração
          </Badge>
          <h1 className="font-display text-4xl lg:text-5xl font-semibold leading-tight tracking-[-0.02em]">
            Escolhe a perspectiva com que <span className="italic">queres explorar</span>.
          </h1>
          <p className="mt-5 text-foreground/70 leading-relaxed">
            Três personas principais cobrem 90% da demo. Cada papel vê apenas os módulos que lhe
            dizem respeito. Dados determinísticos — podes mudar de persona à vontade.
            {target && (
              <span className="block mt-3 text-[hsl(222_72%_30%)] text-sm font-medium">
                Entrarás directamente no módulo <code className="font-mono">{target.toUpperCase()}</code>.
              </span>
            )}
          </p>
        </div>

        {/* 3 personas destacadas */}
        {spotlightUsers.length > 0 && (
          <div className="mb-12">
            <div className="flex items-baseline justify-between mb-3">
              <h2 className="font-display text-sm font-semibold tracking-[0.05em] uppercase text-[hsl(32_82%_45%)]">
                Personas principais
              </h2>
              <span className="text-[11px] text-muted-foreground uppercase tracking-wider">Começa por aqui</span>
            </div>
            <div className="grid gap-3 md:grid-cols-3">
              {spotlightUsers.map(({ persona, user }) => {
                const initials = user.name
                  .split(" ")
                  .map((n) => n[0])
                  .slice(0, 2)
                  .join("");
                return (
                  <form key={user.id} action={loginAs}>
                    <input type="hidden" name="userId" value={user.id} />
                    {target && <input type="hidden" name="target" value={target} />}
                    <button
                      type="submit"
                      className="w-full h-full text-left rounded-xl border border-[hsl(220_14%_88%)] bg-white p-5 hover:border-[hsl(222_72%_30%)]/50 hover:shadow-elevated-lg transition-all group relative overflow-hidden"
                    >
                      <div
                        className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-[hsl(32_82%_55%)] via-[hsl(32_82%_65%)] to-[hsl(222_72%_38%)]"
                      />
                      <div className="flex items-start gap-3 mb-4">
                        <div className="h-11 w-11 rounded-full bg-gradient-to-br from-[hsl(222_72%_45%)] to-[hsl(222_72%_22%)] text-white grid place-items-center text-sm font-semibold shrink-0">
                          {initials}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="font-display text-base font-semibold leading-tight">{persona.label}</div>
                          <div className="text-[11px] text-muted-foreground mt-0.5">{persona.summary}</div>
                        </div>
                      </div>
                      <p className="text-sm text-foreground/75 leading-relaxed">{persona.angle}</p>
                      <div className="mt-4 pt-4 border-t border-[hsl(220_14%_92%)] flex items-center justify-between">
                        <span className="text-[11px] font-mono uppercase tracking-wider text-muted-foreground">
                          {ROLE_LABELS[user.role as Role]}
                        </span>
                        <span className="text-xs text-[hsl(222_72%_30%)] font-medium opacity-0 group-hover:opacity-100 transition-opacity">
                          Entrar →
                        </span>
                      </div>
                    </button>
                  </form>
                );
              })}
            </div>
          </div>
        )}

        {/* Outros perfis em details/summary */}
        <details className="group rounded-lg border border-[hsl(220_14%_88%)] bg-white/60">
          <summary className="list-none cursor-pointer flex items-center justify-between px-5 py-4 hover:bg-white transition-colors rounded-lg">
            <div>
              <div className="font-display text-sm font-semibold">Outros perfis</div>
              <div className="text-[11px] text-muted-foreground mt-0.5">9 papéis adicionais para cenários específicos</div>
            </div>
            <span className="text-[hsl(222_72%_30%)] text-lg font-semibold transition-transform group-open:rotate-45 leading-none">+</span>
          </summary>
          <div className="border-t border-[hsl(220_14%_92%)] px-5 py-6 space-y-6">
            {OTHER_GROUPS.map((group) => {
              const usersInGroup = group.roles
                .flatMap((r) => byRole.get(r) ?? [])
                .filter((u) => !spotlightIds.has(u.id));
              if (usersInGroup.length === 0) return null;
              return (
                <div key={group.label}>
                  <div className="flex items-baseline justify-between mb-2 border-b border-[hsl(220_14%_88%)] pb-1.5">
                    <h3 className="font-display text-[13px] font-semibold tracking-tight">{group.label}</h3>
                    <span className="text-[10px] text-muted-foreground uppercase tracking-wider">{group.hint}</span>
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
                            className="w-full text-left flex items-center gap-3 rounded-lg border border-[hsl(220_14%_90%)] bg-white p-3 hover:border-[hsl(222_72%_30%)]/40 hover:shadow-elevated-sm transition-all group/item"
                          >
                            <div className="h-8 w-8 rounded-full bg-gradient-to-br from-[hsl(222_72%_45%)] to-[hsl(222_72%_22%)] text-white grid place-items-center text-[11px] font-semibold shrink-0">
                              {initials}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="text-[13px] font-medium truncate">{u.name}</div>
                              <div className="text-[10px] text-muted-foreground truncate">{ROLE_LABELS[u.role as Role]}</div>
                            </div>
                          </button>
                        </form>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </details>

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
