// Fonte: template papel "Folha de Obra" partilhada pelo Éder em 2026-04-20.
// 17 itens pré-definidos, cada um com dois toggles (substituição · verificação) + campo observações.
// O mecânico marca o que fez, anota peça/código externo, e a admin de oficina aprova.

export type ChecklistItemKey =
  | "alinhar_direcao"
  | "embraiagem"
  | "equilibrar_rodas"
  | "filtro_ar"
  | "filtro_gasoleo"
  | "filtro_oleo"
  | "inspecao"
  | "lavagem"
  | "luzes"
  | "mudar_oleo"
  | "revisao"
  | "servico_pintura"
  | "sub_correia_distribuicao"
  | "substituir_correias"
  | "suspensao"
  | "travoes"
  | "velas";

export interface ChecklistItemDef {
  key: ChecklistItemKey;
  label: string;
  /** Códigos de serviço (S ou L) para os quais este item é relevante. Vazio = aparece sempre. */
  relatedServiceCodes?: readonly string[];
}

export const WORKSHOP_CHECKLIST: readonly ChecklistItemDef[] = [
  { key: "alinhar_direcao", label: "Alinhar direção", relatedServiceCodes: ["S1", "L1"] },
  { key: "embraiagem", label: "Embraiagem", relatedServiceCodes: ["S8", "L7"] },
  { key: "equilibrar_rodas", label: "Equilibrar rodas", relatedServiceCodes: ["S1", "L1"] },
  { key: "filtro_ar", label: "Filtro de ar" },
  { key: "filtro_gasoleo", label: "Filtro de gasóleo" },
  { key: "filtro_oleo", label: "Filtro de óleo" },
  { key: "inspecao", label: "Inspeção", relatedServiceCodes: ["S9", "I7"] },
  { key: "lavagem", label: "Lavagem" },
  { key: "luzes", label: "Luzes", relatedServiceCodes: ["S2", "L2"] },
  { key: "mudar_oleo", label: "Mudar óleo" },
  { key: "revisao", label: "Revisão" },
  { key: "servico_pintura", label: "Serviço Pintura", relatedServiceCodes: ["S4", "L4"] },
  { key: "sub_correia_distribuicao", label: "Sub. Correia distribuição", relatedServiceCodes: ["S8", "L7"] },
  { key: "substituir_correias", label: "Substituir Correias", relatedServiceCodes: ["S8", "L7"] },
  { key: "suspensao", label: "Suspensão", relatedServiceCodes: ["S8", "L7"] },
  { key: "travoes", label: "Travões", relatedServiceCodes: ["S8", "L7"] },
  { key: "velas", label: "Velas", relatedServiceCodes: ["S2", "S8", "L2", "L7"] },
] as const;

export interface ChecklistAnswer {
  key: ChecklistItemKey;
  substituted: boolean;
  verified: boolean;
  notes?: string;
}

export function emptyChecklist(): ChecklistAnswer[] {
  return WORKSHOP_CHECKLIST.map((item) => ({
    key: item.key,
    substituted: false,
    verified: false,
    notes: "",
  }));
}

export function filterChecklistForService(serviceCode: string | null | undefined): readonly ChecklistItemDef[] {
  if (!serviceCode) return WORKSHOP_CHECKLIST;
  return WORKSHOP_CHECKLIST.filter(
    (item) => !item.relatedServiceCodes || item.relatedServiceCodes.includes(serviceCode),
  );
}
