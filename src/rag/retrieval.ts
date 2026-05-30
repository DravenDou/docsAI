import { and, eq, inArray, sql } from "drizzle-orm";

import { db } from "@/src/db/client";
import { chunks, documents } from "@/src/db/schema";
import { embedQuery } from "@/src/rag/embeddings";
import type { AiProviderName } from "@/src/rag/model-options";

export interface RetrievedChunk {
  id: string;
  documentId: string;
  documentName: string;
  pageNumber: number;
  chunkIndex: number;
  text: string;
  similarity: number;
}

export async function retrieveRelevantChunks(options: {
  userId: string;
  question: string;
  documentIds?: string[];
  limit?: number;
}) {
  const limit = options.limit ?? 6;
  const groups = await getReadyDocumentGroups(options.userId, options.documentIds);
  if (groups.length === 0) return [];

  const groupedRows: RetrievedChunk[][] = [];
  for (const group of groups) {
    groupedRows.push(await retrieveGroup(options.userId, options.question, group, limit));
  }

  return groupedRows
    .flat()
    .sort((left, right) => right.similarity - left.similarity)
    .slice(0, limit);
}

async function getReadyDocumentGroups(userId: string, documentIds?: string[]) {
  const filters = [eq(documents.userId, userId), eq(documents.status, "ready")];
  if (documentIds?.length) {
    filters.push(inArray(documents.id, documentIds));
  }

  const rows = await db
    .select({
      id: documents.id,
      embeddingProvider: documents.embeddingProvider,
      embeddingModel: documents.embeddingModel,
    })
    .from(documents)
    .where(and(...filters));

  const groups = new Map<string, { provider: AiProviderName; model: string; documentIds: string[] }>();
  for (const row of rows) {
    const key = `${row.embeddingProvider}:${row.embeddingModel}`;
    const group = groups.get(key) ?? {
      provider: row.embeddingProvider,
      model: row.embeddingModel,
      documentIds: [],
    };
    group.documentIds.push(row.id);
    groups.set(key, group);
  }

  return [...groups.values()];
}

async function retrieveGroup(
  userId: string,
  question: string,
  group: { provider: AiProviderName; model: string; documentIds: string[] },
  limit: number,
) {
  const embedding = await embedQuery(question, { provider: group.provider, model: group.model });
  const embeddingSql = sql`${JSON.stringify(embedding)}::vector`;
  const distance = sql<number>`${chunks.embedding} <=> ${embeddingSql}`;
  const similarity = sql<number>`1 - (${distance})`;

  const filters = [
    eq(documents.userId, userId),
    eq(documents.status, "ready"),
    eq(documents.embeddingProvider, group.provider),
    eq(documents.embeddingModel, group.model),
    inArray(documents.id, group.documentIds),
  ];

  const rows = await db
    .select({
      id: chunks.id,
      documentId: chunks.documentId,
      documentName: documents.name,
      pageNumber: chunks.pageNumber,
      chunkIndex: chunks.chunkIndex,
      text: chunks.text,
      similarity,
    })
    .from(chunks)
    .innerJoin(documents, eq(chunks.documentId, documents.id))
    .where(and(...filters))
    .orderBy(distance)
    .limit(limit);

  return rows satisfies RetrievedChunk[];
}

export function formatContext(chunksForPrompt: RetrievedChunk[]) {
  return chunksForPrompt
    .map((chunk, index) => {
      const key = `S${index + 1}`;
      return `[${key}] Documento: ${chunk.documentName}\nPágina: ${chunk.pageNumber}\nChunk: ${chunk.chunkIndex}\nTexto:\n${chunk.text}`;
    })
    .join("\n\n---\n\n");
}
