import Link from "next/link";
import { db } from "@/db/client";
import { auditLog, users, vehicles, suppliers, featureFlags } from "@/db/schema";
import { desc, count, eq } from "drizzle-orm";
import { requireRole } from "@/lib/auth/session";
import { PageHeader } from "@/components/ui/page-header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatDateTime } from "@/lib/dates";
import { Users, TruckIcon, Building2, SlidersHorizontal } from "lucide-react";

export default async function AdminPage() {
  await requireRole(["admin"]);

  const [[vehicleCount], [supplierCount], [userCount], recentAudits, flags] = await Promise.all([
    db.select({ n: count() }).from(vehicles).where(eq(vehicles.active, true)),
    db.select({ n: count() }).from(suppliers),
    db.select({ n: count() }).from(users).where(eq(users.active, true)),
    db
      .select({
        id: auditLog.id,
        action: auditLog.action,
        entityType: auditLog.entityType,
        entityId: auditLog.entityId,
        reason: auditLog.reason,
        createdAt: auditLog.createdAt,
        userName: users.name,
      })
      .from(auditLog)
      .leftJoin(users, eq(users.id, auditLog.userId))
      .orderBy(desc(auditLog.createdAt))
      .limit(25),
    db.select().from(featureFlags),
  ]);

  return (
    <div className="space-y-8">
      <PageHeader
        title="Administração técnica"
        description="Dados mestres, utilizadores, parâmetros operacionais e registo de auditoria. Acesso restrito."
      />

      <div className="grid gap-4 sm:grid-cols-3">
        <Card>
          <CardContent className="p-5 flex items-start gap-3">
            <TruckIcon className="h-8 w-8 text-primary" />
            <div>
              <div className="text-xs text-muted-foreground">Viaturas activas</div>
              <div className="text-2xl font-semibold font-mono">{vehicleCount?.n ?? 0}</div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-5 flex items-start gap-3">
            <Building2 className="h-8 w-8 text-primary" />
            <div>
              <div className="text-xs text-muted-foreground">Fornecedores</div>
              <div className="text-2xl font-semibold font-mono">{supplierCount?.n ?? 0}</div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-5 flex items-start gap-3">
            <Users className="h-8 w-8 text-primary" />
            <div>
              <div className="text-xs text-muted-foreground">Utilizadores activos</div>
              <div className="text-2xl font-semibold font-mono">{userCount?.n ?? 0}</div>
            </div>
          </CardContent>
        </Card>
      </div>

      <section>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide flex items-center gap-2">
            <SlidersHorizontal className="h-4 w-4" />
            Parâmetros operacionais
          </h2>
          <Button variant="outline" size="sm" asChild>
            <Link href="/admin/flags">Gerir</Link>
          </Button>
        </div>
        <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
          {flags.map((f) => (
            <div key={f.key} className="flex items-center justify-between rounded-md border border-border bg-card px-3 py-2">
              <div>
                <div className="font-mono text-xs">{f.key}</div>
                <div className="text-xs text-muted-foreground">{f.description}</div>
              </div>
              <Badge variant={f.enabled ? "success" : "secondary"}>{f.enabled ? "Activo" : "Inactivo"}</Badge>
            </div>
          ))}
        </div>
      </section>

      <section>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
            Registo de auditoria · últimas 25 acções
          </h2>
          <Button variant="outline" size="sm" asChild>
            <Link href="/admin/audit">Ver tudo</Link>
          </Button>
        </div>
        <Card>
          <div className="overflow-x-auto">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Quando</th>
                  <th>Quem</th>
                  <th>Acção</th>
                  <th>Entidade</th>
                  <th>ID</th>
                  <th>Motivo</th>
                </tr>
              </thead>
              <tbody>
                {recentAudits.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="text-center text-muted-foreground py-6">
                      Sem entradas ainda. As acções relevantes aparecem aqui assim que a equipa usa os módulos.
                    </td>
                  </tr>
                ) : (
                  recentAudits.map((a) => (
                    <tr key={a.id}>
                      <td className="text-xs text-muted-foreground">{formatDateTime(a.createdAt)}</td>
                      <td>{a.userName ?? "—"}</td>
                      <td className="font-mono text-xs">{a.action}</td>
                      <td className="text-xs">{a.entityType}</td>
                      <td className="font-mono text-[10px] text-muted-foreground">{a.entityId}</td>
                      <td className="text-xs">{a.reason ?? "—"}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </Card>
      </section>

      <section>
        <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-3">
          Outros masters
        </h2>
        <div className="grid gap-3 sm:grid-cols-3">
          <AdminLink href="/admin/vehicles" title="Viaturas" description="Matrículas, tipologia, empresa, Frotcom" />
          <AdminLink href="/admin/suppliers" title="Fornecedores" description="NIF, regras aprendidas, categoria" />
          <AdminLink href="/admin/service-codes" title="Códigos de serviço" description="S1-S9 externos · L1-L8 internos · I0-I9 operações internas" />
        </div>
      </section>
    </div>
  );
}

function AdminLink({ href, title, description }: { href: string; title: string; description: string }) {
  return (
    <Link href={href} className="group">
      <Card className="h-full transition-colors group-hover:border-primary/60">
        <CardHeader>
          <CardTitle className="text-base">{title}</CardTitle>
          <CardDescription>{description}</CardDescription>
        </CardHeader>
      </Card>
    </Link>
  );
}
