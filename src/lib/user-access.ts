import { getServerEnv } from "@/src/lib/env";
import type { ModelAccessMode } from "@/src/rag/model-options";

export function getUserModelAccess(email: string | null | undefined): ModelAccessMode {
  return isDemoUserEmail(email) ? "openrouter-free" : "full";
}

export function isDemoUserEmail(email: string | null | undefined) {
  if (!email) return false;
  return email.toLowerCase() === getServerEnv().DEMO_USER_EMAIL.toLowerCase();
}
