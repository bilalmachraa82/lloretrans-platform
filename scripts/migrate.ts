import Database from "better-sqlite3";
import { drizzle } from "drizzle-orm/better-sqlite3";
import { migrate } from "drizzle-orm/better-sqlite3/migrator";
import fs from "node:fs";
import path from "node:path";

const DB_PATH = process.env.DB_PATH ?? "lloretrans.db";

async function main(): Promise<void> {
  const db = new Database(DB_PATH);
  db.pragma("foreign_keys = ON");
  const drz = drizzle(db);

  const migrationsFolder = path.join(process.cwd(), "drizzle");
  if (!fs.existsSync(migrationsFolder)) {
    console.log("No drizzle/ folder — run `npm run db:generate` first.");
    process.exit(1);
  }

  migrate(drz, { migrationsFolder });
  console.log("✓ Migrations applied");
  db.close();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
