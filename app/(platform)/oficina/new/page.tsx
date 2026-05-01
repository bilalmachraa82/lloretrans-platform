import { db } from "@/db/client";
import { vehicles, serviceCodes } from "@/db/schema";
import { eq } from "drizzle-orm";
import { requireRole } from "@/lib/auth/session";
import { WorkOrderWizard } from "./wizard";

export default async function NewWorkOrderPage() {
  const session = await requireRole(["admin", "clarice", "mecanico", "admin_oficina"]);

  const [veh, codes] = await Promise.all([
    db
      .select({ plate: vehicles.plate, kind: vehicles.kind })
      .from(vehicles)
      .where(eq(vehicles.active, true))
      .orderBy(vehicles.plate),
    db.select().from(serviceCodes),
  ]);

  return <WorkOrderWizard vehicles={veh} serviceCodes={codes} mechanicName={session.userName} />;
}
