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
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
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
    <Card className="border-[#e5e5e5] bg-white shadow-none transition-colors dark:border-[#2f2f2f] dark:bg-[#212121]">
      <CardHeader className="space-y-1.5 p-4">
        <CardTitle className="flex items-center gap-2 text-base dark:text-slate-50">
          <UploadCloud className="h-5 w-5" aria-hidden="true" />
          Subir PDF
        </CardTitle>
        <CardDescription className="text-xs">Storage privado local; no S3 externo.</CardDescription>
      </CardHeader>
      <CardContent className="p-4 pt-0">
        <form className="space-y-4" onSubmit={onSubmit}>
          <fieldset className="space-y-2">
            <legend className="text-xs font-medium text-slate-700 dark:text-slate-300">Embeddings para este documento</legend>
            <div className="space-y-2">
              {EMBEDDING_OPTIONS.map((option) => {
                const key = optionKey(option);
                const isSelected = key === embeddingKey;
                return (
                  <label
                    key={key}
                    className={cn(
                      "block cursor-pointer rounded-2xl border p-3 text-sm transition",
                      isSelected
                        ? "border-slate-900 bg-slate-50 dark:border-slate-200 dark:bg-[#2a2a2a]"
                        : "border-[#e5e5e5] bg-white hover:bg-[#f9f9f9] dark:border-[#2f2f2f] dark:bg-[#212121] dark:hover:bg-[#2a2a2a]",
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
                    <span className="flex items-center justify-between gap-3">
                      <span className="font-medium text-slate-900 dark:text-slate-50">{option.label}</span>
                      <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] uppercase tracking-wide text-slate-500 dark:bg-[#333333] dark:text-slate-300">
                        {option.shortLabel}
                      </span>
                    </span>
                    <span className="mt-1 block text-xs leading-5 text-slate-500 dark:text-slate-400">
                      {option.description}
                    </span>
                  </label>
                );
              })}
            </div>
          </fieldset>
          {selectedAttachment ? (
            <Attachments variant="list">
              <Attachment data={selectedAttachment} onRemove={clearSelectedFile}>
                <AttachmentPreview />
                <AttachmentInfo showMediaType />
                <AttachmentRemove label="Quitar archivo" />
              </Attachment>
            </Attachments>
          ) : null}
          <Input ref={inputRef} type="file" accept="application/pdf,.pdf" required onChange={onFileChange} />
          {message ? (
            <Alert variant="muted">
              <AlertDescription>{message}</AlertDescription>
            </Alert>
          ) : null}
          {error ? (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          ) : null}
          <Button className="w-full" type="submit" disabled={isUploading}>
            {isUploading ? "Subiendo..." : "Subir y procesar"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
