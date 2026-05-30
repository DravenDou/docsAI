import { z } from "zod";

const fallbackSecret = "dev-only-change-me-at-least-32-characters";
const fallbackDatabaseUrl = "postgres://bussi:bussi@127.0.0.1:5432/bussi";
const fallbackBaseUrl = "http://127.0.0.1:3000";

const envSchema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  DATABASE_URL: z.string().url().default(fallbackDatabaseUrl),
  BETTER_AUTH_SECRET: z.string().min(32).default(fallbackSecret),
  BETTER_AUTH_URL: z.string().url().default(fallbackBaseUrl),
  FILE_STORAGE_DIR: z.string().min(1).default(".data/uploads"),
  MAX_UPLOAD_BYTES: z.coerce.number().int().positive().default(15 * 1024 * 1024),
  MAX_PARSE_PAGES: z.coerce.number().int().positive().default(50),
  EMBEDDINGS_PROVIDER: z.enum(["openai", "openrouter"]).default("openai"),
  EMBEDDINGS_MODEL: z.string().min(1).default("text-embedding-3-small"),
  OPENAI_API_KEY: z.string().optional(),
  OPENROUTER_API_KEY: z.string().optional(),
  CHAT_PROVIDER: z.enum(["openai", "openrouter"]).default("openrouter"),
  CHAT_MODEL: z.string().min(1).default("openrouter/free"),
  ALLOW_SIGN_UP: z.enum(["true", "false"]).default("false").transform((value) => value === "true"),
});

export type ServerEnv = z.infer<typeof envSchema>;

let cachedEnv: ServerEnv | undefined;

export function getServerEnv() {
  if (cachedEnv) return cachedEnv;

  const parsed = envSchema.parse(process.env);

  const isBuildPhase =
    process.env.NEXT_PHASE === "phase-production-build" || process.env.npm_lifecycle_event === "build";

  if (parsed.NODE_ENV === "production" && !isBuildPhase) {
    if (parsed.BETTER_AUTH_SECRET === fallbackSecret) {
      throw new Error("BETTER_AUTH_SECRET must be set to a non-default value in production.");
    }
    if (!process.env.DATABASE_URL) {
      throw new Error("DATABASE_URL must be set explicitly in production.");
    }
  }

  cachedEnv = parsed;
  return parsed;
}

export function requireProviderKey(provider: "openai" | "openrouter") {
  const env = getServerEnv();
  const key = provider === "openai" ? env.OPENAI_API_KEY : env.OPENROUTER_API_KEY;
  if (!key) {
    throw new Error(`${provider.toUpperCase()} API key is required for this operation.`);
  }
  return key;
}
