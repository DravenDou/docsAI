import { drizzle } from "drizzle-orm/node-postgres";
import pg from "pg";

import * as schema from "@/src/db/schema";
import { getServerEnv } from "@/src/lib/env";

const { Pool } = pg;

type DbGlobal = typeof globalThis & {
  __bussiPool?: pg.Pool;
};

const globalForDb = globalThis as DbGlobal;
const env = getServerEnv();

export const pool = globalForDb.__bussiPool ?? new Pool({
  connectionString: env.DATABASE_URL,
  max: 8,
});

if (env.NODE_ENV !== "production") {
  globalForDb.__bussiPool = pool;
}

export const db = drizzle(pool, { schema });
export type Db = typeof db;
