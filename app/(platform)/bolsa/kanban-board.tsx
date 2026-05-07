"use client";

import Link from "next/link";
import { type DragEvent, useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, GripVertical, Loader2, MoveHorizontal, Route } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatEur, formatPercent } from "@/lib/money";
import {
  canTransition,
  FREIGHT_STATES,
  STATE_LABELS,
  type FreightState,
} from "@/lib/freight-state";
import { transitionState } from "./actions";

export type FreightKanbanRow = {
  id: string;
  reference: string;
  state: FreightState;
  origin: string;
  destination: string;
  margin: number;
  marginPct: number;
  carrierKind: string;
  paymentRegularization: string | null;
  clientName: string | null;
  clientCountry: string | null;
};

type StateMeta = Record<FreightState, { label: string; tone: string; dot: string; rail: string }>;

export function FreightKanbanBoard({
  rows,
  stateMeta,
}: {
  rows: FreightKanbanRow[];
  stateMeta: StateMeta;
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [dragged, setDragged] = useState<{ id: string; state: FreightState } | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [message, setMessage] = useState<string>("Arrasta uma carga para a coluna seguinte ou anterior.");

  const groupedByState = useMemo(() => {
    const grouped: Record<FreightState, FreightKanbanRow[]> = {
      scheduled: [],
      delivered: [],
      supplier_invoiced: [],
      client_invoiced: [],
      paid: [],
    };
    for (const row of rows) grouped[row.state]?.push(row);
    return grouped;
  }, [rows]);

  function handleDrop(event: DragEvent<HTMLDivElement>, targetState: FreightState) {
    const payload = readDragPayload(event) ?? dragged;
    if (!payload) return;
    if (payload.state === targetState) {
      setMessage("Carga mantida no mesmo estado.");
      return;
    }
    if (!canTransition(payload.state, targetState)) {
      setMessage("Movimento bloqueado: usa apenas a coluna imediatamente seguinte ou anterior.");
      return;
    }

    const formData = new FormData();
    formData.set("loadId", payload.id);
    formData.set("toState", targetState);
    formData.set("reason", `Movido no Kanban para ${STATE_LABELS[targetState]}`);
    setBusyId(payload.id);
    setMessage(`A mover para ${STATE_LABELS[targetState]}...`);
    startTransition(async () => {
      try {
        await transitionState(formData);
        setMessage(`Carga movida para ${STATE_LABELS[targetState]}.`);
        router.refresh();
      } catch (error) {
        setMessage(error instanceof Error ? error.message : "Não foi possível mover a carga.");
      } finally {
        setBusyId(null);
        setDragged(null);
      }
    });
  }

  return (
    <section className="space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-[#d8e1df] bg-white px-4 py-3 shadow-elevated-sm">
        <div className="flex items-center gap-2 text-sm font-semibold text-[#1e2d3d]">
          <MoveHorizontal className="h-4 w-4 text-primary" />
          Pipeline interactivo
        </div>
        <div className="text-xs text-muted-foreground">{isPending ? "A actualizar estado..." : message}</div>
      </div>

      <div className="grid gap-4 xl:grid-cols-5">
        {FREIGHT_STATES.map((state) => {
          const isAllowedDrop = dragged ? dragged.state === state || canTransition(dragged.state, state) : false;
          const isBlockedDrop = Boolean(dragged && dragged.state !== state && !canTransition(dragged.state, state));
          const stateRows = groupedByState[state];

          return (
            <div
              key={state}
              data-kanban-column={state}
              onDragOver={(event) => {
                event.preventDefault();
                event.dataTransfer.dropEffect = isAllowedDrop ? "move" : "none";
              }}
              onDrop={(event) => {
                event.preventDefault();
                handleDrop(event, state);
              }}
              className={`min-w-0 rounded-lg border p-3 shadow-elevated-sm transition-colors ${
                isAllowedDrop
                  ? "border-primary/45 bg-primary/[0.04]"
                  : isBlockedDrop
                    ? "border-border/80 bg-[#f8fafc] opacity-70"
                    : "border-border/80 bg-[#f8fafc]"
              }`}
            >
              <div className="mb-3 flex items-center justify-between gap-2">
                <div className="flex min-w-0 items-center gap-2">
                  <span className={`h-2.5 w-2.5 shrink-0 rounded-full ${stateMeta[state].dot}`} />
                  <div className="min-w-0">
                    <div className="truncate text-xs font-semibold uppercase tracking-[0.12em] text-[#1e2d3d]">
                      {stateMeta[state].label}
                    </div>
                    <div className="text-[10px] text-muted-foreground">{STATE_LABELS[state]}</div>
                  </div>
                </div>
                <Badge variant="secondary">{stateRows.length}</Badge>
              </div>

              <div className="min-h-[140px] space-y-2.5">
                {stateRows.length === 0 ? (
                  <div className="rounded-md border border-dashed border-border bg-white p-4 text-xs leading-relaxed text-muted-foreground">
                    Larga aqui a carga quando avançar para este estado.
                  </div>
                ) : (
                  stateRows.slice(0, 15).map((row) => (
                    <article
                      key={row.id}
                      data-load-id={row.id}
                      data-state={row.state}
                      draggable={!isPending}
                      onDragStart={(event) => {
                        setDragged({ id: row.id, state: row.state });
                        setMessage(`A mover ${row.reference}: escolhe a coluna seguinte ou anterior.`);
                        event.dataTransfer.effectAllowed = "move";
                        event.dataTransfer.setData(
                          "application/x-lloretrans-load",
                          JSON.stringify({ id: row.id, state: row.state }),
                        );
                        event.dataTransfer.setData("text/plain", row.id);
                      }}
                      onDragEnd={() => setDragged(null)}
                      className={`group rounded-lg border border-border/80 bg-white p-3 shadow-sm transition-all ${
                        busyId === row.id ? "opacity-60" : "hover:-translate-y-0.5 hover:border-primary/55 hover:shadow-elevated"
                      }`}
                    >
                      <div className="space-y-3 text-xs">
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex min-w-0 gap-2">
                            <GripVertical className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground/70" />
                            <div className="min-w-0">
                              <div className="font-mono text-[11px] font-semibold text-primary">{row.reference}</div>
                              <div className="mt-1 truncate text-sm font-semibold text-[#1e2d3d]">
                                {row.clientName ?? "Cliente por confirmar"}
                              </div>
                            </div>
                          </div>
                          <span className="rounded-full border border-border bg-secondary px-2 py-0.5 font-mono text-[10px] text-muted-foreground">
                            {row.clientCountry ?? "PT"}
                          </span>
                        </div>

                        <div className="rounded-md bg-[#f8fafc] px-3 py-2">
                          <div className="flex items-center gap-2 text-[11px] font-medium text-[#4b5563]">
                            <Route className="h-3.5 w-3.5 text-muted-foreground" />
                            <span className="truncate">{row.origin}</span>
                            <ArrowRight className="h-3 w-3 shrink-0 text-muted-foreground" />
                            <span className="truncate">{row.destination}</span>
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-2">
                          <MiniMetric label="Margem" value={formatCompactEur(row.margin)} />
                          <MiniMetric label="Comissão" value={commissionPreviewLabel(row.margin, row.carrierKind)} />
                        </div>

                        <div className="flex flex-wrap gap-1.5">
                          <Badge variant={row.marginPct >= 0.15 ? "success" : row.marginPct >= 0.08 ? "default" : "warning"}>
                            {formatPercent(row.marginPct)}
                          </Badge>
                          <Badge variant={row.carrierKind === "internal_lloretrans" ? "success" : "secondary"}>
                            {row.carrierKind === "internal_lloretrans" ? "Lloretrans" : "Externo"}
                          </Badge>
                          <Badge
                            variant={
                              row.paymentRegularization === "R"
                                ? "success"
                                : row.paymentRegularization === "NR"
                                  ? "warning"
                                  : "secondary"
                            }
                          >
                            {row.paymentRegularization ?? "R/NR aberto"}
                          </Badge>
                        </div>

                        <div className="flex items-center justify-between border-t border-border/70 pt-2">
                          <span className="text-[10px] text-muted-foreground">
                            {busyId === row.id ? (
                              <span className="inline-flex items-center gap-1">
                                <Loader2 className="h-3 w-3 animate-spin" />
                                A mover
                              </span>
                            ) : (
                              nextActionLabel(row.state)
                            )}
                          </span>
                          <Button size="sm" variant="ghost" asChild className="h-7 px-2 text-[10px]">
                            <Link href={`/bolsa/${row.id}`}>Abrir</Link>
                          </Button>
                        </div>
                      </div>
                    </article>
                  ))
                )}
                {stateRows.length > 15 && (
                  <div className="text-center text-[10px] text-muted-foreground">
                    + {stateRows.length - 15} mais
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}

function nextActionLabel(state: FreightState): string {
  if (state === "scheduled") return "Confirmar entrega e CMR";
  if (state === "delivered") return "Registar factura fornecedor";
  if (state === "supplier_invoiced") return "Emitir factura cliente";
  if (state === "client_invoiced") return "Confirmar recebimento";
  if (state === "paid") return "Comissão fechada";
  return "Abrir detalhe";
}

function readDragPayload(event: DragEvent<HTMLDivElement>): { id: string; state: FreightState } | null {
  const raw = event.dataTransfer.getData("application/x-lloretrans-load");
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw) as { id?: unknown; state?: unknown };
    if (typeof parsed.id !== "string") return null;
    if (!FREIGHT_STATES.includes(parsed.state as FreightState)) return null;
    return { id: parsed.id, state: parsed.state as FreightState };
  } catch {
    return null;
  }
}

function commissionPreviewLabel(margin: number, carrierKind: string): string {
  const bonus = carrierKind === "internal_lloretrans" ? 2.5 : 0;
  return formatCompactEur(Math.max(0, margin * 0.2 + bonus));
}

function formatCompactEur(value: number): string {
  const abs = Math.abs(value);
  if (abs >= 1000) {
    const sign = value < 0 ? "-" : "";
    const amount = new Intl.NumberFormat("pt-PT", {
      maximumFractionDigits: abs >= 10000 ? 0 : 1,
    }).format(abs / 1000);
    return `${sign}${amount}k €`;
  }
  return formatEur(value);
}

function MiniMetric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-md border border-border/70 bg-white px-2.5 py-2">
      <div className="text-[9px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">{label}</div>
      <div className="mt-1 font-mono text-[10.5px] font-semibold leading-tight text-[#1e2d3d] [overflow-wrap:anywhere]">
        {value}
      </div>
    </div>
  );
}
