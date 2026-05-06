export const ROLES = [
  "admin",
  "clarice",
  "admin_oficina",
  "admin_faturacao",
  "admin_contas",
  "comercial",
  "mecanico",
  "digitalizacao",
  "frutas",
] as const;

export type Role = (typeof ROLES)[number];

export interface AuthSession {
  userId: string;
  userName: string;
  email: string;
  role: Role;
  companyId: string | null;
  companyName: string;
}

export const ROLE_LABELS: Record<Role, string> = {
  admin: "AiTiPro · Admin",
  clarice: "Direcção · Clarice",
  admin_oficina: "Oficina · Administrativa",
  admin_faturacao: "Facturação · Administrativa",
  admin_contas: "Contas Grupo · Administrativa",
  comercial: "Comercial · Bolsa",
  mecanico: "Oficina · Mecânico",
  digitalizacao: "Digitalização · Operador/a",
  frutas: "Frutas do Oeste · Consumo",
};

export const SUPER_ADMIN_ACCESS = ["km", "ocr", "docs", "fuel", "bolsa", "oficina", "admin"] as const;

export const DELEGATED_ROLES = [
  "admin_oficina",
  "admin_faturacao",
  "admin_contas",
  "comercial",
  "mecanico",
  "digitalizacao",
  "frutas",
] as const satisfies readonly Role[];

export const MVP_ACCESS: Record<Role, readonly string[]> = {
  admin: SUPER_ADMIN_ACCESS,
  clarice: SUPER_ADMIN_ACCESS,
  admin_oficina: ["ocr", "oficina"],
  admin_faturacao: ["km", "docs", "bolsa"],
  admin_contas: ["ocr", "bolsa"],
  comercial: ["bolsa"],
  mecanico: ["oficina"],
  digitalizacao: ["docs"],
  frutas: ["docs"],
};

export function canAccessMvp(role: Role, mvp: string): boolean {
  return MVP_ACCESS[role]?.includes(mvp) ?? false;
}

export function isRole(value: string): value is Role {
  return (ROLES as readonly string[]).includes(value);
}

export function isSuperAdminRole(role: Role): boolean {
  return role === "admin" || role === "clarice";
}

export function canAssignRole(actorRole: Role, targetRole: Role): boolean {
  if (!isSuperAdminRole(actorRole)) return false;
  if (actorRole === "clarice") {
    return (DELEGATED_ROLES as readonly Role[]).includes(targetRole);
  }
  return (ROLES as readonly Role[]).includes(targetRole);
}
