import { requireRole } from "@/lib/auth/session";
import { PageHeader } from "@/components/ui/page-header";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Upload } from "lucide-react";
import Link from "next/link";
import { bulkIngest } from "../actions";

export default async function DocsUploadPage() {
  await requireRole(["admin", "clarice", "digitalizacao"]);
  return (
    <div className="space-y-6">
      <PageHeader
        title="Ingerir documentos"
        description="Scan em lote · OCR metadados · auto-associação por CMR ou matrícula+data"
        actions={<Button variant="outline" asChild><Link href="/docs">← Voltar</Link></Button>}
      />
      <Card>
        <CardContent className="p-8">
          <div className="flex gap-2 border-b border-border mb-6 -mt-2 -mx-2 px-2">
            <div className="px-3 py-2 text-xs font-semibold uppercase tracking-wider text-primary border-b-2 border-primary -mb-px">
              Linha de triagem · 1 operador centralizado
            </div>
          </div>
          <form action={bulkIngest} className="space-y-6">
            <label
              htmlFor="files"
              className="flex flex-col items-center justify-center gap-3 rounded-lg border-2 border-dashed border-border bg-secondary/30 p-12 text-center cursor-pointer hover:bg-secondary/50 transition-colors"
            >
              <Upload className="h-10 w-10 text-muted-foreground" />
              <span className="text-sm font-medium">Arrastar PDFs ou carregar</span>
              <span className="text-xs text-muted-foreground max-w-md">
                Amostras reais disponíveis: CMR, Guia Recepção, Guia Transporte, Ticket Frio.
                O upload real continua em modo de avaliação; produção liga scanner/pasta de rede a Blob UE.
              </span>
              <input type="file" id="files" name="filename" multiple accept="application/pdf,image/*" className="hidden" />
            </label>
            <div className="flex items-end gap-3">
              <div className="flex-1">
                <label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  Ou simular nº documentos
                </label>
                <Input type="number" name="count" defaultValue="12" min="1" max="100" className="mt-1" />
              </div>
              <Button type="submit">Processar em lote</Button>
            </div>
          </form>
        </CardContent>
      </Card>
      <Card>
        <CardContent className="p-4 text-xs text-muted-foreground space-y-1">
          <div><strong>Pipeline:</strong> upload → extracção de CMR/matrícula/datas → tenta match por CMR exacto → fallback matrícula ±24h → restantes vão para órfãos.</div>
          <div>Permissões cross-empresa: documentos ficam visíveis às empresas autorizadas (tabela <code>document_permissions</code>).</div>
        </CardContent>
      </Card>
    </div>
  );
}
