import { db } from "@/db/client";
import { vehicles, companies } from "@/db/schema";
import { eq } from "drizzle-orm";
import { requireRole } from "@/lib/auth/session";
import { PageHeader } from "@/components/ui/page-header";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default async function VehiclesPage() {
  await requireRole(["admin"]);
  const rows = await db
    .select({
      id: vehicles.id,
      plate: vehicles.plate,
      kind: vehicles.kind,
      company: companies.name,
      isInternal: vehicles.isInternal,
      hasCanbus: vehicles.hasCanbus,
      frotcomId: vehicles.frotcomId,
    })
    .from(vehicles)
    .leftJoin(companies, eq(companies.id, vehicles.companyId))
    .orderBy(vehicles.plate);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Master · Viaturas"
        description={`${rows.length} viaturas activas · origem: PHC + Frotcom`}
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
                <th>Matrícula</th>
                <th>Tipologia</th>
                <th>Empresa</th>
                <th>Interna/Externa</th>
                <th>CANBUS</th>
                <th>Frotcom ID</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((v) => (
                <tr key={v.id}>
                  <td className="font-mono">{v.plate}</td>
                  <td className="text-xs">{v.kind}</td>
                  <td>{v.company ?? "—"}</td>
                  <td>
                    <Badge variant={v.isInternal ? "default" : "secondary"}>
                      {v.isInternal ? "interna" : "externa"}
                    </Badge>
                  </td>
                  <td>
                    <Badge variant={v.hasCanbus ? "success" : "secondary"}>
                      {v.hasCanbus ? "sim" : "não"}
                    </Badge>
                  </td>
                  <td className="font-mono text-[10px] text-muted-foreground">{v.frotcomId}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
