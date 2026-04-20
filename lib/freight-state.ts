export const FREIGHT_STATES = [
  "scheduled",
  "delivered",
  "supplier_invoiced",
  "client_invoiced",
  "paid",
] as const;

export type FreightState = (typeof FREIGHT_STATES)[number];

export const STATE_LABELS: Record<FreightState, string> = {
  scheduled: "Agendada",
  delivered: "Entregue",
  supplier_invoiced: "Factura fornecedor",
  client_invoiced: "Factura cliente",
  paid: "Paga",
};

const FORWARD: Record<FreightState, FreightState[]> = {
  scheduled: ["delivered"],
  delivered: ["supplier_invoiced"],
  supplier_invoiced: ["client_invoiced"],
  client_invoiced: ["paid"],
  paid: [],
};

const BACKWARD: Record<FreightState, FreightState[]> = {
  scheduled: [],
  delivered: ["scheduled"],
  supplier_invoiced: ["delivered"],
  client_invoiced: ["supplier_invoiced"],
  paid: ["client_invoiced"],
};

export function nextStates(current: FreightState): FreightState[] {
  return FORWARD[current];
}

export function rollbackStates(current: FreightState): FreightState[] {
  return BACKWARD[current];
}

export function canTransition(from: FreightState, to: FreightState): boolean {
  return FORWARD[from].includes(to) || BACKWARD[from].includes(to);
}
