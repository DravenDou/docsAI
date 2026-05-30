import { desc, eq, sql } from "drizzle-orm";
import { quickAddJob } from "graphile-worker";

import { db } from "@/src/db/client";
import { chunks, documentPages, documents } from "@/src/db/schema";
import { requireUser } from "@/src/lib/auth";
import { getServerEnv, requireProviderKey } from "@/src/lib/env";
import { enforceSameOrigin, jsonError, jsonResponse, rejectLargeRequest, unauthorized } from "@/src/lib/http";
import { createId } from "@/src/lib/ids";
import { checkRateLimit, rateLimitResponse } from "@/src/lib/rate-limit";
import { deletePrivateFile, savePrivateUpload } from "@/src/lib/storage";
import { validatePdfUpload } from "@/src/lib/uploads";
import { getEmbeddingOption, OPENAI_EMBEDDING_MODEL } from "@/src/rag/model-options";
import { getEmbeddingConfig } from "@/src/rag/providers";

export const runtime = "nodejs";
const MULTIPART_OVERHEAD_MAX_BYTES = 1024 * 1024;
const UPLOAD_RATE_LIMIT = { limit: 8, windowMs: 10 * 60 * 1000 };

export async function GET() {
  const user = await requireUser();
  if (!user) return unauthorized();

  const pageCount = sql<number>`(
    select count(*)::int from ${documentPages}
    where ${documentPages.documentId} = ${documents.id}
  )`;
  const chunkCount = sql<number>`(
    select count(*)::int from ${chunks}
    where ${chunks.documentId} = ${documents.id}
  )`;

  const rows = await db
    .select({
      id: documents.id,
      name: documents.name,
      originalName: documents.originalName,
      mimeType: documents.mimeType,
      size: documents.size,
      status: documents.status,
      errorMessage: documents.errorMessage,
      embeddingProvider: documents.embeddingProvider,
      embeddingModel: documents.embeddingModel,
      embeddingDimensions: documents.embeddingDimensions,
      pageCount,
      chunkCount,
      createdAt: documents.createdAt,
      updatedAt: documents.updatedAt,
    })
    .from(documents)
    .where(eq(documents.userId, user.id))
    .orderBy(desc(documents.createdAt));

  return jsonResponse({ documents: rows });
}

export async function POST(request: Request) {
  const originError = enforceSameOrigin(request);
  if (originError) return originError;

  const user = await requireUser();
  if (!user) return unauthorized();

  const env = getServerEnv();
  const sizeError = rejectLargeRequest(request, env.MAX_UPLOAD_BYTES + MULTIPART_OVERHEAD_MAX_BYTES);
  if (sizeError) return sizeError;

  const rateLimit = checkRateLimit({
    key: `upload:${user.id}`,
    ...UPLOAD_RATE_LIMIT,
  });
  if (!rateLimit.allowed) return rateLimitResponse(rateLimit.retryAfterSeconds);

  let upload: Awaited<ReturnType<typeof validatePdfUpload>>;
  let embeddingConfig: ReturnType<typeof getEmbeddingConfig>;
  try {
    const formData = await request.formData();
    embeddingConfig = getEmbeddingConfig(parseEmbeddingSelection(formData));
    const file = formData.get("file");
    if (!(file instanceof File)) return jsonError("Missing file field.");
    upload = await validatePdfUpload(file);
  } catch (error) {
    return jsonError(error instanceof Error ? error.message : "Invalid upload.");
  }

  try {
    requireProviderKey(embeddingConfig.provider);
  } catch (error) {
    console.error("Embedding provider configuration failed", error);
    return jsonError("El proveedor de embeddings no está configurado.", 503);
  }

  const documentId = createId("doc");
  const storagePath = await savePrivateUpload(upload.buffer, upload.extension);

  try {
    const [document] = await db
      .insert(documents)
      .values({
        id: documentId,
        userId: user.id,
        name: upload.safeName,
        originalName: upload.safeName,
        mimeType: upload.mimeType,
        size: upload.buffer.byteLength,
        storagePath,
        status: "queued",
        embeddingProvider: embeddingConfig.provider,
        embeddingModel: embeddingConfig.model,
        embeddingDimensions: embeddingConfig.dimensions,
      })
      .returning({ id: documents.id, name: documents.name, status: documents.status });

    await quickAddJob(
      { connectionString: env.DATABASE_URL },
      "ingest-document",
      { documentId, userId: user.id },
      { queueName: `document:${documentId}`, jobKey: `ingest:${documentId}`, maxAttempts: 3 },
    );

    return jsonResponse({ document }, { status: 201 });
  } catch (error) {
    await db.delete(documents).where(eq(documents.id, documentId)).catch(() => undefined);
    await deletePrivateFile(storagePath).catch(() => undefined);
    console.error("Document upload queueing failed", error);
    return jsonError("No se pudo encolar el documento para procesamiento.", 500);
  }
}

function parseEmbeddingSelection(formData: FormData) {
  const provider = asString(formData.get("embeddingProvider")) ?? "openai";
  const model = asString(formData.get("embeddingModel")) ?? OPENAI_EMBEDDING_MODEL;
  const option = getEmbeddingOption(provider, model);
  if (!option) {
    throw new Error("Embedding provider/model is not supported for this demo.");
  }
  return { provider: option.provider, model: option.model };
}

function asString(value: FormDataEntryValue | null) {
  return typeof value === "string" && value.trim() ? value.trim() : undefined;
}
