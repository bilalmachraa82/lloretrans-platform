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
  admin_faturacao: "Faturação · Administrativa",
  admin_contas: "Contas Grupo · Administrativa",
  comercial: "Comercial · Bolsa",
  mecanico: "Oficina · Mecânico",
  digitalizacao: "Digitalização · Operador/a",
  frutas: "Frutas do Oeste · Consumo",
};

export const MVP_ACCESS: Record<Role, string[]> = {
  admin: ["km", "ocr", "docs", "fuel", "bolsa", "oficina", "admin"],
  clarice: ["km", "ocr", "docs", "fuel", "bolsa", "oficina"],
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
