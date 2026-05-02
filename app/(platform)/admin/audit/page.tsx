import { db } from "@/db/client";
import { auditLog, users } from "@/db/schema";
import { desc, eq, and, like } from "drizzle-orm";
import { requireRole } from "@/lib/auth/session";
import { PageHeader } from "@/components/ui/page-header";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { formatDateTime } from "@/lib/dates";
import Link from "next/link";

export default async function AuditLogPage({
  searchParams,
}: {
  searchParams: Promise<{ action?: string; entity?: string }>;
}) {
  await requireRole(["admin"]);
  const { action, entity } = await searchParams;

  const conditions = [];
  if (action) conditions.push(like(auditLog.action, `%${action}%`));
  if (entity) conditions.push(eq(auditLog.entityType, entity));

  const rows = await db
    .select({
      id: auditLog.id,
      action: auditLog.action,
      entityType: auditLog.entityType,
      entityId: auditLog.entityId,
      before: auditLog.before,
      after: auditLog.after,
      reason: auditLog.reason,
      createdAt: auditLog.createdAt,
      userName: users.name,
    })
    .from(auditLog)
    .leftJoin(users, eq(users.id, auditLog.userId))
    .where(conditions.length ? and(...conditions) : undefined)
    .orderBy(desc(auditLog.createdAt))
    .limit(200);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Registo de auditoria"
        description={`Registo inviolável · ${rows.length} entradas mostradas · base para RGPD`}
        actions={
          <Button variant="outline" asChild>
            <Link href="/admin">Administração</Link>
          </Button>
        }
      />

      <form className="flex gap-2">
        <Input name="action" placeholder="Filtro acção (ex: invoice.approve)" defaultValue={action} />
        <Input name="entity" placeholder="Entidade (ex: invoice)" defaultValue={entity} />
        <Button type="submit" variant="outline">
          Filtrar
        </Button>
      </form>

      <Card>
        <div className="overflow-x-auto">
          <table className="data-table">
            <thead>
              <tr>
                <th>Quando</th>
                <th>Quem</th>
                <th>Acção</th>
                <th>Entidade · id</th>
                <th>Antes / Depois</th>
                <th>Motivo</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((a) => (
                <tr key={a.id}>
                  <td className="text-xs whitespace-nowrap">{formatDateTime(a.createdAt)}</td>
                  <td className="whitespace-nowrap">{a.userName ?? "—"}</td>
                  <td className="font-mono text-xs">{a.action}</td>
                  <td className="text-xs">
                    <div>{a.entityType}</div>
                    <div className="font-mono text-[10px] text-muted-foreground">{a.entityId}</div>
                  </td>
                  <td className="text-xs font-mono max-w-md">
                    {a.before && <div className="text-muted-foreground truncate">{a.before.slice(0, 80)}</div>}
                    {a.after && <div className="text-foreground truncate">{a.after.slice(0, 80)}</div>}
                  </td>
                  <td className="text-xs">{a.reason ?? "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
