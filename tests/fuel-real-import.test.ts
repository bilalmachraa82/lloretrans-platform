import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { isConsumptionProvider } from "@/lib/fuel/provider-model";

const transactions = JSON.parse(
  fs.readFileSync(path.join(process.cwd(), "fixtures", "aitipro", "fuel-transactions.json"), "utf-8"),
) as Array<{ provider: string; liters: number | null; totalEur: number | null }>;

describe("real fuel import", () => {
  it("keeps real provider names", () => {
    expect(new Set(transactions.map((row) => row.provider))).toEqual(
      new Set(["cepsa", "repsol", "radius_velocity", "bomba_interna", "frotcom_fee"]),
    );
  });

  it("does not treat Frotcom billing rows as consumption", () => {
    const frotcomRows = transactions.filter((row) => row.provider === "frotcom_fee");
    expect(frotcomRows).toHaveLength(181);
    expect(frotcomRows.every((row) => row.liters == null)).toBe(true);
    expect(isConsumptionProvider("frotcom_fee")).toBe(false);
  });
});
