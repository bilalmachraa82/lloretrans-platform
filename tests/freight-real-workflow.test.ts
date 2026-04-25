import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import type { AitiproFreightLoad } from "@/lib/freight/excel-model";

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
});
