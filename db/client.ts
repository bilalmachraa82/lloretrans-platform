import { neon } from "@neondatabase/serverless";
import { drizzle, type NeonHttpDatabase } from "drizzle-orm/neon-http";
import * as schema from "./schema";

type Db = NeonHttpDatabase<typeof schema>;

let cached: Db | null = null;

function createDb(): Db {
  const url = process.env.DATABASE_URL;
  if (!url) {
    throw new Error(
      "DATABASE_URL not set. Copy .env.example to .env.local and set the Neon pooled connection string.",
    );
  }
  return drizzle(neon(url), { schema });
}

export const db: Db = new Proxy({} as Db, {
  get(_target, prop: keyof Db) {
    if (!cached) cached = createDb();
    const value = cached[prop];
    return typeof value === "function" ? value.bind(cached) : value;
  },
});

export { schema };
