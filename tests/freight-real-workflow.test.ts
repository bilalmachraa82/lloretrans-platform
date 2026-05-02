import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import type { AitiproFreightLoad } from "@/lib/freight/excel-model";
import { computeCommissionAmount } from "@/lib/commission-rule";

const loads = JSON.parse(
  fs.readFileSync(path.join(process.cwd(), "fixtures", "aitipro", "freight-loads.json"), "utf-8"),
) as AitiproFreightLoad[];

describe("real freight workflow", () => {
  it("keeps Excel-specific operational fields", () => {
    const withCmr = loads.find((load) => load.cmrNumber);
    expect(withCmr).toMatchObject({
      transporter: expect.any(String),
      client: expect.any(String),
      origin: expect.any(String),
      destination: expect.any(String),
      cmrNumber: expect.any(String),
    });
  });

  it("models Lloretrans loads without requiring an external supplier", () => {
    const internal = loads.filter((load) => load.carrierKind === "internal_lloretrans");
    expect(internal).toHaveLength(135);
    expect(internal.some((load) => load.tractorPlate && load.trailerPlate)).toBe(true);
  });

  it("shows the audited margin reality instead of fabricated SaaS margin", () => {
    const priced = loads.filter((load) => load.marginEur != null);
    const margin = Math.round(priced.reduce((sum, load) => sum + (load.marginEur ?? 0), 0) * 100) / 100;
    expect(margin).toBe(-1800);
  });

  it("pays Lloretrans fixed bonus even when margin is zero", () => {
    const result = computeCommissionAmount(
      { margin: 0, marginPct: 0, plate: "BQ-66-GV", origin: "MARL", destination: "ALGOZ" },
      { percentOfMargin: 0.2, fixedBonusNationalEur: 2.5, fixedBonusInternationalEur: 5, requireInternalVehicle: true, minMarginPct: 0 },
      new Set(["BQ-66-GV"]),
    );
    expect(result.eligible).toBe(true);
    expect(result.amountEur).toBe(2.5);
  });

  it("classifies top Portuguese routes as national for fixed bonus", () => {
    const result = computeCommissionAmount(
      { margin: 0, marginPct: 0, plate: "BQ-71-GV", origin: "LAUNDOS", destination: "MAIA" },
      { percentOfMargin: 0.2, fixedBonusNationalEur: 2.5, fixedBonusInternationalEur: 5, requireInternalVehicle: true, minMarginPct: 0 },
      new Set(["BQ-71-GV"]),
    );
    expect(result.breakdown.isNational).toBe(true);
    expect(result.amountEur).toBe(2.5);
  });

  it("keeps margin commission for subcontracted loads without internal-vehicle bonus", () => {
    const result = computeCommissionAmount(
      { margin: 100, marginPct: 0.1, plate: null, origin: "MADRID", destination: "TOJAL" },
      { percentOfMargin: 0.2, fixedBonusNationalEur: 2.5, fixedBonusInternationalEur: 5, requireInternalVehicle: true, minMarginPct: 0 },
      new Set(["BQ-71-GV"]),
    );
    expect(result.eligible).toBe(true);
    expect(result.breakdown.percentPart).toBe(20);
    expect(result.breakdown.bonusPart).toBe(0);
    expect(result.amountEur).toBe(20);
  });
});
