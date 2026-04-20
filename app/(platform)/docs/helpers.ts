import type { AuthSession } from "@/lib/auth/types";

export const INGEST_KINDS = ["cmr", "guia_remessa", "guia_recepcao", "ticket_frio", "controlo_tara"] as const;
export type IngestKind = (typeof INGEST_KINDS)[number];

export function resolvePermissionScope(session: Pick<AuthSession, "role" | "companyId">): string | null {
  if (session.role === "frutas" && session.companyId) {
    return session.companyId;
  }
  return null;
}

export function detectKindFromFilename(filename: string): IngestKind {
  const lower = filename.toLowerCase();
  if (lower.includes("cmr")) return "cmr";
  if (lower.includes("recep")) return "guia_recepcao";
  if (lower.includes("remessa") || lower.includes("remes") || lower.includes("guia")) return "guia_remessa";
  if (lower.includes("frio") || lower.includes("temp")) return "ticket_frio";
  if (lower.includes("tara")) return "controlo_tara";
  return "cmr";
}
