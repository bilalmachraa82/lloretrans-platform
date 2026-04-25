export type FreightPaymentRegularization = "R" | "NR" | null;

export interface AitiproFreightLoad {
  sourceRow: number;
  tractorPlate: string | null;
  trailerPlate: string | null;
  transporter: string;
  carrierKind: "internal_lloretrans" | "external_transporter";
  date: string | null;
  client: string;
  origin: string;
  destination: string;
  priceClientEur: number | null;
  paidTransporterEur: number | null;
  marginEur: number | null;
  customerInvoiceNumber: string | null;
  observations: string | null;
  cmrNumber: string | null;
  supplierInvoiceNumber: string | null;
  responsible: string | null;
  serviceValueEur: number | null;
  paymentRegularization: FreightPaymentRegularization;
  paymentMonth: string | null;
  rawInvoiceNumber2: string | null;
}

export function isInternalLloretrans(transporter: string): boolean {
  return transporter.trim().toUpperCase() === "LLORETRANS";
}
