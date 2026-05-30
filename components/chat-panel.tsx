"use client";

import { useMemo, useState } from "react";
import { DefaultChatTransport, type UIMessage } from "ai";
import { useChat } from "@ai-sdk/react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import {
  ArrowUp,
  FileSearch,
  FileText,
  PanelLeftClose,
  PanelLeftOpen,
  Quote,
  Search,
  Sparkles,
  Square,
} from "lucide-react";

import {
  ChainOfThought,
  ChainOfThoughtContent,
  ChainOfThoughtHeader,
  ChainOfThoughtSearchResult,
  ChainOfThoughtSearchResults,
  ChainOfThoughtStep,
} from "@/src/components/ai-elements/chain-of-thought";
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
import {
  Reasoning,
  ReasoningContent,
  ReasoningTrigger,
} from "@/src/components/ai-elements/reasoning";
import { Shimmer } from "@/src/components/ai-elements/shimmer";
import { Source, Sources, SourcesContent, SourcesTrigger } from "@/src/components/ai-elements/sources";
import { Suggestion, Suggestions } from "@/src/components/ai-elements/suggestion";
import { Task, TaskContent, TaskItem, TaskItemFile, TaskTrigger } from "@/src/components/ai-elements/task";
import { ThemeToggle } from "@/components/theme-toggle";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/src/lib/utils";
import type { DocumentSummary } from "@/src/types/documents";

const suggestions = [
  "Resume el documento y cita las páginas clave",
  "Extrae riesgos, decisiones y próximos pasos",
  "¿Qué dice sobre costos, fechas o responsabilidades?",
];

export function ChatPanel({
  documents,
  isSidebarOpen,
  selectedIds,
  onSelectionChange,
  onToggleSidebar,
}: {
  documents: DocumentSummary[];
  isSidebarOpen: boolean;
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
    <div className="flex min-h-0 flex-1 flex-col bg-white transition-colors duration-300 dark:bg-[#212121]">
      <header className="hidden h-14 shrink-0 items-center justify-between border-b border-slate-200 bg-white px-5 transition-colors dark:border-[#2f2f2f] dark:bg-[#212121] md:flex">
        <div className="flex min-w-0 items-center gap-3">
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="h-9 w-9"
            aria-controls="documents-panel"
            aria-expanded={isSidebarOpen}
            aria-label={isSidebarOpen ? "Cerrar panel de documentos" : "Abrir panel de documentos"}
            onClick={onToggleSidebar}
          >
            {isSidebarOpen ? (
              <PanelLeftClose className="h-4 w-4" aria-hidden="true" />
            ) : (
              <PanelLeftOpen className="h-4 w-4" aria-hidden="true" />
            )}
          </Button>
          <div className="min-w-0">
            <h1 className="text-sm font-semibold text-slate-900 dark:text-slate-50">Chat con documentos</h1>
            <p className="truncate text-xs text-slate-500 dark:text-slate-400">
              {selectedNames.length
                ? `Contexto: ${selectedNames.join(", ")}`
                : "Sin selección: buscará en todos tus documentos listos."}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {selectedIds.length ? (
            <Button type="button" variant="outline" size="sm" onClick={() => onSelectionChange([])}>
              Usar todos
            </Button>
          ) : null}
          <ThemeToggle className="h-9 w-9 dark:border-[#2f2f2f] dark:bg-[#212121]" />
        </div>
      </header>

      <Conversation className="min-h-0 flex-1 px-4">
        <ConversationContent className="mx-auto min-h-full w-full max-w-3xl py-8">
          {messages.length === 0 ? (
            <motion.div
              className="flex flex-1 flex-col items-center justify-center text-center"
              initial={shouldReduceMotion ? false : { opacity: 0, y: 16 }}
              animate={shouldReduceMotion ? undefined : { opacity: 1, y: 0 }}
              transition={{ duration: 0.28, ease: "easeOut" }}
            >
              <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-[#2f2f2f] dark:bg-[#2a2a2a]">
                <FileSearch className="h-6 w-6 text-slate-800 dark:text-slate-100" aria-hidden="true" />
              </div>
              <Shimmer as="h2" className="text-2xl font-semibold tracking-tight text-slate-900 dark:text-slate-50">
                ¿Qué quieres saber de tus docs?
              </Shimmer>
              <p className="mt-2 max-w-md text-sm leading-6 text-slate-500 dark:text-slate-400">
                Sube PDFs desde la barra lateral, espera a que estén listos y pregunta. Las respuestas deben citar fuentes.
              </p>
              <Suggestions className="mt-6 py-1">
                {suggestions.map((suggestion) => (
                  <Suggestion
                    key={suggestion}
                    suggestion={suggestion}
                    className="h-auto max-w-64 whitespace-normal rounded-2xl px-4 py-3 text-left leading-5 shadow-sm"
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
                {isBusy ? (
                  <ThinkingProcess
                    key="thinking-process"
                    selectedNames={selectedNames}
                    shouldReduceMotion={shouldReduceMotion}
                    status={status}
                    usesAllDocuments={selectedIds.length === 0}
                  />
                ) : null}
              </AnimatePresence>
            </div>
          )}
        </ConversationContent>
        <ConversationScrollButton className="bottom-3" />
      </Conversation>

      <div className="shrink-0 bg-gradient-to-t from-white via-white to-transparent px-4 pb-4 pt-2 transition-colors dark:from-[#212121] dark:via-[#212121] dark:to-transparent">
        <div className="mx-auto w-full max-w-3xl space-y-3">
          {documents.length === 0 ? (
            <Alert variant="muted" className="bg-white dark:border-[#2f2f2f] dark:bg-[#2a2a2a]">
              <AlertDescription>Sube al menos un PDF y espera a que esté listo antes de preguntar.</AlertDescription>
            </Alert>
          ) : null}
          {error ? (
            <Alert variant="destructive" className="bg-white dark:bg-[#2a2a2a]">
              <AlertDescription>{error.message}</AlertDescription>
            </Alert>
          ) : null}
          <form
            className="rounded-[1.65rem] border border-[#d9d9d9] bg-white p-2 shadow-[0_8px_28px_rgba(0,0,0,0.08)] transition-all duration-200 focus-within:shadow-[0_12px_36px_rgba(0,0,0,0.12)] dark:border-[#3a3a3a] dark:bg-[#2a2a2a] dark:shadow-[0_12px_40px_rgba(0,0,0,0.35)]"
            onSubmit={submit}
          >
            <Textarea
              value={input}
              onChange={(event) => setInput(event.target.value)}
              placeholder="Pregunta algo sobre tus documentos..."
              className="max-h-48 min-h-16 resize-none border-0 bg-transparent px-3 py-3 shadow-none focus-visible:ring-0 dark:text-slate-100 dark:placeholder:text-slate-500"
              onKeyDown={(event) => {
                if (event.key === "Enter" && !event.shiftKey) {
                  event.preventDefault();
                  event.currentTarget.form?.requestSubmit();
                }
              }}
            />
            <div className="flex items-center justify-between px-2 pb-1 text-xs text-slate-500 dark:text-slate-400">
              <span>Enter para enviar • Shift+Enter nueva línea</span>
              {isBusy ? (
                <Button type="button" variant="outline" size="icon" aria-label="Detener" onClick={() => void stop()}>
                  <Square className="h-4 w-4" aria-hidden="true" />
                </Button>
              ) : (
                <Button
                  type="submit"
                  size="icon"
                  aria-label="Enviar"
                  disabled={!input.trim() || documents.length === 0}
                  className="rounded-full"
                >
                  <ArrowUp className="h-4 w-4" aria-hidden="true" />
                </Button>
              )}
            </div>
          </form>
          <p className="text-center text-[11px] leading-4 text-slate-400 dark:text-slate-500">
            Bussi RAG puede equivocarse; verifica las citas de documento, página y chunk.
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
      className={cn("flex gap-4", isUser ? "justify-end" : "justify-start")}
      initial={shouldReduceMotion ? false : { opacity: 0, y: 14, scale: 0.985 }}
      animate={shouldReduceMotion ? undefined : { opacity: 1, y: 0, scale: 1 }}
      exit={shouldReduceMotion ? undefined : { opacity: 0, y: -8, scale: 0.985 }}
      transition={{ duration: 0.22, ease: "easeOut" }}
      layout="position"
    >
      {!isUser ? (
        <div className="mt-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-[#e5e5e5] bg-white text-xs font-semibold text-slate-700 dark:border-[#2f2f2f] dark:bg-[#2a2a2a] dark:text-slate-200">
          B
        </div>
      ) : null}
      <Message from={message.role} className={cn(isUser ? "max-w-[85%]" : "max-w-full")}>
        <MessageContent
          className={cn(
            "text-sm leading-7",
            isUser
              ? "rounded-3xl bg-[#f4f4f4] px-5 py-2.5 text-slate-900 dark:bg-[#2f2f2f] dark:text-slate-100"
              : "w-full text-slate-800 dark:text-slate-100",
          )}
        >
          {isUser ? (
            <p className="whitespace-pre-wrap">{text}</p>
          ) : (
            <MessageResponse caret="block" controls={false} isAnimating={isStreaming} mode="streaming">
              {text}
            </MessageResponse>
          )}
        </MessageContent>
        {!isUser && text ? (
          <>
            {sourceRefs.length ? (
              <Sources className="mb-0 mt-3 text-slate-600 dark:text-slate-300">
                <SourcesTrigger
                  count={sourceRefs.length}
                  className="rounded-full border border-slate-200 px-3 py-1.5 text-[11px] font-medium transition hover:bg-slate-50 dark:border-[#3a3a3a] dark:hover:bg-[#2a2a2a]"
                >
                  <span>{sourceRefs.length} citas detectadas</span>
                </SourcesTrigger>
                <SourcesContent className="rounded-2xl border border-slate-200 bg-white p-3 shadow-sm dark:border-[#3a3a3a] dark:bg-[#2a2a2a]">
                  {sourceRefs.map((ref) => (
                    <Source
                      key={ref}
                      href={`#${ref.slice(1, -1).toLowerCase()}`}
                      title={`${ref} citado en la respuesta`}
                      onClick={(event) => event.preventDefault()}
                    />
                  ))}
                </SourcesContent>
              </Sources>
            ) : null}
            <MessageToolbar className="mt-2 justify-start text-[11px] text-slate-400 dark:text-slate-500">
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

function ThinkingProcess({
  selectedNames,
  shouldReduceMotion,
  status,
  usesAllDocuments,
}: {
  selectedNames: string[];
  shouldReduceMotion: boolean | null;
  status: string;
  usesAllDocuments: boolean;
}) {
  const isSubmitted = status === "submitted";
  const visibleDocs = selectedNames.slice(0, 3);
  const documentLabel = usesAllDocuments
    ? "Todos los documentos listos"
    : visibleDocs.length
      ? visibleDocs.join(", ")
      : "Documentos seleccionados";

  return (
    <motion.div
      className="flex gap-4"
      initial={shouldReduceMotion ? false : { opacity: 0, y: 14, scale: 0.985 }}
      animate={shouldReduceMotion ? undefined : { opacity: 1, y: 0, scale: 1 }}
      exit={shouldReduceMotion ? undefined : { opacity: 0, y: -8, scale: 0.985 }}
      transition={{ duration: 0.22, ease: "easeOut" }}
      layout="position"
    >
      <div className="mt-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-[#e5e5e5] bg-white text-xs font-semibold text-slate-700 dark:border-[#2f2f2f] dark:bg-[#2a2a2a] dark:text-slate-200">
        B
      </div>
      <div className="w-full max-w-2xl rounded-2xl border border-slate-200 bg-white p-4 shadow-sm transition-colors dark:border-[#3a3a3a] dark:bg-[#2a2a2a]">
        <Reasoning className="mb-3" defaultOpen isStreaming>
          <ReasoningTrigger
            getThinkingMessage={() => (
              <Shimmer duration={1.15}>
                {isSubmitted ? "Buscando contexto en tus documentos..." : "Pensando..."}
              </Shimmer>
            )}
          />
          <ReasoningContent>
            {[
              "Proceso visible de RAG: revisar selección, recuperar chunks relevantes y redactar con citas.",
              "No se muestra razonamiento interno privado del modelo; solo pasos operativos verificables.",
            ].join("\n")}
          </ReasoningContent>
        </Reasoning>

        <ChainOfThought defaultOpen>
          <ChainOfThoughtHeader>Proceso RAG</ChainOfThoughtHeader>
          <ChainOfThoughtContent>
            <ChainOfThoughtStep
              description={documentLabel}
              icon={FileText}
              label="Preparar documentos de contexto"
              status="complete"
            />
            <ChainOfThoughtStep
              description="pgvector busca chunks cercanos a tu pregunta."
              icon={Search}
              label="Recuperar evidencia"
              status={isSubmitted ? "active" : "complete"}
            >
              <ChainOfThoughtSearchResults>
                {(usesAllDocuments ? ["todos los docs"] : visibleDocs).map((name) => (
                  <ChainOfThoughtSearchResult key={name}>{name}</ChainOfThoughtSearchResult>
                ))}
              </ChainOfThoughtSearchResults>
            </ChainOfThoughtStep>
            <ChainOfThoughtStep
              description="La respuesta debe incluir documento, página y chunk en las citas."
              icon={Quote}
              label="Verificar citas"
              status={isSubmitted ? "pending" : "active"}
            />
            <ChainOfThoughtStep
              description="Preparando una respuesta clara con el contexto recuperado."
              icon={Sparkles}
              label="Pensando"
              status={isSubmitted ? "pending" : "active"}
            />
          </ChainOfThoughtContent>
        </ChainOfThought>

        <Task className="mt-4 rounded-xl border border-slate-100 bg-slate-50/70 p-3 dark:border-[#3a3a3a] dark:bg-[#212121]" defaultOpen={false}>
          <TaskTrigger title="Contexto usado" />
          <TaskContent>
            <TaskItem>
              <TaskItemFile>{documentLabel}</TaskItemFile>
            </TaskItem>
            <TaskItem>El asistente responderá solo con la evidencia recuperada.</TaskItem>
          </TaskContent>
        </Task>
      </div>
    </motion.div>
  );
}
