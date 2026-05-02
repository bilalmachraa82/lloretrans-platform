import { db } from "@/db/client";
import { featureFlags } from "@/db/schema";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { requireRole } from "@/lib/auth/session";
import { audit } from "@/lib/audit";
import { PageHeader } from "@/components/ui/page-header";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";

async function toggleFlag(formData: FormData): Promise<void> {
  "use server";
  const session = await requireRole(["admin"]);
  const key = formData.get("key")?.toString();
  if (!key) throw new Error("key required");
  const [current] = await db.select().from(featureFlags).where(eq(featureFlags.key, key)).limit(1);
  if (!current) return;
  await db
    .update(featureFlags)
    .set({ enabled: !current.enabled, updatedAt: new Date() })
    .where(eq(featureFlags.key, key));
  await audit({
    userId: session.userId,
    action: "feature_flag.toggle",
    entityType: "feature_flag",
    entityId: key,
    before: { enabled: current.enabled },
    after: { enabled: !current.enabled },
  });
  revalidatePath("/admin/flags");
}

export default async function FlagsPage() {
  await requireRole(["admin"]);
  const flags = await db.select().from(featureFlags);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Parâmetros operacionais"
        description="Activar ou suspender módulos sem nova publicação"
        actions={
          <Button variant="outline" asChild>
            <Link href="/admin">Administração</Link>
          </Button>
        }
      />
      <Card>
        <CardContent className="p-0">
          <table className="data-table">
            <thead>
              <tr>
                <th>Chave</th>
                <th>Descrição</th>
                <th>Estado</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {flags.map((f) => (
                <tr key={f.key}>
                  <td className="font-mono text-xs">{f.key}</td>
                  <td>{f.description}</td>
                  <td>
                    <Badge variant={f.enabled ? "success" : "secondary"}>{f.enabled ? "Activo" : "Inactivo"}</Badge>
                  </td>
                  <td>
                    <form action={toggleFlag}>
                      <input type="hidden" name="key" value={f.key} />
                      <Button type="submit" size="sm" variant="outline">
                        Alternar
                      </Button>
                    </form>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </CardContent>
      </Card>
    </div>
  );
}
