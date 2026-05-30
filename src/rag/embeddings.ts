import { embed, embedMany } from "ai";
import { z } from "zod";

import { getServerEnv, requireProviderKey } from "@/src/lib/env";
import {
  getEmbeddingConfig,
  getEmbeddingModel,
  getOpenAIEmbeddingProviderOptions,
  type EmbeddingConfig,
} from "@/src/rag/providers";

const openRouterEmbeddingResponseSchema = z.object({
  data: z.array(
    z.object({
      embedding: z.array(z.number()),
      index: z.number().optional(),
    }),
  ),
});

export async function embedQuery(value: string, config?: Pick<EmbeddingConfig, "provider" | "model">) {
  const embeddingConfig = getEmbeddingConfig(config);
  if (embeddingConfig.provider === "openrouter") {
    const [embedding] = await embedWithOpenRouter([value], embeddingConfig, "query");
    return embedding;
  }

  const result = await embed({
    model: getEmbeddingModel(embeddingConfig),
    value,
    providerOptions: getOpenAIEmbeddingProviderOptions(embeddingConfig),
    maxRetries: 2,
  });
  return assertEmbeddingDimensions(result.embedding, embeddingConfig);
}

export async function embedTexts(values: string[], config?: Pick<EmbeddingConfig, "provider" | "model">) {
  if (values.length === 0) return [];
  const embeddingConfig = getEmbeddingConfig(config);
  if (embeddingConfig.provider === "openrouter") {
    return embedWithOpenRouter(values, embeddingConfig, "passage");
  }

  const result = await embedMany({
    model: getEmbeddingModel(embeddingConfig),
    values,
    providerOptions: getOpenAIEmbeddingProviderOptions(embeddingConfig),
    maxParallelCalls: 2,
    maxRetries: 2,
  });
  return result.embeddings.map((embedding) => assertEmbeddingDimensions(embedding, embeddingConfig));
}

async function embedWithOpenRouter(
  values: string[],
  config: EmbeddingConfig,
  inputType: "query" | "passage",
) {
  const env = getServerEnv();
  const response = await fetch("https://openrouter.ai/api/v1/embeddings", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${requireProviderKey("openrouter")}`,
      "Content-Type": "application/json",
      "HTTP-Referer": env.BETTER_AUTH_URL,
      "X-Title": "Bussi RAG Portfolio",
    },
    body: JSON.stringify({
      model: config.model,
      input: values,
      dimensions: config.dimensions,
      input_type: inputType,
    }),
  });

  if (!response.ok) {
    await response.text().catch(() => "");
    throw new Error(`OpenRouter embeddings failed with status ${response.status}.`);
  }

  const raw = await response.json();
  const parsed = openRouterEmbeddingResponseSchema.safeParse(raw);
  if (!parsed.success) throw new Error("OpenRouter returned an invalid embeddings response.");

  const ordered = parsed.data.data
    .map((item, fallbackIndex) => ({ ...item, index: item.index ?? fallbackIndex }))
    .sort((left, right) => left.index - right.index)
    .map((item) => assertEmbeddingDimensions(item.embedding, config));

  if (ordered.length !== values.length) {
    throw new Error(`OpenRouter returned ${ordered.length} embeddings for ${values.length} inputs.`);
  }

  return ordered;
}

function assertEmbeddingDimensions(embedding: number[], config: EmbeddingConfig) {
  if (embedding.length !== config.dimensions) {
    throw new Error(
      `Embedding model ${config.provider}/${config.model} returned ${embedding.length} dimensions; expected ${config.dimensions}. Choose another embedding option or migrate/reindex the vector schema.`,
    );
  }
  return embedding;
}
