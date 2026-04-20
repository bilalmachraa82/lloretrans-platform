export const dynamic = "force-dynamic";

import { db } from "@/db/client";
import { users, companies } from "@/db/schema";
import { eq } from "drizzle-orm";
import { redirect } from "next/navigation";
import { setSession } from "@/lib/auth/session";
import { ROLE_LABELS, type Role } from "@/lib/auth/types";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

async function loginAs(formData: FormData): Promise<void> {
  "use server";
  const userId = formData.get("userId")?.toString();
  if (!userId) throw new Error("userId required");
  await setSession(userId);
  redirect("/");
}

const ROLE_ORDER: Role[] = [
  "admin",
  "clarice",
  "comercial",
  "admin_faturacao",
  "admin_oficina",
  "admin_contas",
  "digitalizacao",
  "mecanico",
  "frutas",
];

export default async function LoginPage() {
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
  const ordered = ROLE_ORDER.flatMap((r) => byRole.get(r) ?? []);

  return (
    <main className="min-h-screen hero-gradient relative overflow-hidden">
      <div className="absolute inset-0 pointer-events-none bg-[linear-gradient(to_bottom,transparent_0%,hsl(var(--background))_80%)]" />
      <div className="relative z-10 flex min-h-screen items-center justify-center py-16 px-4">
        <div className="w-full max-w-4xl space-y-10">
          <div className="text-center space-y-4">
            <Badge variant="outline" className="mx-auto">
              Demo · AiTiPro × Lloretrans
            </Badge>
            <h1 className="font-display text-5xl font-semibold tracking-tight leading-tight">
              Plataforma dos <span className="text-primary">6 MVPs</span>
            </h1>
            <p className="text-base text-muted-foreground max-w-2xl mx-auto leading-relaxed">
              Ambiente de demonstração com dados sintéticos + 9 facturas reais Lloretrans.
              Escolhe o papel com que queres entrar. Cada papel vê os módulos que lhe dizem respeito.
            </p>
          </div>

          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {ordered.map((u) => {
              const initials = u.name
                .split(" ")
                .map((n) => n[0])
                .slice(0, 2)
                .join("");
              return (
                <form key={u.id} action={loginAs}>
                  <input type="hidden" name="userId" value={u.id} />
                  <Card className="h-full transition-all hover:border-primary/50 hover:shadow-elevated cursor-pointer group">
                    <CardHeader className="space-y-2">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-full bg-gradient-to-br from-primary/20 to-primary/5 text-primary grid place-items-center text-sm font-semibold border border-primary/10">
                          {initials}
                        </div>
                        <div className="flex-1 min-w-0">
                          <CardTitle className="text-base truncate">{u.name}</CardTitle>
                          <CardDescription className="text-xs truncate">{u.companyName ?? "—"}</CardDescription>
                        </div>
                      </div>
                      <Badge variant="secondary" className="w-fit text-[10px]">
                        {ROLE_LABELS[u.role as Role]}
                      </Badge>
                    </CardHeader>
                    <CardContent>
                      <Button type="submit" variant="outline" className="w-full group-hover:border-primary/40">
                        Entrar
                      </Button>
                    </CardContent>
                  </Card>
                </form>
              );
            })}
          </div>

          <div className="text-center text-xs text-muted-foreground">
            Dados em Neon Postgres (UE · Frankfurt) · Deploy Vercel fra1 · RGPD by default
          </div>
        </div>
      </div>
    </main>
  );
}
