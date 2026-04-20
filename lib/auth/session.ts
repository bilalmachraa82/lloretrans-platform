import { cookies } from "next/headers";
import { db } from "@/db/client";
import { users, companies } from "@/db/schema";
import { eq } from "drizzle-orm";
import type { AuthSession, Role } from "./types";

const COOKIE_NAME = "lloretrans.session";

export async function setSession(userId: string): Promise<void> {
  const jar = await cookies();
  jar.set(COOKIE_NAME, userId, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
  });
}

export async function clearSession(): Promise<void> {
  const jar = await cookies();
  jar.delete(COOKIE_NAME);
}

export async function getSession(): Promise<AuthSession | null> {
  const jar = await cookies();
  const userId = jar.get(COOKIE_NAME)?.value;
  if (!userId) return null;

  const rows = await db
    .select({
      userId: users.id,
      userName: users.name,
      email: users.email,
      role: users.role,
      companyId: users.companyId,
      companyName: companies.name,
    })
    .from(users)
    .leftJoin(companies, eq(companies.id, users.companyId))
    .where(eq(users.id, userId))
    .limit(1);

  const row = rows[0];
  if (!row) return null;

  return {
    userId: row.userId,
    userName: row.userName,
    email: row.email,
    role: row.role as Role,
    companyId: row.companyId ?? null,
    companyName: row.companyName ?? "—",
  };
}

export async function requireSession(): Promise<AuthSession> {
  const session = await getSession();
  if (!session) {
    throw new Error("UNAUTHENTICATED");
  }
  return session;
}

export async function requireRole(allowed: Role[]): Promise<AuthSession> {
  const session = await requireSession();
  if (!allowed.includes(session.role)) {
    throw new Error("FORBIDDEN");
  }
  return session;
}
