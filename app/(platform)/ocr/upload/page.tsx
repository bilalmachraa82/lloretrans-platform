import { requireRole } from "@/lib/auth/session";
import { PageHeader } from "@/components/ui/page-header";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Upload } from "lucide-react";
import Link from "next/link";
import { uploadInvoice } from "./actions";

export default async function InvoiceUploadPage() {
  await requireRole(["admin", "admin_oficina"]);
  return (
    <div className="space-y-6">
      <PageHeader
        title="Upload de factura"
        description="Fluxo real: PDF → OCR Azure DI → classificação automática por NIF → validação humana."
        actions={
          <Button asChild variant="outline">
            <Link href="/ocr">← Voltar</Link>
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
              <div>
                <div className="text-sm font-medium">Escolher ou arrastar PDF</div>
                <div className="text-xs text-muted-foreground mt-1">
                  Em produção: Azure Document Intelligence (EU region). Aqui: simulação com fixture.
                </div>
              </div>
              <input type="file" id="file" name="file" accept="application/pdf" className="hidden" />
            </label>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  Ou escolher uma das 9 facturas reais
                </label>
                <select
                  name="fixtureFilename"
                  className="mt-1 h-9 w-full rounded-md border border-border bg-background px-3 text-sm"
                  defaultValue=""
                >
                  <option value="">— escolher fixture —</option>
                  <option value="doc14723420260417152437.pdf">Moeve Pro · óleos & filtros · 602,23 €</option>
                  <option value="doc14723520260417152501.pdf">Policalço · travões · 1 073,05 €</option>
                  <option value="doc14723620260417152535.pdf">Selcar · sistemas frio · 1 752,75 €</option>
                  <option value="doc14723720260417152559.pdf">Prevrod · embraiagem · 4 034,40 €</option>
                  <option value="doc14723820260417152625.pdf">Popapneus · pneus · 2 638,35 €</option>
                  <option value="doc14723920260417152650.pdf">Dieselplace · injectores · 1 180,80 €</option>
                  <option value="doc14724020260417152720.pdf">Lubrigaz · gasóleo · 2 308,00 €</option>
                  <option value="doc14724120260417152817.pdf">Tecnicauto · electrónica · 836,40 €</option>
                  <option value="doc14724220260417152924.pdf">Eurocamiones · peças · 507,74 €</option>
                </select>
              </div>
              <div className="flex items-end">
                <Badge variant="secondary" className="text-[10px]">
                  Demo cacheia OCR. Em prod, cada upload gasta ~0,005-0,02 € em DI.
                </Badge>
              </div>
            </div>

            <div className="flex items-center justify-between border-t border-border pt-4">
              <div className="text-xs text-muted-foreground">
                Após upload, a factura aparece em <span className="font-mono">pending_review</span>.
              </div>
              <Button type="submit">Processar</Button>
            </div>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-4 text-xs text-muted-foreground space-y-1">
          <div><strong>Pipeline (prod):</strong></div>
          <div>1. Upload → Azure Blob EU · 2. Azure DI extrai layout · 3. Claude API classifica via NIF → rule</div>
          <div>4. UI mostra confiança por campo · 5. Admin valida → regra aprendida · 6. Export XML PHC</div>
        </CardContent>
      </Card>
    </div>
  );
}
