export interface LogueTransTrip {
  id: string;
  plate: string;
  driverCode: string | null;
  origin: string;
  destination: string;
  startedAt: Date;
  endedAt: Date;
  kmDeclared: number;
  clientCode: string | null;
  notes: string | null;
}

export interface LogueTransClient {
  getTripsForDate(date: Date): Promise<LogueTransTrip[]>;
  getTripsByVehicle(plate: string, from: Date, to: Date): Promise<LogueTransTrip[]>;
  getTripById(id: string): Promise<LogueTransTrip | null>;
  isLive(): boolean;
}
