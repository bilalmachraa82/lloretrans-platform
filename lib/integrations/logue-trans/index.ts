import { db } from "@/db/client";
import { trips, vehicles, drivers, clients } from "@/db/schema";
import { and, eq, gte, lte } from "drizzle-orm";
import type { LogueTransClient, LogueTransTrip } from "./types";

class LogueTransStub implements LogueTransClient {
  isLive(): boolean {
    return false;
  }

  async getTripsForDate(date: Date): Promise<LogueTransTrip[]> {
    const start = new Date(date);
    start.setHours(0, 0, 0, 0);
    const end = new Date(date);
    end.setHours(23, 59, 59, 999);
    return this.queryRange(start, end);
  }

  async getTripsByVehicle(plate: string, from: Date, to: Date): Promise<LogueTransTrip[]> {
    return this.queryRange(from, to, plate);
  }

  async getTripById(id: string): Promise<LogueTransTrip | null> {
    const row = await db
      .select({
        id: trips.externalId,
        plate: vehicles.plate,
        driverCode: drivers.employeeCode,
        origin: trips.origin,
        destination: trips.destination,
        startedAt: trips.startedAt,
        endedAt: trips.endedAt,
        kmDeclared: trips.kmDeclared,
        clientCode: clients.phcId,
        notes: trips.notes,
        source: trips.source,
      })
      .from(trips)
      .innerJoin(vehicles, eq(vehicles.id, trips.vehicleId))
      .leftJoin(drivers, eq(drivers.id, trips.driverId))
      .leftJoin(clients, eq(clients.id, trips.clientId))
      .where(and(eq(trips.externalId, id), eq(trips.source, "logue_trans")))
      .limit(1);
    const t = row[0];
    if (!t) return null;
    return this.toDto(t);
  }

  private async queryRange(from: Date, to: Date, plate?: string): Promise<LogueTransTrip[]> {
    const conditions = [
      eq(trips.source, "logue_trans"),
      gte(trips.startedAt, from),
      lte(trips.startedAt, to),
    ];
    if (plate) conditions.push(eq(vehicles.plate, plate));

    const rows = await db
      .select({
        id: trips.externalId,
        plate: vehicles.plate,
        driverCode: drivers.employeeCode,
        origin: trips.origin,
        destination: trips.destination,
        startedAt: trips.startedAt,
        endedAt: trips.endedAt,
        kmDeclared: trips.kmDeclared,
        clientCode: clients.phcId,
        notes: trips.notes,
      })
      .from(trips)
      .innerJoin(vehicles, eq(vehicles.id, trips.vehicleId))
      .leftJoin(drivers, eq(drivers.id, trips.driverId))
      .leftJoin(clients, eq(clients.id, trips.clientId))
      .where(and(...conditions));

    return rows.map((r) => this.toDto(r));
  }

  private toDto(r: {
    id: string;
    plate: string;
    driverCode: string | null;
    origin: string | null;
    destination: string | null;
    startedAt: Date;
    endedAt: Date;
    kmDeclared: number | null;
    clientCode: string | null;
    notes: string | null;
  }): LogueTransTrip {
    return {
      id: r.id,
      plate: r.plate,
      driverCode: r.driverCode,
      origin: r.origin ?? "",
      destination: r.destination ?? "",
      startedAt: r.startedAt,
      endedAt: r.endedAt,
      kmDeclared: r.kmDeclared ?? 0,
      clientCode: r.clientCode,
      notes: r.notes,
    };
  }
}

class LogueTransLive implements LogueTransClient {
  isLive(): boolean {
    return true;
  }

  async getTripsForDate(): Promise<LogueTransTrip[]> {
    throw new Error("LogueTransLive not implemented — waiting for API access from Hélio");
  }

  async getTripsByVehicle(): Promise<LogueTransTrip[]> {
    throw new Error("LogueTransLive not implemented — waiting for API access from Hélio");
  }

  async getTripById(): Promise<LogueTransTrip | null> {
    throw new Error("LogueTransLive not implemented — waiting for API access from Hélio");
  }
}

export function createLogueTransClient(): LogueTransClient {
  return process.env.USE_LIVE_APIS === "true" && process.env.LOGUE_TRANS_API_URL
    ? new LogueTransLive()
    : new LogueTransStub();
}

export type { LogueTransClient, LogueTransTrip };
