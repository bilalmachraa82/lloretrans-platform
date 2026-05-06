import Link from "next/link";
import { asc, eq } from "drizzle-orm";
import { db } from "@/db/client";
import { companies, users } from "@/db/schema";
import { requireRole } from "@/lib/auth/session";
import {
  MVP_ACCESS,
  ROLE_LABELS,
  canAssignRole,
  isRole,
  type Role,
} from "@/lib/auth/types";
import { PageHeader } from "@/components/ui/page-header";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { updateUserRole } from "./actions";

const MODULE_LABELS: Record<string, string> = {
  km: "KM",
  ocr: "Facturas",
  docs: "Docs",
  fuel: "Combustível",
  bolsa: "Bolsa",
  oficina: "Oficina",
  admin: "Admin",
};

export default async function AdminUsersPage() {
  const session = await requireRole(["admin"]);
  const roleOptions = Object.keys(ROLE_LABELS).filter((role): role is Role => isRole(role) && canAssignRole(session.role, role));

  const rows = await db
    .select({
      id: users.id,
      name: users.name,
      email: users.email,
      role: users.role,
      companyName: companies.name,
      active: users.active,
    })
    .from(users)
    .leftJoin(companies, eq(companies.id, users.companyId))
    .orderBy(asc(users.role), asc(users.name));

  return (
    <div className="space-y-6">
      <PageHeader
        title="Perfis & acessos"
        description="Clarice tem acesso global; os restantes utilizadores mantêm perfis operacionais por área."
        actions={
          <Button variant="outline" asChild>
            <Link href="/admin">Administração</Link>
          </Button>
        }
      />

      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Utilizador</th>
                  <th>Perfil</th>
                  <th>Visibilidade</th>
                  <th className="w-[260px]">Gestão</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((user) => {
                  const currentRole = isRole(user.role) ? user.role : null;
                  const modules = currentRole ? MVP_ACCESS[currentRole] : [];
                  const canEdit =
                    Boolean(currentRole) &&
                    user.active &&
                    user.id !== session.userId &&
                    canAssignRole(session.role, currentRole as Role);
                  const options = currentRole
                    ? Array.from(new Set([currentRole, ...roleOptions]))
                    : roleOptions;

                  return (
                    <tr key={user.id}>
                      <td>
                        <div className="font-medium">{user.name}</div>
                        <div className="text-xs text-muted-foreground">{user.email}</div>
                        <div className="text-xs text-muted-foreground">{user.companyName ?? "AiTiPro"}</div>
                      </td>
                      <td>
                        <Badge variant={currentRole === "clarice" ? "success" : "secondary"}>
                          {currentRole ? ROLE_LABELS[currentRole] : user.role}
                        </Badge>
                      </td>
                      <td>
                        <div className="flex max-w-[360px] flex-wrap gap-1">
                          {modules.map((module) => (
                            <Badge key={module} variant={module === "admin" ? "default" : "outline"} className="text-[10px]">
                              {MODULE_LABELS[module] ?? module}
                            </Badge>
                          ))}
                        </div>
                      </td>
                      <td>
                        <form action={updateUserRole} className="flex items-center gap-2">
                          <input type="hidden" name="userId" value={user.id} />
                          <select
                            name="role"
                            defaultValue={currentRole ?? ""}
                            disabled={!canEdit}
                            className="h-9 min-w-0 flex-1 rounded-md border border-border bg-background px-2 text-xs"
                          >
                            {options.map((role) => (
                              <option key={role} value={role}>
                                {ROLE_LABELS[role]}
                              </option>
                            ))}
                          </select>
                          <Button type="submit" size="sm" variant="outline" disabled={!canEdit}>
                            Guardar
                          </Button>
                        </form>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
