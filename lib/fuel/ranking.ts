import { db } from "@/db/client";
import { fuelFills, fuelReadingsCanbus, vehicles } from "@/db/schema";
import { and, eq, gte, sum, count, max, min, sql } from "drizzle-orm";

export interface VehicleFuelRanking {
  vehicleId: string;
  plate: string;
  kind: string;
  totalLiters: number;
  totalKm: number;
  fillCount: number;
  bombaPct: number;
}

export async function getVehicleFuelRanking(windowStart: Date): Promise<VehicleFuelRanking[]> {
  const fills = await db
    .select({
      vehicleId: fuelFills.vehicleId,
      totalLiters: sum(fuelFills.liters).as("total_liters"),
      bombaLiters: sum(
        sql<number>`CASE WHEN ${fuelFills.source} = 'bomba_interna' THEN ${fuelFills.liters} ELSE 0 END`,
      ).as("bomba_liters"),
      fillCount: count().as("fill_count"),
      maxFillOdo: max(fuelFills.odometerKm).as("max_fill_odo"),
      minFillOdo: min(fuelFills.odometerKm).as("min_fill_odo"),
    })
    .from(fuelFills)
    .where(gte(fuelFills.filledAt, windowStart))
    .groupBy(fuelFills.vehicleId);

  const canbus = await db
    .select({
      vehicleId: fuelReadingsCanbus.vehicleId,
      maxOdo: max(fuelReadingsCanbus.odometerKm).as("max_odo"),
      minOdo: min(fuelReadingsCanbus.odometerKm).as("min_odo"),
    })
    .from(fuelReadingsCanbus)
    .where(gte(fuelReadingsCanbus.readAt, windowStart))
    .groupBy(fuelReadingsCanbus.vehicleId);

  const vehicleRows = await db
    .select({
      id: vehicles.id,
      plate: vehicles.plate,
      kind: vehicles.kind,
      isInternal: vehicles.isInternal,
      hasCanbus: vehicles.hasCanbus,
    })
    .from(vehicles)
    .where(and(eq(vehicles.isInternal, true), eq(vehicles.hasCanbus, true)));

  const fillsByVid = new Map<string, { totalLiters: number; bombaLiters: number; fillCount: number; kmRange: number }>();
  for (const f of fills) {
    const maxFillOdo = f.maxFillOdo != null ? Number(f.maxFillOdo) : 0;
    const minFillOdo = f.minFillOdo != null ? Number(f.minFillOdo) : 0;
    fillsByVid.set(f.vehicleId, {
      totalLiters: Number(f.totalLiters ?? 0),
      bombaLiters: Number(f.bombaLiters ?? 0),
      fillCount: Number(f.fillCount ?? 0),
      kmRange: Math.max(0, maxFillOdo - minFillOdo),
    });
  }
  const canbusByVid = new Map<string, { kmRange: number }>();
  for (const c of canbus) {
    const mx = c.maxOdo != null ? Number(c.maxOdo) : 0;
    const mn = c.minOdo != null ? Number(c.minOdo) : 0;
    canbusByVid.set(c.vehicleId, { kmRange: Math.max(0, mx - mn) });
  }

  const ranking: VehicleFuelRanking[] = vehicleRows.map((v) => {
    const f = fillsByVid.get(v.id) ?? { totalLiters: 0, bombaLiters: 0, fillCount: 0, kmRange: 0 };
    const c = canbusByVid.get(v.id) ?? { kmRange: 0 };
    const bombaPct = f.totalLiters > 0 ? (100 * f.bombaLiters) / f.totalLiters : 0;
    return {
      vehicleId: v.id,
      plate: v.plate,
      kind: v.kind,
      totalLiters: f.totalLiters,
      totalKm: c.kmRange > 0 ? c.kmRange : f.kmRange,
      fillCount: f.fillCount,
      bombaPct,
    };
  });

  ranking.sort((a, b) => b.totalLiters - a.totalLiters);
  return ranking.slice(0, 20);
}
