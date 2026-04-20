import { db } from "@/db/client";
import { trips, vehicles, fuelReadingsCanbus } from "@/db/schema";
import { and, eq, gte, lte } from "drizzle-orm";

export interface FrotcomGpsReading {
  plate: string;
  tripExternalId: string;
  startedAt: Date;
  endedAt: Date;
  kmStart: number;
  kmEnd: number;
  kmTraveled: number;
  avgSpeedKmh: number;
  hasGapsInSignal: boolean;
}

export interface FrotcomCanbusReading {
  plate: string;
  readAt: Date;
  odometerKm: number;
  tankLevelPct: number;
  litersConsumed: number;
}

export interface FrotcomClient {
  getGpsForTrip(tripExternalId: string): Promise<FrotcomGpsReading | null>;
  getGpsForDate(date: Date): Promise<FrotcomGpsReading[]>;
  getCanbusForVehicle(plate: string, from: Date, to: Date): Promise<FrotcomCanbusReading[]>;
  isLive(): boolean;
}

class FrotcomStub implements FrotcomClient {
  isLive(): boolean {
    return false;
  }

  async getGpsForTrip(tripExternalId: string): Promise<FrotcomGpsReading | null> {
    const row = await db
      .select({
        plate: vehicles.plate,
        tripExternalId: trips.externalId,
        startedAt: trips.startedAt,
        endedAt: trips.endedAt,
        kmGps: trips.kmGps,
      })
      .from(trips)
      .innerJoin(vehicles, eq(vehicles.id, trips.vehicleId))
      .where(and(eq(trips.externalId, tripExternalId), eq(trips.source, "logue_trans")))
      .limit(1);

    const t = row[0];
    if (!t || t.kmGps == null) return null;

    const durationH = (t.endedAt.getTime() - t.startedAt.getTime()) / 3_600_000;
    return {
      plate: t.plate,
      tripExternalId: t.tripExternalId,
      startedAt: t.startedAt,
      endedAt: t.endedAt,
      kmStart: 0,
      kmEnd: t.kmGps,
      kmTraveled: t.kmGps,
      avgSpeedKmh: durationH > 0 ? t.kmGps / durationH : 0,
      hasGapsInSignal: false,
    };
  }

  async getGpsForDate(date: Date): Promise<FrotcomGpsReading[]> {
    const start = new Date(date);
    start.setHours(0, 0, 0, 0);
    const end = new Date(date);
    end.setHours(23, 59, 59, 999);

    const rows = await db
      .select({
        plate: vehicles.plate,
        tripExternalId: trips.externalId,
        startedAt: trips.startedAt,
        endedAt: trips.endedAt,
        kmGps: trips.kmGps,
      })
      .from(trips)
      .innerJoin(vehicles, eq(vehicles.id, trips.vehicleId))
      .where(and(gte(trips.startedAt, start), lte(trips.startedAt, end)));

    return rows
      .filter((r) => r.kmGps != null)
      .map((r) => {
        const durationH = (r.endedAt.getTime() - r.startedAt.getTime()) / 3_600_000;
        return {
          plate: r.plate,
          tripExternalId: r.tripExternalId,
          startedAt: r.startedAt,
          endedAt: r.endedAt,
          kmStart: 0,
          kmEnd: r.kmGps!,
          kmTraveled: r.kmGps!,
          avgSpeedKmh: durationH > 0 ? r.kmGps! / durationH : 0,
          hasGapsInSignal: false,
        };
      });
  }

  async getCanbusForVehicle(plate: string, from: Date, to: Date): Promise<FrotcomCanbusReading[]> {
    const rows = await db
      .select({
        plate: vehicles.plate,
        readAt: fuelReadingsCanbus.readAt,
        odometerKm: fuelReadingsCanbus.odometerKm,
        tankLevelPct: fuelReadingsCanbus.tankLevelPct,
        litersConsumed: fuelReadingsCanbus.litersConsumed,
      })
      .from(fuelReadingsCanbus)
      .innerJoin(vehicles, eq(vehicles.id, fuelReadingsCanbus.vehicleId))
      .where(
        and(
          eq(vehicles.plate, plate),
          gte(fuelReadingsCanbus.readAt, from),
          lte(fuelReadingsCanbus.readAt, to),
        ),
      );

    return rows.map((r) => ({
      plate: r.plate,
      readAt: r.readAt,
      odometerKm: r.odometerKm ?? 0,
      tankLevelPct: r.tankLevelPct ?? 0,
      litersConsumed: r.litersConsumed ?? 0,
    }));
  }
}

class FrotcomLive implements FrotcomClient {
  isLive(): boolean {
    return true;
  }
  async getGpsForTrip(): Promise<FrotcomGpsReading | null> {
    throw new Error("FrotcomLive not implemented — waiting for credentials");
  }
  async getGpsForDate(): Promise<FrotcomGpsReading[]> {
    throw new Error("FrotcomLive not implemented — waiting for credentials");
  }
  async getCanbusForVehicle(): Promise<FrotcomCanbusReading[]> {
    throw new Error("FrotcomLive not implemented — waiting for credentials");
  }
}

export function createFrotcomClient(): FrotcomClient {
  return process.env.USE_LIVE_APIS === "true" && process.env.FROTCOM_API_URL
    ? new FrotcomLive()
    : new FrotcomStub();
}
