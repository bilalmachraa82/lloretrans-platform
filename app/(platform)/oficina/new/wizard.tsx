"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { PageHeader } from "@/components/ui/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Trash2, Plus, Camera, Check } from "lucide-react";
import { submitWorkOrder } from "../actions";
import {
  WORKSHOP_CHECKLIST,
  emptyChecklist,
  type ChecklistAnswer,
  type ChecklistItemKey,
} from "@/lib/workshop-checklist";

interface VehicleOpt {
  plate: string;
  kind: string;
}

interface ServiceCode {
  code: string;
  label: string;
  kind: string;
}

interface Item {
  id: string;
  kind: "part" | "labour";
  description: string;
  partCode: string;
  quantity: number;
  unitPrice: number;
}

const TEMPLATES: Record<string, Item[]> = {
  S1: [
    { id: "t1", kind: "part", description: "Óleo motor 15W40 (5L)", partCode: "OIL-1540-5L", quantity: 1, unitPrice: 42.5 },
    { id: "t2", kind: "part", description: "Filtro de óleo", partCode: "FIL-OIL", quantity: 1, unitPrice: 14.8 },
    { id: "t3", kind: "labour", description: "Mão-de-obra mudança óleo", partCode: "", quantity: 1, unitPrice: 61.3 },
  ],
  S2: [
    { id: "t4", kind: "part", description: "Pastilhas travão (jogo)", partCode: "PST-4W", quantity: 1, unitPrice: 285 },
    { id: "t5", kind: "labour", description: "Mão-de-obra travões", partCode: "", quantity: 2, unitPrice: 92 },
  ],
  L1: [
    { id: "t6", kind: "part", description: "Pneu 315/70 R22.5", partCode: "TYR-315", quantity: 4, unitPrice: 485 },
    { id: "t7", kind: "labour", description: "Montagem + equilibragem", partCode: "", quantity: 4, unitPrice: 25 },
  ],
  L2: [
    { id: "t8", kind: "part", description: "Lâmpadas e cablagem", partCode: "ELEC-GEN", quantity: 1, unitPrice: 35 },
    { id: "t9", kind: "labour", description: "Diagnóstico eléctrico", partCode: "", quantity: 1, unitPrice: 55 },
  ],
  L7: [
    { id: "t10", kind: "part", description: "Kit revisão interna", partCode: "REV-INT", quantity: 1, unitPrice: 145 },
    { id: "t11", kind: "labour", description: "Mecânica geral interna", partCode: "", quantity: 2, unitPrice: 55 },
  ],
};

const DRAFT_KEY = "oficina.wo.draft.v1";

const VEHICLE_KIND_LABELS: Record<string, string> = {
  pesado_mercadorias: "Pesado mercadorias",
  ligeiro: "Ligeiro",
  trator: "Trator",
  reboque: "Reboque",
};

function vehicleKindLabel(kind: string): string {
  return VEHICLE_KIND_LABELS[kind.toLowerCase()] ?? kind.replaceAll("_", " ");
}

export function WorkOrderWizard({
  vehicles,
  serviceCodes,
  mechanicName,
}: {
  vehicles: VehicleOpt[];
  serviceCodes: ServiceCode[];
  mechanicName: string;
}) {
  const [step, setStep] = useState(1);
  const [plate, setPlate] = useState("");
  const [serviceCode, setServiceCode] = useState("");
  const [summary, setSummary] = useState("");
  const [items, setItems] = useState<Item[]>([]);
  const [checklist, setChecklist] = useState<ChecklistAnswer[]>(() => emptyChecklist());
  const [signaturePath, setSignaturePath] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // Load draft on mount
  useEffect(() => {
    try {
      const raw = localStorage.getItem(DRAFT_KEY);
      if (raw) {
        const d = JSON.parse(raw);
        setPlate(d.plate ?? "");
        setServiceCode(d.serviceCode ?? "");
        setSummary(d.summary ?? "");
        setItems(d.items ?? []);
        if (Array.isArray(d.checklist) && d.checklist.length > 0) setChecklist(d.checklist);
      }
    } catch {}
  }, []);

  // Persist draft on every change
  useEffect(() => {
    try {
      localStorage.setItem(
        DRAFT_KEY,
        JSON.stringify({ plate, serviceCode, summary, items, checklist }),
      );
    } catch {}
  }, [plate, serviceCode, summary, items, checklist]);

  function updateChecklist(key: ChecklistItemKey, patch: Partial<ChecklistAnswer>) {
    setChecklist((cur) => cur.map((c) => (c.key === key ? { ...c, ...patch } : c)));
  }

  const visibleChecklist = WORKSHOP_CHECKLIST;
  const checklistTouched = checklist.some((c) => c.substituted || c.verified || (c.notes ?? "").trim());

  const total = items.reduce((a, i) => a + i.quantity * i.unitPrice, 0);

  function applyTemplate(code: string) {
    setServiceCode(code);
    const tpl = TEMPLATES[code];
    if (tpl && items.length === 0) setItems(tpl.map((t) => ({ ...t, id: crypto.randomUUID() })));
  }

  function addItem(kind: "part" | "labour") {
    setItems((cur) => [...cur, { id: crypto.randomUUID(), kind, description: "", partCode: "", quantity: 1, unitPrice: 0 }]);
  }
  function removeItem(id: string) {
    setItems((cur) => cur.filter((i) => i.id !== id));
  }
  function updateItem(id: string, patch: Partial<Item>) {
    setItems((cur) => cur.map((i) => (i.id === id ? { ...i, ...patch } : i)));
  }

  async function handleSubmit() {
    if (!plate || !serviceCode || items.length === 0 || !signaturePath) {
      alert("Preenche todos os passos antes de submeter.");
      return;
    }
    setSubmitting(true);
    const payload = {
      plate,
      serviceCode,
      summary: summary || `Intervenção ${serviceCode} · ${plate}`,
      items: items.map((i) => ({
        kind: i.kind,
        description: i.description,
        partCode: i.partCode || undefined,
        quantity: i.quantity,
        unitPrice: i.unitPrice,
      })),
      checklist: checklist
        .filter((c) => c.substituted || c.verified || (c.notes ?? "").trim())
        .map((c) => ({
          key: c.key,
          substituted: c.substituted,
          verified: c.verified,
          notes: (c.notes ?? "").trim() || undefined,
        })),
      signatureSvgPath: signaturePath,
      signerName: mechanicName,
    };
    const fd = new FormData();
    fd.set("payload", JSON.stringify(payload));
    try {
      await submitWorkOrder(fd);
      localStorage.removeItem(DRAFT_KEY);
    } catch (err) {
      alert(err instanceof Error ? err.message : "Erro ao submeter");
    } finally {
      setSubmitting(false);
    }
  }

  const canNext = {
    1: plate !== "",
    2: serviceCode !== "",
    3: true, // checklist opcional — mecânico pode saltar se só intervém em itens avulsos
    4: items.length > 0 && items.every((i) => i.description.trim()),
    5: true, // fotos opcionais
    6: signaturePath !== "",
  }[step];

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      <PageHeader
        title={`Nova folha · passo ${step}/7`}
        description="Rascunho guarda-se sozinho · podes sair e voltar"
        actions={<Button variant="outline" asChild><Link href="/oficina">Cancelar</Link></Button>}
      />

      <div className="flex gap-1">
        {[1, 2, 3, 4, 5, 6, 7].map((n) => (
          <div
            key={n}
            className={`h-1.5 flex-1 rounded-full ${n <= step ? "bg-primary" : "bg-secondary"}`}
          />
        ))}
      </div>

      {step === 1 && (
        <Card>
          <CardHeader><CardTitle className="text-base">1. Matrícula</CardTitle></CardHeader>
          <CardContent>
            <select
              value={plate}
              onChange={(e) => setPlate(e.target.value)}
              aria-label="Escolher matrícula da viatura"
              className="h-14 w-full rounded-md border border-border bg-background px-3 text-lg font-mono"
            >
              <option value="">— escolher matrícula —</option>
              {vehicles.map((v) => (
                <option key={v.plate} value={v.plate}>{v.plate} · {vehicleKindLabel(v.kind)}</option>
              ))}
            </select>
          </CardContent>
        </Card>
      )}

      {step === 2 && (
        <Card>
          <CardHeader><CardTitle className="text-base">2. Tipo de serviço</CardTitle></CardHeader>
          <CardContent className="grid gap-2 sm:grid-cols-2">
            {serviceCodes
              .filter((c) => c.kind === "oficina_interna" || c.kind === "oficina_externa" || c.kind === "operacao_interna")
              .map((c) => (
                <button
                  key={c.code}
                  type="button"
                  onClick={() => applyTemplate(c.code)}
                  className={`text-left p-4 rounded-md border-2 transition-colors min-h-[72px] ${
                    serviceCode === c.code ? "border-primary bg-primary/5" : "border-border hover:border-primary/40"
                  }`}
                >
                  <div className="font-mono text-sm font-semibold">{c.code}</div>
                  <div className="text-sm">{c.label}</div>
                  {TEMPLATES[c.code] && (
                    <Badge variant="secondary" className="mt-1 text-[10px]">inclui template</Badge>
                  )}
                </button>
              ))}
          </CardContent>
        </Card>
      )}

      {step === 3 && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-base">3. Checklist ({visibleChecklist.length} itens)</CardTitle>
              {checklistTouched && <Badge variant="success">{checklist.filter((c) => c.substituted || c.verified).length} marcados</Badge>}
            </div>
          </CardHeader>
          <CardContent className="space-y-2">
            <p className="text-xs text-muted-foreground">
              Marca o que foi <strong>substituído</strong> ou <strong>verificado</strong>.
              Passo opcional — só preenche se houver tarefas aplicáveis.
            </p>
            {visibleChecklist.map((item) => {
              const a = checklist.find((c) => c.key === item.key);
              if (!a) return null;
              const active = a.substituted || a.verified;
              return (
                <div
                  key={item.key}
                  className={`rounded-md border p-3 space-y-2 ${active ? "border-primary bg-primary/5" : "border-border"}`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-sm font-medium flex-1">{item.label}</span>
                    <div className="flex gap-1">
                      <button
                        type="button"
                        onClick={() => updateChecklist(item.key, { substituted: !a.substituted })}
                        className={`px-2 py-1 text-[10px] rounded border min-w-[70px] ${
                          a.substituted ? "bg-primary text-primary-foreground border-primary" : "border-border"
                        }`}
                      >
                        Substituído
                      </button>
                      <button
                        type="button"
                        onClick={() => updateChecklist(item.key, { verified: !a.verified })}
                        className={`px-2 py-1 text-[10px] rounded border min-w-[70px] ${
                          a.verified ? "bg-emerald-600 text-white border-emerald-600" : "border-border"
                        }`}
                      >
                        Verificado
                      </button>
                    </div>
                  </div>
                  {active && (
                    <Input
                      value={a.notes ?? ""}
                      onChange={(e) => updateChecklist(item.key, { notes: e.target.value })}
                      placeholder="Observações / peça / código"
                      className="text-sm"
                    />
                  )}
                </div>
              );
            })}
          </CardContent>
        </Card>
      )}

      {step === 4 && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-base">4. Itens ({items.length})</CardTitle>
              <div className="flex gap-2">
                <Button size="sm" variant="outline" onClick={() => addItem("part")}>
                  <Plus className="h-3 w-3" />Peça
                </Button>
                <Button size="sm" variant="outline" onClick={() => addItem("labour")}>
                  <Plus className="h-3 w-3" />Mão-de-obra
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            {items.length === 0 ? (
              <div className="text-sm text-muted-foreground text-center py-6">Sem itens. Adiciona peça ou mão-de-obra.</div>
            ) : (
              items.map((item) => (
                <div key={item.id} className="rounded-md border border-border p-3 space-y-2">
                  <div className="flex items-center justify-between">
                    <Badge variant={item.kind === "part" ? "default" : "secondary"}>
                      {item.kind === "part" ? "Peça" : "Mão-de-obra"}
                    </Badge>
                    <Button size="icon" variant="ghost" onClick={() => removeItem(item.id)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                  <Input
                    value={item.description}
                    onChange={(e) => updateItem(item.id, { description: e.target.value })}
                    placeholder="Descrição"
                    className="text-base"
                  />
                  {item.kind === "part" && (
                    <Input
                      value={item.partCode}
                      onChange={(e) => updateItem(item.id, { partCode: e.target.value })}
                      placeholder="Código peça"
                      className="font-mono"
                    />
                  )}
                  <div className="grid grid-cols-2 gap-2">
                    <Input
                      type="number"
                      step="0.01"
                      min="0"
                      value={item.quantity}
                      onChange={(e) => updateItem(item.id, { quantity: Number(e.target.value) })}
                      placeholder="Quantidade"
                      inputMode="decimal"
                      className="text-base"
                    />
                    <Input
                      type="number"
                      step="0.01"
                      min="0"
                      value={item.unitPrice}
                      onChange={(e) => updateItem(item.id, { unitPrice: Number(e.target.value) })}
                      placeholder="€ / unid."
                      inputMode="decimal"
                      className="text-base"
                    />
                  </div>
                </div>
              ))
            )}
            <div className="text-right text-sm">
              Total: <span className="font-mono font-semibold">{total.toFixed(2)} €</span>
            </div>
          </CardContent>
        </Card>
      )}

      {step === 5 && (
        <Card>
          <CardHeader><CardTitle className="text-base">5. Fotos (opcional)</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            {(["before", "detail", "after"] as const).map((stage) => (
              <label key={stage} className="flex items-center gap-3 rounded-md border border-dashed border-border p-4 cursor-pointer">
                <Camera className="h-5 w-5 text-muted-foreground" />
                <div className="flex-1">
                  <div className="text-sm font-medium">{photoStageLabel(stage)}</div>
                  <div className="text-xs text-muted-foreground">Tocar para abrir câmara</div>
                </div>
                <input type="file" accept="image/*" capture="environment" className="hidden" />
              </label>
            ))}
            <p className="text-xs text-muted-foreground">
              As fotos ficam associadas à folha de obra quando o armazenamento na União Europeia estiver activo.
            </p>
          </CardContent>
        </Card>
      )}

      {step === 6 && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-base">6. Assinatura</CardTitle>
              <Badge variant="secondary">{mechanicName}</Badge>
            </div>
          </CardHeader>
          <CardContent>
            <SignaturePadCanvas value={signaturePath} onChange={setSignaturePath} />
          </CardContent>
        </Card>
      )}

      {step === 7 && (
        <Card>
          <CardHeader><CardTitle className="text-base">7. Revisão</CardTitle></CardHeader>
          <CardContent className="space-y-3 text-sm">
            <Kv label="Matrícula" value={plate} />
            <Kv label="Serviço" value={serviceCode} />
            <Kv
              label="Checklist"
              value={`${checklist.filter((c) => c.substituted || c.verified).length}/${WORKSHOP_CHECKLIST.length} marcados`}
            />
            <Kv label="Itens" value={`${items.length} linhas · total ${total.toFixed(2)} €`} />
            <Kv label="Assinatura" value={signaturePath ? "✓ assinada" : "✗ em falta"} />
            {summary && <Kv label="Sumário" value={summary} />}
            <textarea
              value={summary}
              onChange={(e) => setSummary(e.target.value)}
              rows={2}
              className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm"
              placeholder="Sumário opcional para a factura/PHC Advanced"
              aria-label="Sumário opcional para a factura ou PHC Advanced"
            />
          </CardContent>
        </Card>
      )}

      <div className="flex gap-2 sticky bottom-4">
        {step > 1 && (
          <Button type="button" variant="outline" size="lg" onClick={() => setStep(step - 1)}>
            ← Anterior
          </Button>
        )}
        {step < 7 ? (
          <Button
            type="button"
            size="lg"
            className="flex-1"
            disabled={!canNext}
            onClick={() => setStep(step + 1)}
          >
            Continuar →
          </Button>
        ) : (
          <Button type="button" size="lg" variant="success" className="flex-1" disabled={submitting} onClick={handleSubmit}>
            <Check className="h-4 w-4" />
            {submitting ? "A submeter..." : "Submeter folha"}
          </Button>
        )}
      </div>
    </div>
  );
}

function SignaturePadCanvas({ value, onChange }: { value: string; onChange: (svg: string) => void }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const drawingRef = useRef(false);
  const pointsRef = useRef<Array<{ x: number; y: number }>>([]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.lineWidth = 2;
    ctx.lineCap = "round";
    ctx.strokeStyle = "#1e40af";

    function getPos(e: PointerEvent): { x: number; y: number } {
      const rect = canvas!.getBoundingClientRect();
      return { x: e.clientX - rect.left, y: e.clientY - rect.top };
    }

    function start(e: PointerEvent) {
      drawingRef.current = true;
      pointsRef.current = [getPos(e)];
    }
    function move(e: PointerEvent) {
      if (!drawingRef.current) return;
      const p = getPos(e);
      const last = pointsRef.current[pointsRef.current.length - 1];
      if (last) {
        ctx!.beginPath();
        ctx!.moveTo(last.x, last.y);
        ctx!.lineTo(p.x, p.y);
        ctx!.stroke();
      }
      pointsRef.current.push(p);
    }
    function end() {
      drawingRef.current = false;
      const pts = pointsRef.current;
      if (pts.length < 2) return;
      const path = "M " + pts.map((p) => `${p.x.toFixed(1)} ${p.y.toFixed(1)}`).join(" L ");
      onChange(path);
    }

    canvas.addEventListener("pointerdown", start);
    canvas.addEventListener("pointermove", move);
    canvas.addEventListener("pointerup", end);
    canvas.addEventListener("pointerleave", end);
    return () => {
      canvas.removeEventListener("pointerdown", start);
      canvas.removeEventListener("pointermove", move);
      canvas.removeEventListener("pointerup", end);
      canvas.removeEventListener("pointerleave", end);
    };
  }, [onChange]);

  function clear() {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    ctx?.clearRect(0, 0, canvas.width, canvas.height);
    pointsRef.current = [];
    onChange("");
  }

  return (
    <div className="space-y-2">
      <canvas
        ref={canvasRef}
        width={600}
        height={200}
        aria-label="Área de assinatura do mecânico"
        className="w-full h-[200px] rounded-md border-2 border-dashed border-border bg-secondary/30 touch-none"
      />
      <div className="flex justify-between items-center">
        <span className="text-xs text-muted-foreground">Assinar com dedo ou stylus</span>
        <Button type="button" variant="outline" size="sm" onClick={clear}>Limpar</Button>
      </div>
      {value && <Badge variant="success" className="text-[10px]">✓ assinado</Badge>}
    </div>
  );
}

function Kv({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-xs text-muted-foreground">{label}</span>
      <span className="font-mono text-sm">{value}</span>
    </div>
  );
}

function photoStageLabel(stage: "before" | "detail" | "after"): string {
  if (stage === "before") return "Antes";
  if (stage === "detail") return "Detalhe";
  return "Depois";
}
