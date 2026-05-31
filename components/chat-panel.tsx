"use client";

import { useMemo, useState } from "react";
import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport, type UIMessage } from "ai";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import {
  ArrowUp,
  BookOpenCheck,
  FileSearch,
  PanelLeftClose,
  PanelLeftOpen,
  Quote,
  ShieldCheck,
  Square,
  UploadCloud,
  type LucideIcon,
} from "lucide-react";

import {
  Conversation,
  ConversationContent,
  ConversationScrollButton,
} from "@/src/components/ai-elements/conversation";
import {
  Message,
  MessageContent,
  MessageResponse,
  MessageToolbar,
} from "@/src/components/ai-elements/message";
import { Shimmer } from "@/src/components/ai-elements/shimmer";
import { Source, Sources, SourcesContent, SourcesTrigger } from "@/src/components/ai-elements/sources";
import { Suggestion, Suggestions } from "@/src/components/ai-elements/suggestion";
import { ThemeToggle } from "@/components/theme-toggle";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/src/lib/utils";
import type { ModelAccessMode } from "@/src/rag/model-options";
import type { DocumentSummary } from "@/src/types/documents";

const suggestions = [
  "Resume el documento y cita las páginas clave",
  "Extrae riesgos, decisiones y próximos pasos",
  "¿Qué dice sobre costos, fechas o responsabilidades?",
];

const onboardingSteps: Array<{ icon: LucideIcon; title: string; description: string }> = [
  {
    icon: UploadCloud,
    title: "Sube un PDF",
    description: "El archivo queda en storage local privado y se procesa en segundo plano.",
  },
  {
    icon: BookOpenCheck,
    title: "Espera el estado Listo",
    description: "LiteParse extrae páginas, DOCSAI crea chunks y pgvector guarda embeddings.",
  },
  {
    icon: Quote,
    title: "Pregunta con citas",
    description: "Cada respuesta debe citar fuente, página y chunk para que puedas auditarla.",
  },
];

export function ChatPanel({
  documents,
  isSidebarOpen,
  modelAccess,
  selectedIds,
  onSelectionChange,
  onToggleSidebar,
}: {
  documents: DocumentSummary[];
  isSidebarOpen: boolean;
  modelAccess: ModelAccessMode;
  selectedIds: string[];
  onSelectionChange: (ids: string[]) => void;
  onToggleSidebar: () => void;
}) {
  const [input, setInput] = useState("");
  const selectedNames = useMemo(
    () => documents.filter((document) => selectedIds.includes(document.id)).map((document) => document.name),
    [documents, selectedIds],
  );
  const { messages, sendMessage, status, error, stop } = useChat({
    transport: new DefaultChatTransport({ api: "/api/chat" }),
  });
  const shouldReduceMotion = useReducedMotion();
  const isBusy = status === "submitted" || status === "streaming";
  const showThinking = status === "submitted";
  const isDemoAccess = modelAccess === "openrouter-free";

  async function send(text: string) {
    const clean = text.trim();
    if (!clean || isBusy) return;
    setInput("");
    await sendMessage({ text: clean }, { body: { documentIds: selectedIds } });
  }

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    await send(input);
  }

  return (
    <div className="flex min-h-0 flex-1 flex-col bg-app-background transition-colors duration-300">
      <header className="hidden h-14 shrink-0 items-center justify-between border-b border-app-border bg-app-background px-5 transition-colors md:flex">
        <div className="flex min-w-0 items-center gap-3">
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="size-9 rounded-full hover:bg-app-hover"
            aria-controls="documents-panel"
            aria-expanded={isSidebarOpen}
            aria-label={isSidebarOpen ? "Cerrar panel de documentos" : "Abrir panel de documentos"}
            onClick={onToggleSidebar}
          >
            {isSidebarOpen ? (
              <PanelLeftClose className="size-4" aria-hidden="true" />
            ) : (
              <PanelLeftOpen className="size-4" aria-hidden="true" />
            )}
          </Button>
          <div className="min-w-0">
            <h1 className="text-sm font-semibold tracking-tight">Chat con documentos</h1>
            <p className="truncate text-xs text-app-text-muted">
              {selectedNames.length
                ? `Contexto: ${selectedNames.join(", ")}`
                : "Sin selección: buscará en todos tus documentos listos."}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {isDemoAccess ? (
            <span className="hidden rounded-full border border-app-border bg-app-muted-surface px-3 py-1.5 text-xs font-medium text-app-text-muted lg:inline-flex">
              OpenRouter free
            </span>
          ) : null}
          {selectedIds.length ? (
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="rounded-full border-app-border bg-app-surface-raised hover:bg-app-hover"
              onClick={() => onSelectionChange([])}
            >
              Usar todos
            </Button>
          ) : null}
          <ThemeToggle className="size-9 rounded-full border-app-border bg-app-surface-raised hover:bg-app-hover" />
        </div>
      </header>

      <Conversation className="min-h-0 flex-1 px-3 sm:px-4">
        <ConversationContent className="mx-auto min-h-full w-full max-w-[48rem] gap-8 px-0 py-8 sm:px-2">
          {messages.length === 0 ? (
            <motion.div
              className="flex flex-1 flex-col items-center justify-center px-2 py-10"
              initial={shouldReduceMotion ? false : { opacity: 0, y: 16 }}
              animate={shouldReduceMotion ? undefined : { opacity: 1, y: 0 }}
              transition={{ duration: 0.28, ease: "easeOut" }}
            >
              <div className="w-full max-w-3xl rounded-[calc(var(--radius-panel)+0.35rem)] border border-app-border bg-app-surface-raised p-4 text-left shadow-sm sm:p-6">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                  <div className="flex min-w-0 gap-4">
                    <div className="flex size-12 shrink-0 items-center justify-center rounded-[var(--radius-panel)] border border-app-border bg-app-muted-surface shadow-sm">
                      <FileSearch className="size-6 text-foreground" aria-hidden="true" />
                    </div>
                    <div className="min-w-0">
                      <Shimmer as="h2" className="text-2xl font-semibold tracking-tight sm:text-3xl">
                        {documents.length ? "Tus documentos están listos" : "Empieza con tu primer documento"}
                      </Shimmer>
                      <p className="mt-3 max-w-2xl text-sm leading-6 text-app-text-muted">
                        {documents.length
                          ? "Pregunta sobre todos tus documentos listos o selecciona fuentes concretas desde el panel lateral."
                          : "Sube un PDF, espera el procesamiento y conversa con respuestas basadas solo en contexto recuperado."}
                      </p>
                    </div>
                  </div>
                  {isDemoAccess ? (
                    <div className="inline-flex shrink-0 items-center gap-2 rounded-full border border-app-border bg-app-muted-surface px-3 py-1.5 text-xs font-medium text-app-text-muted">
                      <ShieldCheck className="size-3.5 text-foreground" aria-hidden="true" />
                      Demo free
                    </div>
                  ) : null}
                </div>

                <div className="mt-6 grid gap-2 sm:grid-cols-3">
                  {onboardingSteps.map((step) => {
                    const StepIcon = step.icon;
                    return (
                      <div key={step.title} className="rounded-[var(--radius-row)] border border-app-border bg-app-surface p-3">
                        <StepIcon className="mb-3 size-4 text-foreground" aria-hidden="true" />
                        <h3 className="text-sm font-semibold tracking-tight">{step.title}</h3>
                        <p className="mt-1 text-xs leading-5 text-app-text-muted">{step.description}</p>
                      </div>
                    );
                  })}
                </div>

                <div className="mt-5 flex flex-col gap-3 rounded-[var(--radius-row)] bg-app-muted-surface p-3 sm:flex-row sm:items-center sm:justify-between">
                  <div className="min-w-0 text-sm leading-6 text-app-text-muted">
                    {documents.length
                      ? `${documents.length} documento${documents.length === 1 ? "" : "s"} listo${documents.length === 1 ? "" : "s"} para consultar.`
                      : "El primer paso vive en el panel de documentos."}
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    className="rounded-full border-app-border bg-app-surface-raised hover:bg-app-hover"
                    disabled={isSidebarOpen}
                    onClick={() => {
                      if (!isSidebarOpen) onToggleSidebar();
                    }}
                  >
                    {isSidebarOpen ? "Panel abierto" : "Abrir panel"}
                  </Button>
                </div>
              </div>
              <Suggestions className="mx-auto mt-7 flex w-full max-w-3xl flex-wrap justify-center gap-2 py-1">
                {suggestions.map((suggestion) => (
                  <Suggestion
                    key={suggestion}
                    suggestion={suggestion}
                    className="h-auto max-w-[min(100%,18rem)] whitespace-normal rounded-[var(--radius-chat)] border-app-border bg-app-surface-raised px-4 py-3 text-left leading-5 shadow-sm hover:bg-app-hover"
                    onClick={setInput}
                  />
                ))}
              </Suggestions>
            </motion.div>
          ) : (
            <div className="flex flex-col gap-7">
              <AnimatePresence initial={false}>
                {messages.map((message) => (
                  <ChatMessage
                    key={message.id}
                    isStreaming={isBusy && message.role === "assistant" && messages.at(-1)?.id === message.id}
                    message={message}
                    shouldReduceMotion={shouldReduceMotion}
                  />
                ))}
                {showThinking ? <ThinkingProcess key="thinking-process" shouldReduceMotion={shouldReduceMotion} /> : null}
              </AnimatePresence>
            </div>
          )}
        </ConversationContent>
        <ConversationScrollButton className="bottom-3 rounded-full border-app-border bg-app-surface-raised shadow-sm hover:bg-app-hover" />
      </Conversation>

      <div className="shrink-0 bg-gradient-to-t from-app-background via-app-background to-transparent px-3 pb-4 pt-2 transition-colors sm:px-4">
        <div className="mx-auto w-full max-w-[48rem] space-y-3">
          {documents.length === 0 ? (
            <Alert variant="muted" className="rounded-[var(--radius-panel)] border-app-border bg-app-surface-raised">
              <AlertDescription>Sube al menos un PDF y espera a que esté listo antes de preguntar.</AlertDescription>
            </Alert>
          ) : null}
          {error ? (
            <Alert variant="destructive" className="rounded-[var(--radius-panel)] bg-app-surface-raised">
              <AlertDescription>{error.message}</AlertDescription>
            </Alert>
          ) : null}
          <form
            className="rounded-[var(--radius-chat)] border border-app-border-strong bg-app-surface-raised p-2 shadow-[var(--app-glow)] transition duration-200 focus-within:border-app-text-muted/60"
            onSubmit={submit}
          >
            <Textarea
              value={input}
              onChange={(event) => setInput(event.target.value)}
              placeholder="Pregunta algo sobre tus documentos..."
              className="max-h-48 min-h-16 resize-none border-0 bg-transparent px-3 py-3 dark:bg-transparent text-base shadow-none focus-visible:ring-0 md:text-sm"
              onKeyDown={(event) => {
                if (event.key === "Enter" && !event.shiftKey) {
                  event.preventDefault();
                  event.currentTarget.form?.requestSubmit();
                }
              }}
            />
            <div className="flex items-center justify-between gap-3 px-2 pb-1 text-xs text-app-text-muted">
              <span className="truncate">Enter para enviar. Shift+Enter nueva línea</span>
              {isBusy ? (
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  className="size-9 rounded-full border-app-border bg-app-surface hover:bg-app-hover"
                  aria-label="Detener"
                  onClick={() => void stop()}
                >
                  <Square className="size-4" aria-hidden="true" />
                </Button>
              ) : (
                <Button
                  type="submit"
                  size="icon"
                  aria-label="Enviar"
                  disabled={!input.trim() || documents.length === 0}
                  className="size-9 rounded-full"
                >
                  <ArrowUp className="size-4" aria-hidden="true" />
                </Button>
              )}
            </div>
          </form>
          <p className="text-center text-[11px] leading-4 text-app-text-muted/80">
            DOCSAI puede equivocarse; verifica documento, página y chunk en las citas.
          </p>
        </div>
      </div>
    </div>
  );
}

function ChatMessage({
  message,
  isStreaming,
  shouldReduceMotion,
}: {
  message: UIMessage;
  isStreaming?: boolean;
  shouldReduceMotion: boolean | null;
}) {
  const text = message.parts
    .filter((part) => part.type === "text")
    .map((part) => part.text)
    .join("");
  const isUser = message.role === "user";
  const sourceRefs = isUser ? [] : extractSourceRefs(text);

  return (
    <motion.article
      className={cn("flex w-full", isUser ? "justify-end" : "justify-start")}
      initial={shouldReduceMotion ? false : { opacity: 0, y: 14, scale: 0.985 }}
      animate={shouldReduceMotion ? undefined : { opacity: 1, y: 0, scale: 1 }}
      exit={shouldReduceMotion ? undefined : { opacity: 0, y: -8, scale: 0.985 }}
      transition={{ duration: 0.22, ease: "easeOut" }}
      layout="position"
    >
      <Message from={message.role} className={cn(isUser ? "max-w-[85%]" : "max-w-full")}> 
        <MessageContent
          className={cn(
            "min-w-0 text-sm leading-7",
            isUser
              ? "rounded-[var(--radius-chat)] bg-app-user px-5 py-2.5 text-foreground"
              : "w-full overflow-visible text-foreground",
          )}
        >
          {isUser ? (
            <p className="whitespace-pre-wrap break-words">{text}</p>
          ) : (
            <MessageResponse caret="block" controls={false} isAnimating={isStreaming} mode="streaming">
              {text}
            </MessageResponse>
          )}
        </MessageContent>
        {!isUser && text ? (
          <>
            {sourceRefs.length ? (
              <Sources className="mb-0 mt-3 text-app-text-muted">
                <SourcesTrigger
                  count={sourceRefs.length}
                  className="rounded-full border border-app-border bg-app-surface-raised px-3 py-1.5 text-[11px] font-medium transition hover:bg-app-hover"
                >
                  <span>{sourceRefs.length} citas detectadas</span>
                </SourcesTrigger>
                <SourcesContent className="w-full max-w-sm rounded-[var(--radius-panel)] border border-app-border bg-app-surface-raised p-2 shadow-sm">
                  {sourceRefs.map((ref) => (
                    <Source
                      key={ref}
                      href={`#${ref.slice(1, -1).toLowerCase()}`}
                      title={`${ref} citado en la respuesta`}
                      className="min-w-0 rounded-[var(--radius-row)] px-2 py-1.5 transition hover:bg-app-hover"
                      onClick={(event) => event.preventDefault()}
                    >
                      <span className="shrink-0 font-medium text-foreground">{ref}</span>
                      <span className="truncate text-app-text-muted">citado en la respuesta</span>
                    </Source>
                  ))}
                </SourcesContent>
              </Sources>
            ) : null}
            <MessageToolbar className="mt-2 justify-start text-[11px] text-app-text-muted/80">
              <span>Respuesta basada en contexto recuperado. Verifica citas [S].</span>
            </MessageToolbar>
          </>
        ) : null}
      </Message>
    </motion.article>
  );
}

function extractSourceRefs(text: string) {
  return Array.from(new Set(text.match(/\[S\d+\]/g) ?? []));
}

function ThinkingProcess({ shouldReduceMotion }: { shouldReduceMotion: boolean | null }) {
  return (
    <motion.article
      className="flex w-full justify-start"
      initial={shouldReduceMotion ? false : { opacity: 0, y: 10 }}
      animate={shouldReduceMotion ? undefined : { opacity: 1, y: 0 }}
      exit={shouldReduceMotion ? undefined : { opacity: 0, y: -6 }}
      transition={{ duration: 0.2, ease: "easeOut" }}
      layout="position"
    >
      <div className="inline-flex items-center gap-2 rounded-full bg-app-muted-surface px-4 py-2 text-sm text-app-text-muted">
        <span>Pensando</span>
        <span className="flex items-center gap-1" aria-hidden="true">
          <span className="size-1.5 animate-bounce rounded-full bg-current [animation-delay:-0.24s]" />
          <span className="size-1.5 animate-bounce rounded-full bg-current [animation-delay:-0.12s]" />
          <span className="size-1.5 animate-bounce rounded-full bg-current" />
        </span>
      </div>
    </motion.article>
  );
}
