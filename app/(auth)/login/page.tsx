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

  return (
    <main className="min-h-screen bg-secondary/40 flex items-center justify-center py-12 px-4">
      <div className="w-full max-w-3xl space-y-6">
        <div className="text-center space-y-2">
          <Badge variant="outline" className="mx-auto">Demo · AiTiPro × Lloretrans</Badge>
          <h1 className="text-3xl font-semibold tracking-tight">Entrar na plataforma</h1>
          <p className="text-sm text-muted-foreground max-w-lg mx-auto">
            Ambiente de demonstração com dados sintéticos + 9 facturas reais. Escolhe o papel com que queres entrar.
            Cada papel vê apenas os módulos que lhe dizem respeito (regras da coluna <span className="font-mono">MVP_ACCESS</span>).
          </p>
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          {rows.map((u) => (
            <form key={u.id} action={loginAs}>
              <input type="hidden" name="userId" value={u.id} />
              <Card className="hover:border-primary/60 transition-colors">
                <CardHeader>
                  <CardTitle className="text-base">{u.name}</CardTitle>
                  <CardDescription>
                    {ROLE_LABELS[u.role as Role]} · {u.companyName ?? "—"}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Button type="submit" className="w-full" variant="outline">
                    Entrar como {u.name.split(" ")[0]}
                  </Button>
                </CardContent>
              </Card>
            </form>
          ))}
        </div>
      </div>
    </main>
  );
}
