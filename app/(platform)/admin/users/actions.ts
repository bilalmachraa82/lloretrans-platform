"use server";

import { revalidatePath } from "next/cache";
import { eq } from "drizzle-orm";
import { db } from "@/db/client";
import { sessions, users } from "@/db/schema";
import { requireRole } from "@/lib/auth/session";
import { canAssignRole, isRole, type Role } from "@/lib/auth/types";
import { audit } from "@/lib/audit";

export async function updateUserRole(formData: FormData): Promise<void> {
  const session = await requireRole(["admin"]);
  const userId = formData.get("userId")?.toString();
  const roleValue = formData.get("role")?.toString();

  if (!userId || !roleValue) throw new Error("Utilizador e perfil são obrigatórios");
  if (!isRole(roleValue)) throw new Error("Perfil inválido");
  if (userId === session.userId) throw new Error("Não pode alterar o próprio perfil nesta página");

  const [target] = await db
    .select({ id: users.id, name: users.name, role: users.role })
    .from(users)
    .where(eq(users.id, userId))
    .limit(1);

  if (!target) throw new Error("Utilizador não encontrado");
  if (!isRole(target.role)) throw new Error("Perfil actual inválido");

  const currentRole = target.role as Role;
  const nextRole = roleValue as Role;
  if (!canAssignRole(session.role, currentRole) || !canAssignRole(session.role, nextRole)) {
    throw new Error("Sem permissão para gerir este perfil");
  }

  if (currentRole === nextRole) {
    revalidatePath("/admin/users");
    return;
  }

  await db.update(users).set({ role: nextRole }).where(eq(users.id, userId));
  await db.delete(sessions).where(eq(sessions.userId, userId));

  await audit({
    userId: session.userId,
    action: "user.role_update",
    entityType: "user",
    entityId: userId,
    before: { role: currentRole },
    after: { role: nextRole },
    reason: `Perfil alterado para ${nextRole}`,
  });

  revalidatePath("/admin/users");
  revalidatePath("/admin");
}
