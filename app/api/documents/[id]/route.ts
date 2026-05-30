import { and, eq } from "drizzle-orm";

import { db } from "@/src/db/client";
import { documents } from "@/src/db/schema";
import { requireUser } from "@/src/lib/auth";
import { enforceSameOrigin, jsonError, jsonResponse, unauthorized } from "@/src/lib/http";
import { checkRateLimit, rateLimitResponse } from "@/src/lib/rate-limit";
import { deletePrivateFile } from "@/src/lib/storage";

export const runtime = "nodejs";
const DELETE_RATE_LIMIT = { limit: 30, windowMs: 60 * 1000 };

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const originError = enforceSameOrigin(request);
  if (originError) return originError;

  const user = await requireUser();
  if (!user) return unauthorized();

  const rateLimit = checkRateLimit({
    key: `delete-document:${user.id}`,
    ...DELETE_RATE_LIMIT,
  });
  if (!rateLimit.allowed) return rateLimitResponse(rateLimit.retryAfterSeconds);

  const { id } = await params;
  const document = await db.query.documents.findFirst({
    where: and(eq(documents.id, id), eq(documents.userId, user.id)),
  });

  if (!document) return jsonError("Document not found.", 404);

  await deletePrivateFile(document.storagePath).catch(() => undefined);
  await db.delete(documents).where(and(eq(documents.id, id), eq(documents.userId, user.id)));

  return jsonResponse({ ok: true });
}
