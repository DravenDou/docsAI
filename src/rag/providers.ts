import { createOpenAI } from "@ai-sdk/openai";
import type { EmbeddingModel, LanguageModel } from "ai";

import { getServerEnv, requireProviderKey } from "@/src/lib/env";
import {
  OPENROUTER_FREE_CHAT_MODEL,
  OPENAI_EMBEDDING_MODEL,
  type AiProviderName,
} from "@/src/rag/model-options";

export const VECTOR_DIMENSIONS = 1536;

export interface EmbeddingConfig {
  provider: AiProviderName;
  model: string;
  dimensions: typeof VECTOR_DIMENSIONS;
}

export interface ChatModelConfig {
  provider: AiProviderName;
  model: string;
}

export function getEmbeddingModel(config?: Pick<EmbeddingConfig, "provider" | "model">): EmbeddingModel {
  const env = getServerEnv();
  const provider = config?.provider ?? env.EMBEDDINGS_PROVIDER;
  const model = config?.model ?? env.EMBEDDINGS_MODEL;
  assertSupportedEmbeddingDimensions(model);
  return getProvider(provider).embeddingModel(model);
}

export function getChatModel(overrides?: Partial<ChatModelConfig>): LanguageModel {
  const env = getServerEnv();
  const provider = overrides?.provider ?? env.CHAT_PROVIDER;
  const model = overrides?.model ?? env.CHAT_MODEL;
  return getProvider(provider).chat(model);
}

export function getEmbeddingConfig(overrides?: Partial<Pick<EmbeddingConfig, "provider" | "model">>): EmbeddingConfig {
  const env = getServerEnv();
  const provider = overrides?.provider ?? env.EMBEDDINGS_PROVIDER;
  const model = overrides?.model ?? env.EMBEDDINGS_MODEL;
  assertSupportedEmbeddingDimensions(model);
  return {
    provider,
    model,
    dimensions: VECTOR_DIMENSIONS,
  };
}

export function getOpenAIEmbeddingProviderOptions(config: EmbeddingConfig) {
  return {
    openai: {
      dimensions: config.dimensions,
    },
  } as const;
}

export function getDefaultModelNames() {
  return {
    chat: OPENROUTER_FREE_CHAT_MODEL,
    embeddings: OPENAI_EMBEDDING_MODEL,
  };
}

function getProvider(provider: AiProviderName) {
  if (provider === "openrouter") {
    return createOpenAI({
      name: "openrouter",
      apiKey: requireProviderKey("openrouter"),
      baseURL: "https://openrouter.ai/api/v1",
      headers: {
        "HTTP-Referer": getServerEnv().BETTER_AUTH_URL,
        "X-Title": "DOCSAI",
      },
    });
  }

  return createOpenAI({
    apiKey: requireProviderKey("openai"),
  });
}

function assertSupportedEmbeddingDimensions(model: string) {
  if (model.includes("large")) {
    throw new Error(
      "This v1 schema is fixed at 1536 dimensions. Use text-embedding-3-small or migrate/reindex before using a large embedding model.",
    );
  }
}
