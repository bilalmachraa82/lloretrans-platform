import { db } from "@/db/client";
import { auditLog } from "@/db/schema";
import { randomId } from "@/lib/utils";

export interface AuditArgs {
  userId: string | null;
  action: string;
  entityType: string;
  entityId: string;
  before?: unknown;
  after?: unknown;
  reason?: string | null;
  ipAddress?: string | null;
  userAgent?: string | null;
}

export async function audit(args: AuditArgs): Promise<void> {
  await db.insert(auditLog).values({
    id: randomId("audit"),
    userId: args.userId,
    action: args.action,
    entityType: args.entityType,
    entityId: args.entityId,
    before: args.before != null ? JSON.stringify(args.before) : null,
    after: args.after != null ? JSON.stringify(args.after) : null,
    reason: args.reason ?? null,
    ipAddress: args.ipAddress ?? null,
    userAgent: args.userAgent ?? null,
  });
}
