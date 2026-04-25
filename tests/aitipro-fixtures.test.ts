import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

function readFixture<T>(name: string): T {
  return JSON.parse(fs.readFileSync(path.join(process.cwd(), "fixtures", "aitipro", name), "utf-8")) as T;
}

describe("AITIPRO evidence fixtures", () => {
  it("preserves audited freight baselines", () => {
    const summary = readFixture<Record<string, number>>("freight-summary.json");
    expect(summary.loads).toBe(306);
    expect(summary.priceRows).toBe(299);
    expect(summary.uniqueTransporters).toBe(26);
    expect(summary.uniqueClients).toBe(41);
    expect(summary.uniqueRoutes).toBe(86);
    expect(summary.internalLloretransLoads).toBe(135);
    expect(summary.sellSum).toBe(135222.72);
    expect(summary.buySum).toBe(137022.72);
    expect(summary.marginSum).toBe(-1800);
  });

  it("preserves audited fuel baselines", () => {
    const summary = readFixture<{ providers: Record<string, { rows: number }> }>("fuel-summary.json");
    expect(summary.providers.cepsa.rows).toBe(1261);
    expect(summary.providers.frotcom_fee.rows).toBe(181);
    expect(summary.providers.radius_velocity.rows).toBe(96);
    expect(summary.providers.bomba_interna.rows).toBe(629);
    expect(summary.providers.repsol.rows).toBe(175);
  });

  it("preserves audited fleet baselines", () => {
    const vehicles = readFixture<Array<{ source: string; gps: string | null }>>("vehicles.json");
    const drivers = readFixture<Array<{ name: string; contactRaw: string | null }>>("drivers.json");
    expect(vehicles.filter((v) => v.source === "viaturas_grupo_lloretrans").length).toBeGreaterThanOrEqual(127);
    expect(drivers.length).toBeGreaterThanOrEqual(68);
    expect(vehicles.some((v) => v.gps === "SIM")).toBe(true);
    expect(vehicles.some((v) => v.gps === "NÃO")).toBe(true);
  });
});
