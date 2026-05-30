import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { nextCookies } from "better-auth/next-js";
import { headers } from "next/headers";

import { db } from "@/src/db/client";
import * as schema from "@/src/db/schema";
import { getServerEnv } from "@/src/lib/env";

const env = getServerEnv();

export const auth = betterAuth({
  appName: "Bussi RAG",
  baseURL: env.BETTER_AUTH_URL,
  secret: env.BETTER_AUTH_SECRET,
  database: drizzleAdapter(db, {
    provider: "pg",
    schema,
    camelCase: true,
    transaction: true,
  }),
  emailAndPassword: {
    enabled: true,
    disableSignUp: !env.ALLOW_SIGN_UP,
    minPasswordLength: 8,
    maxPasswordLength: 128,
  },
  session: {
    cookieCache: {
      enabled: true,
      maxAge: 5 * 60,
    },
  },
  advanced: {
    cookiePrefix: "bussi",
    useSecureCookies: env.NODE_ENV === "production",
  },
  trustedOrigins: [env.BETTER_AUTH_URL],
  plugins: [nextCookies()],
});

export type Session = Awaited<ReturnType<typeof getSession>>;

export async function getSession() {
  return auth.api.getSession({ headers: await headers() });
}

export async function requireUser() {
  const session = await getSession();
  if (!session?.user) {
    return null;
  }
  return session.user;
}
