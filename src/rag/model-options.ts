export type AiProviderName = "openai" | "openrouter";

export const OPENAI_EMBEDDING_MODEL = "text-embedding-3-small";
export const OPENROUTER_FREE_EMBEDDING_MODEL = "nvidia/llama-nemotron-embed-vl-1b-v2:free";
export const OPENROUTER_FREE_CHAT_MODEL = "openrouter/free";

export const EMBEDDING_OPTIONS = [
  {
    provider: "openai",
    model: OPENAI_EMBEDDING_MODEL,
    label: "OpenAI",
    shortLabel: "OpenAI",
    description: "text-embedding-3-small, estable y recomendado para el demo.",
  },
  {
    provider: "openrouter",
    model: OPENROUTER_FREE_EMBEDDING_MODEL,
    label: "OpenRouter gratis",
    shortLabel: "OpenRouter free",
    description: "NVIDIA Llama Nemotron Embed VL 1B V2 vía OpenRouter.",
  },
] as const satisfies ReadonlyArray<{
  provider: AiProviderName;
  model: string;
  label: string;
  shortLabel: string;
  description: string;
}>;

export function getEmbeddingOption(provider: string, model: string) {
  return EMBEDDING_OPTIONS.find((option) => option.provider === provider && option.model === model);
}
