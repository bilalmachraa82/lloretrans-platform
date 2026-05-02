// Fonte: modelo em papel "Folha de Obra" partilhado pelo Éder em 2026-04-20.
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
  /** Códigos de serviço para os quais este item é relevante. Vazio = item transversal. */
  relatedServiceCodes?: readonly string[];
  /** Tipos de viatura onde o item faz sentido operacional. Vazio = todos. */
  vehicleKinds?: readonly string[];
}

export const WORKSHOP_CHECKLIST: readonly ChecklistItemDef[] = [
  {
    key: "alinhar_direcao",
    label: "Alinhar direcção",
    relatedServiceCodes: ["S1", "L1"],
    vehicleKinds: ["pesado_mercadorias", "ligeiro", "trator"],
  },
  {
    key: "embraiagem",
    label: "Embraiagem",
    relatedServiceCodes: ["S8", "L7"],
    vehicleKinds: ["pesado_mercadorias", "ligeiro", "trator"],
  },
  { key: "equilibrar_rodas", label: "Equilibrar rodas", relatedServiceCodes: ["S1", "L1"] },
  {
    key: "filtro_ar",
    label: "Filtro de ar",
    relatedServiceCodes: ["S8", "L7"],
    vehicleKinds: ["pesado_mercadorias", "ligeiro", "trator"],
  },
  {
    key: "filtro_gasoleo",
    label: "Filtro de gasóleo",
    relatedServiceCodes: ["S8", "L7", "I3"],
    vehicleKinds: ["pesado_mercadorias", "ligeiro", "trator"],
  },
  {
    key: "filtro_oleo",
    label: "Filtro de óleo",
    relatedServiceCodes: ["S8", "L7", "I3"],
    vehicleKinds: ["pesado_mercadorias", "ligeiro", "trator"],
  },
  { key: "inspecao", label: "Inspecção", relatedServiceCodes: ["S9", "I7"] },
  { key: "lavagem", label: "Lavagem" },
  { key: "luzes", label: "Luzes", relatedServiceCodes: ["S2", "L2", "S8", "L7"] },
  {
    key: "mudar_oleo",
    label: "Mudar óleo",
    relatedServiceCodes: ["S8", "L7", "I3"],
    vehicleKinds: ["pesado_mercadorias", "ligeiro", "trator"],
  },
  {
    key: "revisao",
    label: "Revisão",
    relatedServiceCodes: ["S8", "L7", "I4"],
    vehicleKinds: ["pesado_mercadorias", "ligeiro", "trator"],
  },
  { key: "servico_pintura", label: "Serviço Pintura", relatedServiceCodes: ["S4", "L4"] },
  {
    key: "sub_correia_distribuicao",
    label: "Sub. Correia distribuição",
    relatedServiceCodes: ["S8", "L7"],
    vehicleKinds: ["pesado_mercadorias", "ligeiro", "trator"],
  },
  {
    key: "substituir_correias",
    label: "Substituir Correias",
    relatedServiceCodes: ["S8", "L7"],
    vehicleKinds: ["pesado_mercadorias", "ligeiro", "trator"],
  },
  { key: "suspensao", label: "Suspensão", relatedServiceCodes: ["S8", "L7"] },
  { key: "travoes", label: "Travões", relatedServiceCodes: ["S8", "L7"] },
  { key: "velas", label: "Velas", relatedServiceCodes: ["S2", "S8", "L2", "L7"], vehicleKinds: ["ligeiro"] },
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

export function filterChecklistForContext(
  serviceCodes: readonly string[],
  vehicleKind: string | null | undefined,
): readonly ChecklistItemDef[] {
  const kind = normalizeWorkshopVehicleKind(vehicleKind);
  const vehicleMatches = kind === "pesado_passageiros" ? ["pesado_passageiros", "pesado_mercadorias"] : kind ? [kind] : [];
  const selected = new Set(serviceCodes);

  if (selected.size === 0 && !kind) return WORKSHOP_CHECKLIST;

  return WORKSHOP_CHECKLIST.filter((item) => {
    const matchesVehicle =
      !kind || !item.vehicleKinds || vehicleMatches.some((candidate) => item.vehicleKinds?.includes(candidate));
    if (!matchesVehicle) return false;

    if (!item.relatedServiceCodes || item.relatedServiceCodes.length === 0) return true;
    if (selected.size === 0) return true;
    return item.relatedServiceCodes.some((code) => selected.has(code));
  });
}

export function normalizeWorkshopVehicleKind(kind: string | null | undefined): string | undefined {
  const value = kind?.toLowerCase().trim();
  if (!value) return undefined;
  if (value.includes("reboque")) return "reboque";
  if (value.includes("trator") || value.includes("tractor")) return "trator";
  if (value.includes("passageiros")) return "pesado_passageiros";
  if (value.includes("ligeiro")) return "ligeiro";
  if (value.includes("pesado") || value.includes("mercadorias") || value.includes("cami")) return "pesado_mercadorias";
  return value.replaceAll(" ", "_");
}
