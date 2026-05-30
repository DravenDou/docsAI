"use client";

import { useEffect, useRef, useState } from "react";
import type { FileUIPart } from "ai";
import { UploadCloud } from "lucide-react";

import {
  Attachment,
  AttachmentInfo,
  AttachmentPreview,
  AttachmentRemove,
  Attachments,
} from "@/src/components/ai-elements/attachments";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { EMBEDDING_OPTIONS } from "@/src/rag/model-options";
import { cn } from "@/src/lib/utils";

function optionKey(option: (typeof EMBEDDING_OPTIONS)[number]) {
  return `${option.provider}:${option.model}`;
}

export function DocumentUploader({ onUploaded }: { onUploaded: () => Promise<void> | void }) {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const objectUrlRef = useRef<string | null>(null);
  const [embeddingKey, setEmbeddingKey] = useState(optionKey(EMBEDDING_OPTIONS[0]));
  const [selectedAttachment, setSelectedAttachment] = useState<(FileUIPart & { id: string }) | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  useEffect(
    () => () => {
      if (!objectUrlRef.current) return;
      URL.revokeObjectURL(objectUrlRef.current);
      objectUrlRef.current = null;
    },
    [],
  );

  function revokeSelectedObjectUrl() {
    if (!objectUrlRef.current) return;
    URL.revokeObjectURL(objectUrlRef.current);
    objectUrlRef.current = null;
  }

  function clearSelectedFile() {
    revokeSelectedObjectUrl();
    setSelectedAttachment(null);
    if (inputRef.current) inputRef.current.value = "";
  }

  function onFileChange(event: React.ChangeEvent<HTMLInputElement>) {
    revokeSelectedObjectUrl();
    const file = event.currentTarget.files?.[0];
    if (!file) {
      setSelectedAttachment(null);
      return;
    }

    const url = URL.createObjectURL(file);
    objectUrlRef.current = url;
    setSelectedAttachment({
      id: `${file.name}-${file.size}-${file.lastModified}`,
      type: "file",
      mediaType: file.type || "application/pdf",
      filename: file.name,
      url,
    });
  }

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setMessage(null);

    const file = inputRef.current?.files?.[0];
    if (!file) {
      setError("Selecciona un PDF primero.");
      return;
    }

    const formData = new FormData();
    const selectedEmbedding = EMBEDDING_OPTIONS.find((option) => optionKey(option) === embeddingKey) ?? EMBEDDING_OPTIONS[0];
    formData.set("embeddingProvider", selectedEmbedding.provider);
    formData.set("embeddingModel", selectedEmbedding.model);
    formData.set("file", file);

    setIsUploading(true);
    try {
      const response = await fetch("/api/documents", { method: "POST", body: formData });
      const body = (await response.json()) as { document?: unknown; error?: string };
      if (!response.ok) throw new Error(body.error ?? "No se pudo subir el documento.");
      setMessage("Documento en cola. El worker lo procesará en segundo plano.");
      clearSelectedFile();
      await onUploaded();
    } catch (currentError) {
      setError(currentError instanceof Error ? currentError.message : "Error desconocido al subir.");
    } finally {
      setIsUploading(false);
    }
  }

  return (
    <section className="rounded-[var(--radius-panel)] border border-app-border bg-app-surface-raised p-3 shadow-sm">
      <div className="mb-3 flex items-start gap-3">
        <div className="flex size-9 shrink-0 items-center justify-center rounded-[var(--radius-row)] bg-app-muted-surface">
          <UploadCloud className="size-4" aria-hidden="true" />
        </div>
        <div className="min-w-0">
          <h2 className="text-sm font-semibold tracking-tight">Subir PDF</h2>
          <p className="mt-1 text-xs leading-5 text-app-text-muted">Storage local privado, sin S3 externo.</p>
        </div>
      </div>

      <form className="space-y-3" onSubmit={onSubmit}>
        <fieldset className="space-y-2">
          <legend className="sr-only">Embeddings para este documento</legend>
          {EMBEDDING_OPTIONS.map((option) => {
            const key = optionKey(option);
            const isSelected = key === embeddingKey;
            return (
              <label
                key={key}
                className={cn(
                  "block cursor-pointer rounded-[var(--radius-row)] border p-3 text-sm transition",
                  isSelected
                    ? "border-foreground bg-app-muted-surface"
                    : "border-app-border bg-app-surface hover:bg-app-hover",
                )}
              >
                <input
                  className="sr-only"
                  type="radio"
                  name="embeddingOption"
                  value={key}
                  checked={isSelected}
                  onChange={() => setEmbeddingKey(key)}
                />
                <span className="flex min-w-0 items-center justify-between gap-3">
                  <span className="min-w-0 truncate font-medium">{option.label}</span>
                  <span className="shrink-0 rounded-full bg-app-surface-raised px-2 py-0.5 text-[10px] uppercase tracking-wide text-app-text-muted">
                    {option.shortLabel}
                  </span>
                </span>
                <span className="mt-1 block text-xs leading-5 text-app-text-muted">{option.description}</span>
              </label>
            );
          })}
        </fieldset>

        {selectedAttachment ? (
          <Attachments variant="list">
            <Attachment
              data={selectedAttachment}
              className="rounded-[var(--radius-row)] border-app-border bg-app-surface hover:bg-app-hover"
              onRemove={clearSelectedFile}
            >
              <AttachmentPreview className="rounded-[var(--radius-row)] bg-app-muted-surface" />
              <AttachmentInfo showMediaType />
              <AttachmentRemove className="rounded-full hover:bg-app-hover" label="Quitar archivo" />
            </Attachment>
          </Attachments>
        ) : null}

        <Input
          ref={inputRef}
          type="file"
          accept="application/pdf,.pdf"
          required
          onChange={onFileChange}
          className="h-auto min-h-11 rounded-[var(--radius-row)] border-app-border bg-app-surface py-2 dark:bg-app-surface text-xs file:mr-3 file:rounded-full file:border-0 file:bg-app-muted-surface file:px-3 file:py-1.5 file:text-xs file:font-medium file:text-foreground"
        />

        {message ? (
          <Alert variant="muted" className="rounded-[var(--radius-row)] border-app-border bg-app-surface dark:bg-app-surface">
            <AlertDescription>{message}</AlertDescription>
          </Alert>
        ) : null}
        {error ? (
          <Alert variant="destructive" className="rounded-[var(--radius-row)]">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        ) : null}

        <Button className="h-10 w-full rounded-full" type="submit" disabled={isUploading}>
          {isUploading ? "Subiendo..." : "Subir y procesar"}
        </Button>
      </form>
    </section>
  );
}
