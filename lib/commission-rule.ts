// Regra de comissão confirmada pelo Éder (2026-04-20):
//   amount = margin × 20% + bónus fixo por carga (€2,50 nacional · €5 internacional)
//   o bónus fixo só se aplica quando a carga usa viatura interna Lloretrans.
//
// Esta heurística de nacional vs internacional funciona com os dados que temos no seed:
// considera-se nacional se origem E destino estiverem ambos em Portugal continental.
// Com moradas oficiais, esta lista passa a ser substituída por país derivado da morada ou código ISO.

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
  "a dos cunhados",
  "alcobaça",
  "alcoentre",
  "marl",
  "algoz",
  "almeirim",
  "almada",
  "alverca",
  "amadora",
  "arruda dos vinhos",
  "azambuja",
  "barreiro",
  "benavente",
  "batalha",
  "caldas da rainha",
  "carregado",
  "castanheira do ribatejo",
  "cascais",
  "cereja",
  "figueira da foz",
  "golegã",
  "laundos",
  "loures",
  "mafra",
  "maia",
  "mangualde",
  "marinha grande",
  "montijo",
  "odivelas",
  "oeiras",
  "palmela",
  "peniche",
  "pombal",
  "póvoa de varzim",
  "povoa de varzim",
  "santarém",
  "santarem",
  "sintra",
  "tojal",
  "torres novas",
  "vila franca de xira",
  "vila nova de gaia",
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

  if (rule.minMarginPct > 0 && load.marginPct < rule.minMarginPct) {
    return {
      amountEur: 0,
      eligible: false,
      reason: `Margem ${(load.marginPct * 100).toFixed(1)}% < mínimo ${(rule.minMarginPct * 100).toFixed(0)}%`,
      breakdown: { percentPart: 0, bonusPart: 0, isNational, hasInternalPlate },
    };
  }

  const percentPart = Math.max(0, load.margin) * rule.percentOfMargin;
  const bonusPart =
    !rule.requireInternalVehicle || hasInternalPlate
      ? isNational
        ? rule.fixedBonusNationalEur
        : rule.fixedBonusInternationalEur
      : 0;
  const amountEur = Math.round((percentPart + bonusPart) * 100) / 100;

  return {
    amountEur,
    eligible: amountEur > 0,
    reason: bonusPart === 0 && rule.requireInternalVehicle && !hasInternalPlate
      ? "Sem bónus de viatura Lloretrans"
      : "OK",
    breakdown: { percentPart, bonusPart, isNational, hasInternalPlate },
  };
}
