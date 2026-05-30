import { runMigrations } from "graphile-worker";
import { migrate } from "drizzle-orm/node-postgres/migrator";

import { db, pool } from "@/src/db/client";
import { getServerEnv } from "@/src/lib/env";

async function main() {
  const env = getServerEnv();
  await pool.query('CREATE EXTENSION IF NOT EXISTS vector');
  await migrate(db, { migrationsFolder: "drizzle" });
  await runMigrations({ connectionString: env.DATABASE_URL });
  await pool.end();
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
