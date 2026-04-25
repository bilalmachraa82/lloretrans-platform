export const FUEL_PROVIDERS = ["cepsa", "repsol", "radius_velocity", "bomba_interna", "frotcom_fee"] as const;
export type FuelProvider = (typeof FUEL_PROVIDERS)[number];

export const FUEL_PROVIDER_LABELS: Record<FuelProvider, string> = {
  cepsa: "Cepsa",
  repsol: "Repsol",
  radius_velocity: "Radius Velocity",
  bomba_interna: "Bomba interna",
  frotcom_fee: "Frotcom mensalidades",
};

export function isConsumptionProvider(provider: FuelProvider): boolean {
  return provider !== "frotcom_fee";
}
