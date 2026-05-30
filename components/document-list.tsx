"use client";

import { Trash2 } from "lucide-react";
import { useState } from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { DocumentStatus, DocumentSummary } from "@/src/types/documents";
import { cn } from "@/src/lib/utils";

const statusLabels: Record<DocumentStatus, string> = {
  queued: "En cola",
  processing: "Procesando",
  ready: "Listo",
  failed: "Falló",
};

const statusVariants: Record<DocumentStatus, "secondary" | "warning" | "success" | "destructive"> = {
  queued: "secondary",
  processing: "warning",
  ready: "success",
  failed: "destructive",
};

export function DocumentList({
  documents,
  isLoading,
  selectedIds,
  onSelectionChange,
  onDeleted,
}: {
  documents: DocumentSummary[];
  isLoading: boolean;
  selectedIds: string[];
  onSelectionChange: (ids: string[]) => void;
  onDeleted: () => Promise<void> | void;
}) {
  const [deletingId, setDeletingId] = useState<string | null>(null);

  function toggle(id: string) {
    onSelectionChange(selectedIds.includes(id) ? selectedIds.filter((item) => item !== id) : [...selectedIds, id]);
  }

  async function removeDocument(id: string) {
    setDeletingId(id);
    try {
      const response = await fetch(`/api/documents/${id}`, { method: "DELETE" });
      if (!response.ok) {
        const body = (await response.json()) as { error?: string };
        throw new Error(body.error ?? "No se pudo borrar el documento.");
      }
      onSelectionChange(selectedIds.filter((item) => item !== id));
      await onDeleted();
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <section className="rounded-[var(--radius-panel)] border border-app-border bg-app-surface-raised p-3 shadow-sm">
      <div className="mb-3 flex items-end justify-between gap-3">
        <div className="min-w-0">
          <h2 className="text-sm font-semibold tracking-tight">Biblioteca</h2>
          <p className="mt-1 text-xs leading-5 text-app-text-muted">Selecciona documentos listos para acotar el contexto.</p>
        </div>
        {documents.length ? <span className="shrink-0 text-xs text-app-text-muted">{documents.length}</span> : null}
      </div>

      <div className="space-y-2">
        {isLoading ? <p className="rounded-[var(--radius-row)] bg-app-muted-surface p-3 text-sm text-app-text-muted">Cargando documentos...</p> : null}
        {!isLoading && documents.length === 0 ? (
          <p className="rounded-[var(--radius-row)] border border-dashed border-app-border p-4 text-sm leading-6 text-app-text-muted">
            Todavía no hay documentos.
          </p>
        ) : null}
        {documents.map((document) => {
          const isReady = document.status === "ready";
          const isSelected = selectedIds.includes(document.id);
          return (
            <div
              key={document.id}
              className={cn(
                "rounded-[var(--radius-row)] border p-3 transition hover:bg-app-hover",
                isSelected ? "border-foreground bg-app-muted-surface" : "border-app-border bg-app-surface",
              )}
            >
              <div className="flex items-start justify-between gap-3">
                <label className="flex min-w-0 flex-1 cursor-pointer gap-3">
                  <input
                    className="mt-1 size-4 rounded border-input accent-foreground disabled:cursor-not-allowed disabled:opacity-50"
                    type="checkbox"
                    disabled={!isReady}
                    checked={isSelected}
                    onChange={() => toggle(document.id)}
                    aria-label={`Seleccionar ${document.name}`}
                  />
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-sm font-medium text-foreground" title={document.name}>
                      {document.name}
                    </span>
                    <span className="mt-1 flex flex-wrap gap-x-2 gap-y-1 text-xs text-app-text-muted">
                      <span>{formatBytes(document.size)}</span>
                      <span>{document.pageCount} págs</span>
                      <span>{document.chunkCount} chunks</span>
                    </span>
                  </span>
                </label>
                <Badge className="shrink-0 rounded-full" variant={statusVariants[document.status]}>
                  {statusLabels[document.status]}
                </Badge>
              </div>
              {document.errorMessage ? <p className="mt-2 text-xs text-destructive">{document.errorMessage}</p> : null}
              <div className="mt-3 flex min-w-0 items-center justify-between gap-2 text-xs text-app-text-muted">
                <span className="min-w-0 truncate" title={`${document.embeddingProvider}/${document.embeddingModel}`}>
                  {document.embeddingProvider}/{document.embeddingModel}
                </span>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => void removeDocument(document.id)}
                  disabled={deletingId === document.id}
                  className="h-8 shrink-0 rounded-full px-2 hover:bg-app-hover"
                >
                  <Trash2 className="size-4" aria-hidden="true" />
                  Borrar
                </Button>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}

function formatBytes(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  const units = ["KB", "MB", "GB"];
  let value = bytes / 1024;
  let unit = units.shift() ?? "KB";
  while (value >= 1024 && units.length) {
    value /= 1024;
    unit = units.shift() ?? unit;
  }
  return `${value.toFixed(value >= 10 ? 0 : 1)} ${unit}`;
}
