import { requireRole } from "@/lib/auth/session";
import { PageHeader } from "@/components/ui/page-header";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { formatEur } from "@/lib/money";
import { Upload } from "lucide-react";
import Link from "next/link";
import fs from "node:fs";
import path from "node:path";
import { uploadInvoice } from "./actions";

export default async function InvoiceUploadPage() {
  await requireRole(["admin", "clarice", "admin_oficina"]);
  const catalog = JSON.parse(
    await fs.promises.readFile(path.join(process.cwd(), "fixtures", "extracted", "_catalog.json"), "utf-8"),
  ) as { entries: Array<{ fixtureFilename: string; supplier: { name: string }; invoice: { totalGross: number } }> };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Receber factura de fornecedor"
        description="Recepção do PDF · leitura de campos · classificação por NIF · validação humana."
        actions={
          <Button asChild variant="outline">
            <Link href="/ocr">Voltar</Link>
          </Button>
        }
      />

      <Card>
        <CardContent className="p-8">
          <form action={uploadInvoice} className="space-y-6">
            <label
              htmlFor="file"
              className="flex flex-col items-center justify-center gap-3 rounded-lg border-2 border-dashed border-border bg-secondary/30 p-12 text-center cursor-pointer hover:bg-secondary/50 transition-colors"
            >
              <Upload className="h-10 w-10 text-muted-foreground" />
              <span className="text-sm font-medium">Escolher ou arrastar PDF</span>
              <span className="text-xs text-muted-foreground mt-1">
                PDF novo fica em fila de leitura. As facturas reais abaixo já têm leitura e classificação disponíveis.
              </span>
              <input type="file" id="file" name="file" accept="application/pdf" className="hidden" />
            </label>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  Ou escolher uma factura real já lida
                </label>
                <select
                  name="fixtureFilename"
                  className="mt-1 h-9 w-full rounded-md border border-border bg-background px-3 text-sm"
                  defaultValue=""
                >
                  <option value="">— escolher amostra —</option>
                  {catalog.entries.map((entry) => (
                    <option key={entry.fixtureFilename} value={entry.fixtureFilename}>
                      {entry.supplier.name} · {formatEur(entry.invoice.totalGross)}
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex items-end">
                <Badge variant="secondary" className="text-[10px]">
                  Cada entrada fica registada e auditável.
                </Badge>
              </div>
            </div>

            <div className="flex items-center justify-between border-t border-border pt-4">
                <div className="text-xs text-muted-foreground">
                  Cada entrada fica com responsável, data e estado de validação.
                </div>
              <Button type="submit">Processar</Button>
            </div>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-4 text-xs text-muted-foreground space-y-1">
          <div><strong>Sequência operacional:</strong></div>
          <div>1. Recepção do PDF · 2. leitura de campos · 3. classificação por NIF e fornecedor</div>
          <div>4. validação humana · 5. regra aprendida · 6. preparação para PHC Advanced</div>
        </CardContent>
      </Card>
    </div>
  );
}
