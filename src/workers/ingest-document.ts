import { LiteParse } from "@llamaindex/liteparse";
import { and, eq } from "drizzle-orm";
import type { Task } from "graphile-worker";

import { db } from "@/src/db/client";
import { chunks, documentPages, documents } from "@/src/db/schema";
import { getServerEnv } from "@/src/lib/env";
import { createId } from "@/src/lib/ids";
import { readPrivateFile } from "@/src/lib/storage";
import { chunkPages } from "@/src/rag/chunker";
import { embedTexts } from "@/src/rag/embeddings";
import { getEmbeddingConfig } from "@/src/rag/providers";

export const ingestDocument: Task<"ingest-document"> = async (payload, helpers) => {
  const { documentId, userId } = payload;
  const env = getServerEnv();

  try {
    const document = await db.query.documents.findFirst({
      where: and(eq(documents.id, documentId), eq(documents.userId, userId)),
    });

    if (!document) throw new Error(`Document ${documentId} not found for user.`);
    const embeddingConfig = getEmbeddingConfig({
      provider: document.embeddingProvider,
      model: document.embeddingModel,
    });

    await db
      .update(documents)
      .set({ status: "processing", errorMessage: null, updatedAt: new Date() })
      .where(eq(documents.id, documentId));

    const parser = new LiteParse({
      ocrEnabled: false,
      maxPages: env.MAX_PARSE_PAGES,
      outputFormat: "json",
      quiet: true,
      numWorkers: 1,
    });
    const parsed = await parser.parse(await readPrivateFile(document.storagePath));
    const pages = parsed.pages
      .map((page) => ({
        pageNumber: page.pageNum,
        width: Math.round(page.width || 0),
        height: Math.round(page.height || 0),
        text: page.text.trim(),
      }))
      .filter((page) => page.text.length > 0);

    if (pages.length === 0) throw new Error("No extractable text found in this PDF.");

    const pageChunks = chunkPages(pages);
    if (pageChunks.length === 0) throw new Error("No chunks could be created from the extracted text.");

    helpers.logger.info(`Embedding ${pageChunks.length} chunks for ${documentId}`);
    const embeddings = await embedTexts(
      pageChunks.map((chunk) => chunk.text),
      embeddingConfig,
    );

    await db.transaction(async (tx) => {
      await tx.delete(chunks).where(eq(chunks.documentId, documentId));
      await tx.delete(documentPages).where(eq(documentPages.documentId, documentId));

      await tx.insert(documentPages).values(
        pages.map((page) => ({
          id: createId("page"),
          documentId,
          pageNumber: page.pageNumber,
          width: page.width,
          height: page.height,
          text: page.text,
        })),
      );

      await tx.insert(chunks).values(
        pageChunks.map((chunk, index) => ({
          id: createId("chunk"),
          documentId,
          pageNumber: chunk.pageNumber,
          chunkIndex: chunk.chunkIndex,
          text: chunk.text,
          embedding: embeddings[index],
          metadata: chunk.metadata,
        })),
      );

      await tx
        .update(documents)
        .set({
          status: "ready",
          errorMessage: null,
          embeddingProvider: embeddingConfig.provider,
          embeddingModel: embeddingConfig.model,
          embeddingDimensions: embeddingConfig.dimensions,
          updatedAt: new Date(),
        })
        .where(eq(documents.id, documentId));
    });
  } catch (error) {
    const message = getSafeIngestionErrorMessage(error);
    await db
      .update(documents)
      .set({ status: "failed", errorMessage: message.slice(0, 800), updatedAt: new Date() })
      .where(eq(documents.id, documentId));
    throw error;
  }
};

function getSafeIngestionErrorMessage(error: unknown) {
  const message = error instanceof Error ? error.message : "";

  if (message.includes("No extractable text") || message.includes("No chunks could be created")) {
    return message;
  }

  if (message.includes("OpenRouter") || message.includes("OpenAI") || message.includes("API key")) {
    return "No se pudo generar embeddings con el proveedor configurado. Revisa la API key o intenta más tarde.";
  }

  if (message.includes("PDF")) {
    return "No se pudo procesar este PDF. Revisa que no esté corrupto, cifrado o sin texto extraíble.";
  }

  return "No se pudo procesar este documento. Revisa el archivo o intenta nuevamente.";
}
