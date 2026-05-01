import { db } from "@/db/client";
import { suppliers, supplierRules } from "@/db/schema";
import { count } from "drizzle-orm";
import { requireRole } from "@/lib/auth/session";
import { PageHeader } from "@/components/ui/page-header";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default async function SuppliersPage() {
  await requireRole(["admin"]);

  const rows = await db.select().from(suppliers).orderBy(suppliers.name);
  const ruleCounts = await db
    .select({ supplierId: supplierRules.supplierId, n: count() })
    .from(supplierRules)
    .groupBy(supplierRules.supplierId);

  const byId = new Map<string, number>();
  ruleCounts.forEach((r) => byId.set(r.supplierId, r.n));

  return (
    <div className="space-y-6">
      <PageHeader
        title="Master · Fornecedores"
        description="OCR suppliers são fornecedores de facturas; transportadores do Excel são carriers do MVP E; LLORETRANS interno não é fornecedor externo."
        actions={
          <Button variant="outline" asChild>
            <Link href="/admin">← Admin</Link>
          </Button>
        }
      />
      <Card>
        <div className="overflow-x-auto">
          <table className="data-table">
            <thead>
              <tr>
                <th>Nome</th>
                <th>NIF</th>
                <th>Categoria</th>
                <th>Serviço default</th>
                <th>Obra default</th>
                <th>Regras aprendidas</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((s) => (
                <tr key={s.id}>
                  <td className="font-medium">{s.name}</td>
                  <td className="font-mono text-xs">{s.taxId}</td>
                  <td className="text-xs">{s.category ?? "—"}</td>
                  <td className="font-mono text-xs">{s.defaultServiceCode ?? "—"}</td>
                  <td className="font-mono text-xs">{s.defaultWorkCode ?? "—"}</td>
                  <td>
                    <Badge variant="secondary">{byId.get(s.id) ?? 0}</Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
