import { convertToModelMessages, streamText, type UIMessage } from "ai";
import { z } from "zod";

import { requireUser } from "@/src/lib/auth";
import { enforceSameOrigin, jsonError, rejectLargeRequest, unauthorized } from "@/src/lib/http";
import { checkRateLimit, rateLimitResponse } from "@/src/lib/rate-limit";
import { getChatModel } from "@/src/rag/providers";
import { formatContext, retrieveRelevantChunks } from "@/src/rag/retrieval";

export const runtime = "nodejs";
const CHAT_BODY_MAX_BYTES = 64 * 1024;
const CHAT_RATE_LIMIT = { limit: 30, windowMs: 60 * 1000 };

const chatBodySchema = z.object({
  messages: z.array(z.custom<UIMessage>()).min(1).max(30),
  documentIds: z.array(z.string().min(1)).max(20).optional(),
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

  const context = retrieved.length ? formatContext(retrieved) : "No hay chunks listos para esta pregunta.";
  const modelMessages = await convertToModelMessages(parsed.data.messages);

  let model;
  try {
    model = getChatModel();
  } catch (error) {
    console.error("Chat model configuration failed", error);
    return jsonError("El modelo de chat no está configurado.", 503);
  }

  const result = streamText({
    model,
    system: [
      "Eres un asistente RAG para documentos empresariales.",
      "Responde en el idioma del usuario y de forma concisa.",
      "Usa solo el contexto recuperado. Si el contexto no contiene la respuesta, dilo claramente.",
      "Cita cada afirmación importante con el identificador de fuente, por ejemplo [S1].",
      "Cada fuente incluye documento, página y chunk; no inventes páginas ni documentos.",
      "Contexto recuperado:",
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
      return "No se pudo generar la respuesta.";
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
