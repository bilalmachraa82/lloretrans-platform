import { db } from "@/db/client";
import { vehicles, companies } from "@/db/schema";
import { eq } from "drizzle-orm";
import { requireRole } from "@/lib/auth/session";
import { PageHeader } from "@/components/ui/page-header";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import fs from "node:fs";
import path from "node:path";

interface VehicleFixture {
  plate: string;
  source: string;
  companyRaw: string | null;
  driverRaw: string | null;
  trailerPlate: string | null;
  gps: "SIM" | "NÃO" | null;
}

export default async function VehiclesPage() {
  await requireRole(["admin"]);
  const fixtures = JSON.parse(
    await fs.promises.readFile(path.join(process.cwd(), "fixtures", "aitipro", "vehicles.json"), "utf-8"),
  ) as VehicleFixture[];
  const fixtureByPlate = new Map<string, VehicleFixture>();
  for (const fixture of fixtures) {
    if (!fixtureByPlate.has(fixture.plate)) fixtureByPlate.set(fixture.plate, fixture);
  }

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
        description={`${rows.length} viaturas · origem: fixtures reais AITIPRO + GPS quando disponível`}
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
                <th>Motorista</th>
                <th>Reboque</th>
                <th>GPS</th>
                <th>Fonte</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((v) => {
                const fixture = fixtureByPlate.get(v.plate);
                return (
                  <tr key={v.id}>
                    <td className="font-mono">{v.plate}</td>
                    <td className="text-xs">{v.kind}</td>
                    <td>{fixture?.companyRaw ?? v.company ?? "—"}</td>
                    <td className="text-xs">{fixture?.driverRaw ?? "—"}</td>
                    <td className="font-mono text-xs">{fixture?.trailerPlate ?? "—"}</td>
                    <td>
                      <Badge variant={fixture?.gps === "SIM" || v.hasCanbus ? "success" : "secondary"}>
                        {fixture?.gps ?? (v.hasCanbus ? "SIM" : "NÃO")}
                      </Badge>
                    </td>
                    <td className="font-mono text-[10px] text-muted-foreground">{fixture?.source ?? v.frotcomId ?? "—"}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
