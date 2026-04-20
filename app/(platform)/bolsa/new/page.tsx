import Link from "next/link";
import { db } from "@/db/client";
import { clients, suppliers, vehicles } from "@/db/schema";
import { eq } from "drizzle-orm";
import { requireRole } from "@/lib/auth/session";
import { PageHeader } from "@/components/ui/page-header";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { createLoad } from "../actions";

export default async function NewLoadPage() {
  await requireRole(["admin", "clarice", "comercial"]);
  const [cli, sup, veh] = await Promise.all([
    db.select().from(clients).orderBy(clients.name),
    db.select().from(suppliers).orderBy(suppliers.name),
    db.select({ plate: vehicles.plate, kind: vehicles.kind }).from(vehicles).where(eq(vehicles.active, true)).orderBy(vehicles.plate),
  ]);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Nova carga"
        description="Cria no sistema · substitui linha Excel · comissão calculada automaticamente quando paga"
        actions={<Button variant="outline" asChild><Link href="/bolsa">← Voltar</Link></Button>}
      />

      <Card>
        <CardContent className="p-6">
          <form action={createLoad} className="space-y-4 max-w-2xl">
            <div className="grid gap-3 sm:grid-cols-2">
              <Field label="Cliente" required>
                <select name="clientId" required className="h-9 w-full rounded-md border border-border bg-background px-3 text-sm">
                  <option value="">— escolher —</option>
                  {cli.map((c) => <option key={c.id} value={c.id}>{c.name} · {c.country}</option>)}
                </select>
              </Field>
              <Field label="Fornecedor" required>
                <select name="supplierId" required className="h-9 w-full rounded-md border border-border bg-background px-3 text-sm">
                  <option value="">— escolher —</option>
                  {sup.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
                </select>
              </Field>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <Field label="Origem" required>
                <Input name="origin" required placeholder="ex: Lisboa" />
              </Field>
              <Field label="Destino" required>
                <Input name="destination" required placeholder="ex: Madrid" />
              </Field>
            </div>
            <Field label="Matrícula (opcional · se Lloretrans fornece)">
              <select name="plate" className="h-9 w-full rounded-md border border-border bg-background px-3 text-sm">
                <option value="">— sem matrícula Lloretrans (fornecedor externo) —</option>
                {veh.map((v) => <option key={v.plate} value={v.plate}>{v.plate} · {v.kind}</option>)}
              </select>
            </Field>
            <div className="grid gap-3 sm:grid-cols-2">
              <Field label="Preço compra (€)" required>
                <Input name="priceBuy" type="number" step="0.01" min="0.01" required placeholder="ex: 1200.00" />
              </Field>
              <Field label="Preço venda (€)" required>
                <Input name="priceSell" type="number" step="0.01" min="0.01" required placeholder="ex: 1400.00" />
              </Field>
            </div>
            <Field label="Notas (opcional)">
              <textarea
                name="notes"
                rows={3}
                className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm"
                placeholder="Observações · acordo verbal · contacto motorista…"
              />
            </Field>
            <div className="flex justify-end pt-2">
              <Button type="submit">Criar carga</Button>
            </div>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-4 text-xs text-muted-foreground">
          <strong>Regras:</strong> margem = preçoVenda − preçoCompra. Carga criada em estado <code>scheduled</code>.
          Só transita quando marcas entregue (manual), regista factura fornecedor, factura cliente e recebimento.
          Comissão é calculada ao atingir estado <code>paid</code> (15% default · 18% Éder).
        </CardContent>
      </Card>
    </div>
  );
}

function Field({ label, required = false, children }: { label: string; required?: boolean; children: React.ReactNode }) {
  return (
    <div className="space-y-1">
      <label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
        {label} {required && <span className="text-destructive">*</span>}
      </label>
      {children}
    </div>
  );
}
