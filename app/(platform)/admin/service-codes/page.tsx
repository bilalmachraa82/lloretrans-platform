import { db } from "@/db/client";
import { serviceCodes, workCodes, companies } from "@/db/schema";
import { eq } from "drizzle-orm";
import { requireRole } from "@/lib/auth/session";
import { PageHeader } from "@/components/ui/page-header";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";

export default async function CodesPage() {
  await requireRole(["admin"]);
  const [svc, wrk] = await Promise.all([
    db.select().from(serviceCodes).orderBy(serviceCodes.code),
    db
      .select({
        code: workCodes.code,
        label: workCodes.label,
        scope: workCodes.scope,
        company: companies.name,
      })
      .from(workCodes)
      .leftJoin(companies, eq(companies.id, workCodes.companyId))
      .orderBy(workCodes.code),
  ]);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Master · Códigos"
        description="Serviço + obra · usado por MVPs B (OCR), E (bolsa), F (oficina)"
        actions={
          <Button variant="outline" asChild>
            <Link href="/admin">← Admin</Link>
          </Button>
        }
      />

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Códigos de serviço ({svc.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <table className="data-table">
              <thead>
                <tr>
                  <th>Código</th>
                  <th>Rótulo</th>
                  <th>Tipo</th>
                </tr>
              </thead>
              <tbody>
                {svc.map((s) => (
                  <tr key={s.code}>
                    <td className="font-mono">{s.code}</td>
                    <td>
                      <div className="font-medium">{s.label}</div>
                      <div className="text-xs text-muted-foreground">{s.description}</div>
                    </td>
                    <td>
                      <Badge variant="secondary">{s.kind}</Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Códigos de obra ({wrk.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <table className="data-table">
              <thead>
                <tr>
                  <th>Código</th>
                  <th>Rótulo</th>
                  <th>Âmbito</th>
                  <th>Empresa</th>
                </tr>
              </thead>
              <tbody>
                {wrk.map((w) => (
                  <tr key={w.code}>
                    <td className="font-mono text-xs">{w.code}</td>
                    <td>{w.label}</td>
                    <td>
                      <Badge variant={w.scope === "internal" ? "default" : "secondary"}>{w.scope}</Badge>
                    </td>
                    <td className="text-xs">{w.company ?? "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
