import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import * as schema from "./schema";

const url = process.env.DATABASE_URL;
if (!url) {
  throw new Error("DATABASE_URL not set. Copy .env.example to .env.local and set the Neon pooled connection string.");
}

const sql = neon(url);
export const db = drizzle(sql, { schema });

export { schema };
