export interface PhcInvoicePayload {
  supplier: { taxId: string; name: string };
  invoiceNumber: string;
  issuedAt: string;
  dueAt: string | null;
  totalNet: number;
  totalVat: number;
  totalGross: number;
  serviceCode: string;
  workCode: string;
  plate: string | null;
  lines: Array<{
    description: string;
    quantity: number;
    unitPrice: number;
    vatRate: number;
    total: number;
    serviceCode: string;
  }>;
}

export interface PhcExportResult {
  format: "xml" | "json";
  content: string;
  filename: string;
  mimeType: string;
}

export interface PhcClient {
  exportInvoice(payload: PhcInvoicePayload): Promise<PhcExportResult>;
  exportWorkOrder(payload: unknown): Promise<PhcExportResult>;
  isLive(): boolean;
}

function toXml(payload: PhcInvoicePayload): string {
  const esc = (s: string): string =>
    s.replace(/[<>&"']/g, (c) => ({ "<": "&lt;", ">": "&gt;", "&": "&amp;", '"': "&quot;", "'": "&apos;" })[c]!);

  const lines = payload.lines
    .map(
      (l, i) => `    <Line number="${i + 1}">
      <Description>${esc(l.description)}</Description>
      <Quantity>${l.quantity}</Quantity>
      <UnitPrice>${l.unitPrice.toFixed(2)}</UnitPrice>
      <VatRate>${l.vatRate}</VatRate>
      <Total>${l.total.toFixed(2)}</Total>
      <ServiceCode>${esc(l.serviceCode)}</ServiceCode>
    </Line>`,
    )
    .join("\n");

  return `<?xml version="1.0" encoding="UTF-8"?>
<PhcInvoice xmlns="https://aitipro.com/schemas/phc-invoice/v1">
  <Supplier>
    <TaxId>${esc(payload.supplier.taxId)}</TaxId>
    <Name>${esc(payload.supplier.name)}</Name>
  </Supplier>
  <InvoiceNumber>${esc(payload.invoiceNumber)}</InvoiceNumber>
  <IssuedAt>${esc(payload.issuedAt)}</IssuedAt>
  <DueAt>${esc(payload.dueAt ?? "")}</DueAt>
  <Totals>
    <Net>${payload.totalNet.toFixed(2)}</Net>
    <Vat>${payload.totalVat.toFixed(2)}</Vat>
    <Gross>${payload.totalGross.toFixed(2)}</Gross>
  </Totals>
  <Classification>
    <ServiceCode>${esc(payload.serviceCode)}</ServiceCode>
    <WorkCode>${esc(payload.workCode)}</WorkCode>
    <Plate>${esc(payload.plate ?? "")}</Plate>
  </Classification>
  <Lines>
${lines}
  </Lines>
</PhcInvoice>`;
}

class PhcStub implements PhcClient {
  isLive(): boolean {
    return false;
  }

  async exportInvoice(payload: PhcInvoicePayload): Promise<PhcExportResult> {
    return {
      format: "xml",
      content: toXml(payload),
      filename: `phc_invoice_${payload.invoiceNumber.replace(/[^A-Za-z0-9_-]/g, "_")}.xml`,
      mimeType: "application/xml",
    };
  }

  async exportWorkOrder(payload: unknown): Promise<PhcExportResult> {
    return {
      format: "json",
      content: JSON.stringify(payload, null, 2),
      filename: `phc_workorder_${Date.now()}.json`,
      mimeType: "application/json",
    };
  }
}

class PhcLive implements PhcClient {
  isLive(): boolean {
    return true;
  }
  async exportInvoice(): Promise<PhcExportResult> {
    throw new Error("PhcLive not implemented — waiting for integrator handshake");
  }
  async exportWorkOrder(): Promise<PhcExportResult> {
    throw new Error("PhcLive not implemented — waiting for integrator handshake");
  }
}

export function createPhcClient(): PhcClient {
  return process.env.USE_LIVE_APIS === "true" && process.env.PHC_INTEGRATOR_URL
    ? new PhcLive()
    : new PhcStub();
}
