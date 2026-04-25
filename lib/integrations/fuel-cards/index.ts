import { db } from "@/db/client";
import { fuelFills, vehicles } from "@/db/schema";
import type { FuelProvider } from "@/lib/fuel/provider-model";
import { and, eq, gte, lte } from "drizzle-orm";

export type FuelCardProvider = FuelProvider;

export interface FuelCardTransaction {
  provider: FuelCardProvider;
  cardNumber: string;
  plate: string;
  filledAt: Date;
  liters: number;
  pricePerLiter: number;
  totalEur: number;
  location: string;
  externalRef: string;
}

export interface FuelCardClient {
  pullTransactions(provider: FuelCardProvider, from: Date, to: Date): Promise<FuelCardTransaction[]>;
  isLive(provider: FuelCardProvider): boolean;
}

class FuelCardStub implements FuelCardClient {
  isLive(): boolean {
    return false;
  }

  async pullTransactions(
    provider: FuelCardProvider,
    from: Date,
    to: Date,
  ): Promise<FuelCardTransaction[]> {
    const rows = await db
      .select({
        provider: fuelFills.source,
        cardNumber: fuelFills.cardNumber,
        plate: vehicles.plate,
        filledAt: fuelFills.filledAt,
        liters: fuelFills.liters,
        pricePerLiter: fuelFills.pricePerLiter,
        totalEur: fuelFills.totalEur,
        location: fuelFills.location,
        externalRef: fuelFills.externalRef,
      })
      .from(fuelFills)
      .innerJoin(vehicles, eq(vehicles.id, fuelFills.vehicleId))
      .where(
        and(
          eq(fuelFills.source, provider),
          gte(fuelFills.filledAt, from),
          lte(fuelFills.filledAt, to),
        ),
      );

    return rows.map((r) => ({
      provider: r.provider as FuelCardProvider,
      cardNumber: r.cardNumber ?? "",
      plate: r.plate,
      filledAt: r.filledAt,
      liters: r.liters,
      pricePerLiter: r.pricePerLiter ?? 0,
      totalEur: r.totalEur ?? 0,
      location: r.location ?? "",
      externalRef: r.externalRef ?? "",
    }));
  }
}

export function createFuelCardClient(): FuelCardClient {
  return new FuelCardStub();
}
