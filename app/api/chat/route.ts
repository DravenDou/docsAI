import { convertToModelMessages, streamText, type UIMessage } from "ai";
import { z } from "zod";

import { requireUser } from "@/src/lib/auth";
import { enforceSameOrigin, jsonError, rejectLargeRequest, unauthorized } from "@/src/lib/http";
import { checkRateLimit, rateLimitResponse } from "@/src/lib/rate-limit";
import { getUserModelAccess } from "@/src/lib/user-access";
import { OPENROUTER_FREE_CHAT_MODEL } from "@/src/rag/model-options";
import { getChatModel } from "@/src/rag/providers";
import { formatContext, retrieveRelevantChunks } from "@/src/rag/retrieval";

export const runtime = "nodejs";
const CHAT_BODY_MAX_BYTES = 64 * 1024;
const CHAT_RATE_LIMIT = { limit: 30, windowMs: 60 * 1000 };

const chatBodySchema = z.object({
  messages: z.array(z.custom<UIMessage>()).min(1).max(30),
  documentIds: z.array(z.string().min(1)).max(20).optional(),
  language: z.enum(["en", "es"]).default("en"),
});

export async function POST(request: Request) {
  const originError = enforceSameOrigin(request);
  if (originError) return originError;

  const sizeError = rejectLargeRequest(request, CHAT_BODY_MAX_BYTES);
  if (sizeError) return sizeError;

  const user = await requireUser();
  if (!user) return unauthorized();

  const rateLimit = checkRateLimit({
    key: `chat:${user.id}`,
    ...CHAT_RATE_LIMIT,
  });
  if (!rateLimit.allowed) return rateLimitResponse(rateLimit.retryAfterSeconds);

  const parsed = chatBodySchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return jsonError("Invalid chat request.");

  const question = extractLatestUserText(parsed.data.messages).slice(0, 4000);
  if (!question) return jsonError("Send a text question.");

  let retrieved;
  try {
    retrieved = await retrieveRelevantChunks({
      userId: user.id,
      question,
      documentIds: parsed.data.documentIds,
      limit: 7,
    });
  } catch (error) {
    console.error("Context retrieval failed", error);
    return jsonError("No se pudo recuperar contexto para esta pregunta.", 500);
  }

  const language = parsed.data.language;
  const context = retrieved.length
    ? formatContext(retrieved)
    : language === "es"
      ? "No hay chunks listos para esta pregunta."
      : "There are no ready chunks for this question.";
  const modelMessages = await convertToModelMessages(parsed.data.messages);

  let model;
  try {
    model =
      getUserModelAccess(user.email) === "openrouter-free"
        ? getChatModel({ provider: "openrouter", model: OPENROUTER_FREE_CHAT_MODEL })
        : getChatModel();
  } catch (error) {
    console.error("Chat model configuration failed", error);
    return jsonError("El modelo de chat no está configurado.", 503);
  }

  const result = streamText({
    model,
    system: [
      "You are a RAG assistant for enterprise documents.",
      language === "es"
        ? "Responde siempre en español. No cambies de idioma aunque el usuario escriba en otro idioma."
        : "Always answer in English. Do not switch languages even if the user writes in another language.",
      "Use only the retrieved context. If the context does not contain the answer, say so clearly.",
      "Cite every important claim with a source identifier, for example [S1].",
      "Each source includes document, page, and chunk; never invent pages or documents.",
      "Retrieved context:",
      context,
    ].join("\n\n"),
    messages: modelMessages,
    maxRetries: 2,
    temperature: 0.2,
  });

  return result.toUIMessageStreamResponse({
    originalMessages: parsed.data.messages,
    onError(error) {
      console.error(error);
      return language === "es" ? "No se pudo generar la respuesta." : "Could not generate the answer.";
    },
  });
}

function extractLatestUserText(messages: UIMessage[]) {
  const latest = [...messages].reverse().find((message) => message.role === "user");
  if (!latest) return "";
  return latest.parts
    .filter((part) => part.type === "text")
    .map((part) => part.text)
    .join("\n")
    .trim();
}
