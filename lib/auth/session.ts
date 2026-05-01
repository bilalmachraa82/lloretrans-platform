import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { db } from "@/db/client";
import { users, companies, sessions } from "@/db/schema";
import { and, eq, gt } from "drizzle-orm";
import type { AuthSession, Role } from "./types";

const COOKIE_NAME = "lloretrans.session";
const SESSION_TTL_SECONDS = 60 * 60 * 24 * 7;

export async function setSession(userId: string): Promise<void> {
  const token = crypto.randomUUID();
  const expiresAt = new Date(Date.now() + SESSION_TTL_SECONDS * 1000);

  await db.insert(sessions).values({
    id: token,
    userId,
    expiresAt,
  });

  const jar = await cookies();
  jar.set(COOKIE_NAME, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: SESSION_TTL_SECONDS,
  });
}

export async function clearSession(): Promise<void> {
  const jar = await cookies();
  const token = jar.get(COOKIE_NAME)?.value;
  if (token) {
    await db.delete(sessions).where(eq(sessions.id, token));
  }
  jar.delete(COOKIE_NAME);
}

export async function getSession(): Promise<AuthSession | null> {
  const jar = await cookies();
  const token = jar.get(COOKIE_NAME)?.value;
  if (!token) return null;

  const rows = await db
    .select({
      userId: users.id,
      userName: users.name,
      email: users.email,
      role: users.role,
      companyId: users.companyId,
      companyName: companies.name,
    })
    .from(sessions)
    .innerJoin(users, eq(users.id, sessions.userId))
    .leftJoin(companies, eq(companies.id, users.companyId))
    .where(and(eq(sessions.id, token), gt(sessions.expiresAt, new Date()), eq(users.active, true)))
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
    redirect("/login");
  }
  return session;
}

export async function requireRole(allowed: Role[]): Promise<AuthSession> {
  const session = await requireSession();
  if (!allowed.includes(session.role)) {
    redirect("/dashboard?access=denied");
  }
  return session;
}
