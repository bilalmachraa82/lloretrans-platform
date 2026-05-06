"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { PageHeader } from "@/components/ui/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, ArrowRight, Trash2, Plus, Camera, Check } from "lucide-react";
import { submitWorkOrder } from "../actions";
import {
  emptyChecklist,
  filterChecklistForContext,
  normalizeWorkshopVehicleKind,
  type ChecklistAnswer,
  type ChecklistItemKey,
} from "@/lib/workshop-checklist";
import { formatServiceLabel } from "@/lib/service-labels";

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
  sourceCode?: string;
}

type PhotoStage = "before" | "detail" | "after";
type PhotoState = Partial<Record<PhotoStage, string>>;

type TemplateItem = Omit<Item, "id" | "sourceCode">;

const TEMPLATES: Record<string, TemplateItem[]> = {
  S1: [
    { kind: "part", description: "Pneu 315/70 R22.5", partCode: "TYR-315", quantity: 2, unitPrice: 485 },
    { kind: "labour", description: "Montagem, equilibragem e alinhamento", partCode: "", quantity: 2, unitPrice: 32.5 },
  ],
  S2: [
    { kind: "part", description: "Lâmpadas, fichas e cablagem", partCode: "ELEC-GEN", quantity: 1, unitPrice: 35 },
    { kind: "labour", description: "Diagnóstico eléctrico", partCode: "", quantity: 1, unitPrice: 55 },
  ],
  S3: [
    { kind: "part", description: "Consumível motor de frio", partCode: "FRIO-CONS", quantity: 1, unitPrice: 95 },
    { kind: "labour", description: "Diagnóstico motor de frio / termógrafo", partCode: "", quantity: 1, unitPrice: 75 },
  ],
  S4: [
    { kind: "part", description: "Material bate-chapa / pintura", partCode: "CHAPA-PINT", quantity: 1, unitPrice: 120 },
    { kind: "labour", description: "Preparação e pintura", partCode: "", quantity: 2, unitPrice: 58 },
  ],
  L1: [
    { kind: "part", description: "Pneu frota", partCode: "TYR-FROTA", quantity: 2, unitPrice: 485 },
    { kind: "labour", description: "Montagem, equilibragem e alinhamento", partCode: "", quantity: 2, unitPrice: 25 },
  ],
  L2: [
    { kind: "part", description: "Lâmpadas, fichas e cablagem", partCode: "ELEC-GEN", quantity: 1, unitPrice: 35 },
    { kind: "labour", description: "Diagnóstico eléctrico", partCode: "", quantity: 1, unitPrice: 55 },
  ],
  L3: [
    { kind: "part", description: "Consumível motor de frio", partCode: "FRIO-CONS", quantity: 1, unitPrice: 95 },
    { kind: "labour", description: "Diagnóstico motor de frio / termógrafo", partCode: "", quantity: 1, unitPrice: 75 },
  ],
  L7: [
    { kind: "part", description: "Kit revisão interna", partCode: "REV-INT", quantity: 1, unitPrice: 145 },
    { kind: "part", description: "Filtro de óleo", partCode: "FIL-OIL", quantity: 1, unitPrice: 14.8 },
    { kind: "labour", description: "Mecânica geral interna", partCode: "", quantity: 2, unitPrice: 55 },
  ],
  I3: [
    { kind: "part", description: "AdBlue / fluidos", partCode: "FLUID-INT", quantity: 1, unitPrice: 38 },
    { kind: "labour", description: "Verificação de níveis", partCode: "", quantity: 0.5, unitPrice: 45 },
  ],
  I7: [
    { kind: "labour", description: "Preparação e deslocação IPO", partCode: "", quantity: 1, unitPrice: 45 },
  ],
};

const DRAFT_KEY = "oficina.wo.draft.v2";

const VEHICLE_KIND_LABELS: Record<string, string> = {
  pesado_mercadorias: "Pesado mercadorias",
  pesado_passageiros: "Pesado passageiros",
  ligeiro: "Ligeiro",
  trator: "Tractor",
  reboque: "Reboque",
};

const SERVICE_KIND_LABELS: Record<string, string> = {
  oficina_interna: "Frota Lloretrans",
  oficina_externa: "Cliente externo",
  operacao_interna: "Operação interna",
};

const WORKSHOP_SERVICE_KINDS = new Set(["oficina_interna", "oficina_externa", "operacao_interna"]);
const TRAILER_CODES = new Set(["L1", "L2", "L3", "L4", "L5", "L6", "L7", "L8", "I4", "I5", "I7", "I8", "I9"]);
const LIGHT_CODES = new Set(["L1", "L2", "L4", "L5", "L6", "L7", "L8", "I0", "I1", "I3", "I4", "I6", "I7", "I8", "I9"]);
const STEP_LABELS = ["Matrícula", "Intervenções", "Checklist", "Itens", "Fotos", "Assinatura", "Revisão"];

function vehicleKindLabel(kind: string): string {
  const normalised = normalizeWorkshopVehicleKind(kind);
  if (normalised && VEHICLE_KIND_LABELS[normalised]) return VEHICLE_KIND_LABELS[normalised];
  return kind.replaceAll("_", " ");
}

function serviceKindLabel(kind: string): string {
  return SERVICE_KIND_LABELS[kind] ?? kind.replaceAll("_", " ");
}

function serviceAppliesToVehicle(code: ServiceCode, vehicleKind: string | undefined): boolean {
  if (!WORKSHOP_SERVICE_KINDS.has(code.kind)) return false;
  if (!vehicleKind) return code.kind !== "oficina_externa";

  const kind = normalizeWorkshopVehicleKind(vehicleKind);
  const serviceCode = code.code.toUpperCase();

  if (code.kind === "oficina_externa") return false;
  if (kind === "reboque") return TRAILER_CODES.has(serviceCode);
  if (kind === "ligeiro") return LIGHT_CODES.has(serviceCode);
  return code.kind === "oficina_interna" || code.kind === "operacao_interna";
}

function serviceSortWeight(code: ServiceCode): number {
  if (code.code.startsWith("L")) return 0;
  if (code.code.startsWith("I")) return 1;
  return 2;
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
  const [selectedServiceCodes, setSelectedServiceCodes] = useState<string[]>([]);
  const [summary, setSummary] = useState("");
  const [items, setItems] = useState<Item[]>([]);
  const [checklist, setChecklist] = useState<ChecklistAnswer[]>(() => emptyChecklist());
  const [photos, setPhotos] = useState<PhotoState>({});
  const [signaturePath, setSignaturePath] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // Load draft on mount
  useEffect(() => {
    try {
      const raw = localStorage.getItem(DRAFT_KEY);
      if (raw) {
        const d = JSON.parse(raw);
        setPlate(d.plate ?? "");
        setSelectedServiceCodes(
          Array.isArray(d.selectedServiceCodes)
            ? d.selectedServiceCodes
            : d.serviceCode
              ? [d.serviceCode]
              : [],
        );
        setSummary(d.summary ?? "");
        setItems(d.items ?? []);
        setPhotos(d.photos ?? {});
        if (Array.isArray(d.checklist) && d.checklist.length > 0) setChecklist(d.checklist);
      }
    } catch {}
  }, []);

  // Persist draft on every change
  useEffect(() => {
    try {
      localStorage.setItem(
        DRAFT_KEY,
        JSON.stringify({ plate, selectedServiceCodes, summary, items, checklist, photos }),
      );
    } catch {}
  }, [plate, selectedServiceCodes, summary, items, checklist, photos]);

  function updateChecklist(key: ChecklistItemKey, patch: Partial<ChecklistAnswer>) {
    setChecklist((cur) => cur.map((c) => (c.key === key ? { ...c, ...patch } : c)));
  }

  const selectedVehicle = vehicles.find((v) => v.plate === plate);
  const selectedVehicleKind = selectedVehicle?.kind;
  const visibleChecklist = filterChecklistForContext(selectedServiceCodes, selectedVehicleKind);
  const visibleChecklistKeys = new Set(visibleChecklist.map((item) => item.key));
  const checklistTouched = checklist.some(
    (c) => visibleChecklistKeys.has(c.key) && (c.substituted || c.verified || (c.notes ?? "").trim()),
  );
  const touchedVisibleChecklist = checklist.filter(
    (c) => visibleChecklistKeys.has(c.key) && (c.substituted || c.verified || (c.notes ?? "").trim()),
  );
  const selectedServices = selectedServiceCodes
    .map((code) => serviceCodes.find((service) => service.code === code))
    .filter((service): service is ServiceCode => Boolean(service));
  const primaryServiceCode = selectedServiceCodes[0] ?? "";
  const workshopCodes = serviceCodes
    .filter((code) => WORKSHOP_SERVICE_KINDS.has(code.kind))
    .sort((a, b) => serviceSortWeight(a) - serviceSortWeight(b) || a.code.localeCompare(b.code));
  const recommendedCodes = workshopCodes.filter((code) => serviceAppliesToVehicle(code, selectedVehicleKind));
  const otherCodes = workshopCodes.filter((code) => !serviceAppliesToVehicle(code, selectedVehicleKind));

  const total = items.reduce((a, i) => a + i.quantity * i.unitPrice, 0);

  function handlePlateChange(nextPlate: string) {
    const nextVehicleKind = vehicles.find((v) => v.plate === nextPlate)?.kind;
    const allowed = new Set(
      serviceCodes
        .filter((code) => serviceAppliesToVehicle(code, nextVehicleKind))
        .map((code) => code.code),
    );
    setPlate(nextPlate);
    setSelectedServiceCodes((current) => current.filter((code) => allowed.has(code)));
    setItems((current) =>
      current.filter((item) => !item.sourceCode || allowed.has(item.sourceCode)),
    );
  }

  function toggleServiceCode(code: string) {
    const isSelected = selectedServiceCodes.includes(code);
    if (isSelected) {
      setSelectedServiceCodes((current) => current.filter((selected) => selected !== code));
      setItems((current) => current.filter((item) => item.sourceCode !== code));
      return;
    }

    setSelectedServiceCodes((current) => [...current, code]);
    const tpl = TEMPLATES[code];
    if (!tpl) return;
    setItems((current) => {
      const existing = new Set(current.map((item) => `${item.sourceCode ?? "manual"}:${item.kind}:${item.description}`));
      const next = tpl
        .map((template) => ({ ...template, id: crypto.randomUUID(), sourceCode: code }))
        .filter((item) => !existing.has(`${item.sourceCode}:${item.kind}:${item.description}`));
      return [...current, ...next];
    });
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

  function updatePhoto(stage: PhotoStage, file: File | null) {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result !== "string") return;
      setPhotos((current) => ({ ...current, [stage]: reader.result as string }));
    };
    reader.readAsDataURL(file);
  }

  function removePhoto(stage: PhotoStage) {
    setPhotos((current) => {
      const next = { ...current };
      delete next[stage];
      return next;
    });
  }

  function resetDraft() {
    setPlate("");
    setSelectedServiceCodes([]);
    setSummary("");
    setItems([]);
    setChecklist(emptyChecklist());
    setPhotos({});
    setSignaturePath("");
    setStep(1);
    try {
      localStorage.removeItem(DRAFT_KEY);
    } catch {}
  }

  async function handleSubmit() {
    if (!plate || !primaryServiceCode || items.length === 0 || !signaturePath) {
      alert("Preenche todos os passos antes de submeter.");
      return;
    }
    const serviceSummary = selectedServices.length > 0
      ? selectedServices.map((service) => `${service.code} ${formatServiceLabel(service.label)}`).join(" + ")
      : primaryServiceCode;
    const finalSummary = summary.trim()
      ? `${summary.trim()} · Códigos: ${selectedServiceCodes.join(", ")}`
      : `Intervenções ${serviceSummary} · ${plate}`;
    setSubmitting(true);
    const payload = {
      plate,
      serviceCode: primaryServiceCode,
      serviceCodes: selectedServiceCodes,
      summary: finalSummary,
      items: items.map((i) => ({
        kind: i.kind,
        description: i.description,
        partCode: i.partCode || undefined,
        quantity: i.quantity,
        unitPrice: i.unitPrice,
      })),
      checklist: checklist
        .filter((c) => visibleChecklistKeys.has(c.key) && (c.substituted || c.verified || (c.notes ?? "").trim()))
        .map((c) => ({
          key: c.key,
          substituted: c.substituted,
          verified: c.verified,
          notes: (c.notes ?? "").trim() || undefined,
        })),
      photos: (["before", "detail", "after"] as const)
        .filter((stage) => photos[stage])
        .map((stage) => ({ stage, path: photos[stage]! })),
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
    2: selectedServiceCodes.length > 0,
    3: true, // checklist opcional — mecânico pode saltar se só intervém em itens avulsos
    4: items.length > 0 && items.every((i) => i.description.trim()),
    5: true, // fotos opcionais
    6: signaturePath !== "",
  }[step];

  function renderServiceCodeButton(c: ServiceCode, secondary = false) {
    const selected = selectedServiceCodes.includes(c.code);
    return (
      <button
        key={c.code}
        type="button"
        aria-pressed={selected}
        onClick={() => toggleServiceCode(c.code)}
        className={`text-left p-4 rounded-lg border-2 transition-colors min-h-[104px] ${
          selected
            ? "border-primary bg-primary/5 shadow-sm"
            : secondary
              ? "border-dashed border-border bg-secondary/30 hover:border-primary/40"
              : "border-border hover:border-primary/40"
        }`}
      >
        <div className="flex items-start justify-between gap-3">
          <div>
            <div className="font-mono text-sm font-semibold">{c.code}</div>
            <div className="mt-1 text-sm font-medium leading-snug">{formatServiceLabel(c.label)}</div>
          </div>
          {selected && <Check className="h-4 w-4 text-primary" />}
        </div>
        <div className="mt-3 flex flex-wrap gap-1">
          <Badge variant="secondary" className="text-[10px]">{serviceKindLabel(c.kind)}</Badge>
          {TEMPLATES[c.code] && (
            <Badge variant="outline" className="text-[10px]">pré-preenchido</Badge>
          )}
        </div>
      </button>
    );
  }

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      <PageHeader
        title={`Nova folha · ${STEP_LABELS[step - 1]}`}
        description={`Passo ${step}/7 · rascunho automático · fluxo adaptado à matrícula e à intervenção`}
        actions={
          <div className="flex flex-wrap gap-2">
            <Button type="button" variant="outline" onClick={resetDraft}>
              Limpar rascunho
            </Button>
            <Button variant="outline" asChild>
              <Link href="/oficina">Cancelar</Link>
            </Button>
          </div>
        }
      />

      <div className="space-y-2">
        <div className="flex gap-1">
          {[1, 2, 3, 4, 5, 6, 7].map((n) => (
            <div
              key={n}
              className={`h-1.5 flex-1 rounded-full ${n <= step ? "bg-primary" : "bg-secondary"}`}
            />
          ))}
        </div>
        <div className="grid grid-cols-7 gap-1 text-[10px] leading-tight text-muted-foreground">
          {STEP_LABELS.map((label, index) => (
            <div key={label} className={index + 1 === step ? "font-semibold text-primary" : ""}>
              {label}
            </div>
          ))}
        </div>
      </div>

      {step === 1 && (
        <Card>
          <CardHeader><CardTitle className="text-base">1. Matrícula</CardTitle></CardHeader>
          <CardContent>
            <select
              value={plate}
              onChange={(e) => handlePlateChange(e.target.value)}
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
          <CardHeader>
            <CardTitle className="text-base">2. Intervenções</CardTitle>
          </CardHeader>
          <CardContent className="space-y-5">
            <div className="rounded-lg border border-primary/15 bg-primary/5 p-4 text-sm">
              <div className="font-medium">
                {plate ? `${plate} · ${vehicleKindLabel(selectedVehicleKind ?? "")}` : "Escolha uma matrícula no passo anterior"}
              </div>
              <div className="mt-1 text-xs text-muted-foreground">
                Pode seleccionar várias intervenções. A checklist seguinte fica filtrada por viatura e códigos.
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between gap-3">
                <div className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  Recomendadas para esta viatura
                </div>
                <Badge variant="secondary">{selectedServiceCodes.length} seleccionadas</Badge>
              </div>
              <div className="grid gap-2 sm:grid-cols-2">
                {recommendedCodes.map((c) => renderServiceCodeButton(c))}
              </div>
            </div>

            {otherCodes.length > 0 && (
              <details className="rounded-lg border border-border bg-secondary/20 p-3">
                <summary className="cursor-pointer text-sm font-medium">
                  Outros códigos de oficina ({otherCodes.length})
                </summary>
                <div className="mt-3 grid gap-2 sm:grid-cols-2">
                  {otherCodes.map((c) => renderServiceCodeButton(c, true))}
                </div>
              </details>
            )}
          </CardContent>
        </Card>
      )}

      {step === 3 && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-base">3. Checklist adaptada ({visibleChecklist.length} itens)</CardTitle>
              {checklistTouched && <Badge variant="success">{touchedVisibleChecklist.length} marcados</Badge>}
            </div>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="rounded-lg border border-border bg-secondary/25 p-3 text-xs text-muted-foreground">
              <div className="font-medium text-foreground">
                {selectedVehicleKind ? vehicleKindLabel(selectedVehicleKind) : "Viatura"} · {selectedServiceCodes.join(", ")}
              </div>
              <div className="mt-1">
                Só aparecem os pontos aplicáveis à matrícula e às intervenções seleccionadas.
                Marque o que foi <strong>substituído</strong> ou <strong>verificado</strong>.
              </div>
            </div>
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
                    <div className="flex flex-wrap gap-1">
                      <Badge variant={item.kind === "part" ? "default" : "secondary"}>
                        {item.kind === "part" ? "Peça" : "Mão-de-obra"}
                      </Badge>
                      {item.sourceCode && <Badge variant="outline">{item.sourceCode}</Badge>}
                    </div>
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
              <div key={stage} className="rounded-md border border-dashed border-border p-3">
                <label className="flex items-center gap-3 cursor-pointer">
                  <Camera className="h-5 w-5 text-muted-foreground" />
                  <div className="flex-1">
                    <div className="text-sm font-medium">{photoStageLabel(stage)}</div>
                    <div className="text-xs text-muted-foreground">
                      {photos[stage] ? "Foto anexada. Toque para substituir." : "Tocar para abrir câmara"}
                    </div>
                  </div>
                  <input
                    type="file"
                    accept="image/*"
                    capture="environment"
                    className="hidden"
                    onChange={(event) => updatePhoto(stage, event.target.files?.[0] ?? null)}
                  />
                </label>
                {photos[stage] && (
                  <div className="mt-3 grid grid-cols-[96px_1fr] items-center gap-3">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={photos[stage]}
                      alt={`Foto ${photoStageLabel(stage).toLowerCase()}`}
                      className="h-20 w-24 rounded-md border border-border object-cover"
                    />
                    <div className="space-y-2">
                      <Badge variant="success">Foto guardada no rascunho</Badge>
                      <div>
                        <Button type="button" size="sm" variant="outline" onClick={() => removePhoto(stage)}>
                          Remover
                        </Button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))}
            <p className="text-xs text-muted-foreground">
              As fotos ficam associadas à folha submetida e mantidas em armazenamento na União Europeia.
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
            <div className="rounded-md border border-success/25 bg-success/5 p-3 text-xs leading-relaxed text-muted-foreground">
              Ao submeter, a folha entra em validação administrativa. A exportação para PHC Advanced só deve acontecer
              depois de aprovada.
            </div>
            <Kv label="Matrícula" value={plate} />
            <Kv label="Tipo" value={selectedVehicleKind ? vehicleKindLabel(selectedVehicleKind) : "—"} />
            <Kv label="Intervenções" value={selectedServiceCodes.join(", ")} />
            <Kv
              label="Checklist"
              value={`${touchedVisibleChecklist.length}/${visibleChecklist.length} marcados`}
            />
            <Kv label="Fotos" value={`${Object.values(photos).filter(Boolean).length}/3 anexadas`} />
            <Kv label="Itens" value={`${items.length} linhas · total ${total.toFixed(2)} €`} />
            <Kv label="Assinatura" value={signaturePath ? "Assinada" : "Em falta"} />
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
            <ArrowLeft className="h-4 w-4" />
            Anterior
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
            Continuar
            <ArrowRight className="h-4 w-4" />
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
      {value && <Badge variant="success" className="text-[10px]">Assinado</Badge>}
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
