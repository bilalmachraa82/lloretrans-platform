import { describe, expect, it } from "vitest";
import fs from "node:fs";
import path from "node:path";
import {
  WORKSHOP_CHECKLIST,
  filterChecklistForContext,
  filterChecklistForService,
} from "@/lib/workshop-checklist";

describe("workshop real codes", () => {
  it("keeps exactly the 17 paper checklist items", () => {
    expect(WORKSHOP_CHECKLIST).toHaveLength(17);
    expect(WORKSHOP_CHECKLIST.map((item) => item.label)).toContain("Travões");
    expect(WORKSHOP_CHECKLIST.map((item) => item.label)).toContain("Velas");
    expect(WORKSHOP_CHECKLIST.map((item) => item.label)).toContain("Alinhar direcção");
    expect(WORKSHOP_CHECKLIST.map((item) => item.label)).toContain("Inspecção");
  });

  it("keeps workshop labels in Portuguese from Portugal", () => {
    const labels = [
      ...WORKSHOP_CHECKLIST.map((item) => item.label),
      ...JSON.parse(fs.readFileSync(path.join(process.cwd(), "fixtures", "aitipro", "service-codes.json"), "utf-8")).map(
        (item: { label: string }) => item.label,
      ),
    ].join("\n");

    expect(labels).not.toMatch(/direção|Eletricista|Eletrónica|Retificação|Inspeção|Inspeções/);
  });

  it("does not depend on the obsolete external-service code", () => {
    const obsoleteExternalCode = ["S", "17"].join("");
    const labels = filterChecklistForService("L7").map((item) => item.label);
    const relatedCodes = WORKSHOP_CHECKLIST.flatMap((item) => item.relatedServiceCodes ?? []);
    expect(relatedCodes).not.toContain(obsoleteExternalCode);
    expect(labels).toContain("Travões");
    expect(labels).toContain("Suspensão");
  });

  it("adapts the checklist to vehicle kind and multiple service codes", () => {
    const lightLabels = filterChecklistForContext(["L2", "L7"], "ligeiro").map((item) => item.label);
    expect(lightLabels).toContain("Luzes");
    expect(lightLabels).toContain("Velas");
    expect(lightLabels).toContain("Travões");
    expect(lightLabels).toContain("Filtro de óleo");

    const trailerLabels = filterChecklistForContext(["L2", "L7"], "reboque").map((item) => item.label);
    expect(trailerLabels).toContain("Luzes");
    expect(trailerLabels).toContain("Travões");
    expect(trailerLabels).not.toContain("Filtro de óleo");
    expect(trailerLabels).not.toContain("Velas");
  });

  it("normalises real fleet vehicle labels before filtering", () => {
    const heavyLabels = filterChecklistForContext(["L7"], "Pesado").map((item) => item.label);
    expect(heavyLabels).toContain("Filtro de óleo");
    expect(heavyLabels).toContain("Travões");

    const truckLabels = filterChecklistForContext(["L7"], "Camião").map((item) => item.label);
    expect(truckLabels).toContain("Filtro de gasóleo");
    expect(truckLabels).not.toContain("Velas");

    const passengerHeavyLabels = filterChecklistForContext(["L7"], "P. Passageiros").map((item) => item.label);
    expect(passengerHeavyLabels).toContain("Filtro de óleo");
    expect(passengerHeavyLabels).not.toContain("Velas");
  });
});
