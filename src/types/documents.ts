export type DocumentStatus = "queued" | "processing" | "ready" | "failed";

export interface DocumentSummary {
  id: string;
  name: string;
  originalName: string;
  mimeType: string;
  size: number;
  status: DocumentStatus;
  errorMessage: string | null;
  embeddingProvider: "openai" | "openrouter";
  embeddingModel: string;
  embeddingDimensions: number;
  pageCount: number;
  chunkCount: number;
  createdAt: string;
  updatedAt: string;
}
