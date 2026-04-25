// Regra de comissão confirmada pelo Éder (2026-04-20):
//   amount = margin × 20% + bónus fixo por carga (€2,50 nacional · €5 internacional)
//   só se aplica se a carga tiver sido feita com viatura interna Lloretrans.
//
// Esta heurística de nacional vs internacional funciona com os dados que temos no seed:
// considera-se nacional se origem E destino estiverem ambos em Portugal continental.
// Em produção seria substituído por país derivado da morada ou código ISO.

const PORTUGUESE_CITIES = [
  "lisboa",
  "porto",
  "coimbra",
  "faro",
  "aveiro",
  "braga",
  "évora",
  "evora",
  "setubal",
  "setúbal",
  "leiria",
  "viseu",
  "guimaraes",
  "guimarães",
  "torres vedras",
  "marl",
  "algoz",
  "lloretrans",
];

export function isPortugueseCity(place: string | null | undefined): boolean {
  if (!place) return false;
  const needle = place.toLowerCase().trim();
  return PORTUGUESE_CITIES.some((c) => needle.includes(c));
}

export function isNationalLoad(origin: string, destination: string): boolean {
  return isPortugueseCity(origin) && isPortugueseCity(destination);
}

export interface CommissionInput {
  margin: number;
  marginPct: number;
  plate: string | null;
  origin: string;
  destination: string;
}

export interface CommissionRuleValues {
  percentOfMargin: number;
  fixedBonusNationalEur: number;
  fixedBonusInternationalEur: number;
  requireInternalVehicle: boolean;
  minMarginPct: number;
}

export interface CommissionResult {
  amountEur: number;
  eligible: boolean;
  reason: string;
  breakdown: {
    percentPart: number;
    bonusPart: number;
    isNational: boolean;
    hasInternalPlate: boolean;
  };
}

export function computeCommissionAmount(
  load: CommissionInput,
  rule: CommissionRuleValues,
  internalPlates: Set<string>,
): CommissionResult {
  const hasInternalPlate = load.plate != null && internalPlates.has(load.plate);
  const isNational = isNationalLoad(load.origin, load.destination);

  if (rule.requireInternalVehicle && !hasInternalPlate) {
    return {
      amountEur: 0,
      eligible: false,
      reason: "Sem viatura Lloretrans",
      breakdown: { percentPart: 0, bonusPart: 0, isNational, hasInternalPlate },
    };
  }
  if (rule.minMarginPct > 0 && load.marginPct < rule.minMarginPct) {
    return {
      amountEur: 0,
      eligible: false,
      reason: `Margem ${(load.marginPct * 100).toFixed(1)}% < mínimo ${(rule.minMarginPct * 100).toFixed(0)}%`,
      breakdown: { percentPart: 0, bonusPart: 0, isNational, hasInternalPlate },
    };
  }

  const percentPart = load.margin * rule.percentOfMargin;
  const bonusPart = isNational ? rule.fixedBonusNationalEur : rule.fixedBonusInternationalEur;
  const amountEur = Math.round((percentPart + bonusPart) * 100) / 100;

  return {
    amountEur,
    eligible: true,
    reason: "OK",
    breakdown: { percentPart, bonusPart, isNational, hasInternalPlate },
  };
}
