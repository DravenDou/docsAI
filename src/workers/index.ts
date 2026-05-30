import { run } from "graphile-worker";

import { getServerEnv } from "@/src/lib/env";
import { ingestDocument } from "@/src/workers/ingest-document";

const env = getServerEnv();

const runner = await run({
  connectionString: env.DATABASE_URL,
  concurrency: 1,
  pollInterval: 2000,
  taskList: {
    "ingest-document": ingestDocument,
  },
});

process.once("SIGINT", async () => {
  await runner.stop();
});

process.once("SIGTERM", async () => {
  await runner.stop();
});

await runner.promise;
