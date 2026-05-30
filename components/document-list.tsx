"use client";

import { Trash2 } from "lucide-react";
import { useState } from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import type { DocumentStatus, DocumentSummary } from "@/src/types/documents";

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
    <Card className="border-[#e5e5e5] bg-white shadow-none transition-colors dark:border-[#2f2f2f] dark:bg-[#212121]">
      <CardHeader className="space-y-1.5 p-4">
        <CardTitle className="text-base dark:text-slate-50">Biblioteca</CardTitle>
        <CardDescription className="text-xs">Selecciona docs listos para acotar el contexto.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-2 p-3 pt-0">
        {isLoading ? <p className="text-sm text-muted-foreground">Cargando documentos...</p> : null}
        {!isLoading && documents.length === 0 ? (
          <p className="rounded-lg border border-dashed p-4 text-sm text-muted-foreground dark:border-[#2f2f2f]">
            Todavía no hay documentos.
          </p>
        ) : null}
        {documents.map((document) => {
          const isReady = document.status === "ready";
          const isSelected = selectedIds.includes(document.id);
          return (
            <div
              key={document.id}
              className="rounded-2xl border border-[#e5e5e5] p-3 transition hover:bg-[#f9f9f9] dark:border-[#2f2f2f] dark:hover:bg-[#2a2a2a]"
            >
              <div className="flex items-start justify-between gap-3">
                <label className="flex min-w-0 flex-1 gap-3">
                  <input
                    className="mt-1 h-4 w-4 rounded border-input"
                    type="checkbox"
                    disabled={!isReady}
                    checked={isSelected}
                    onChange={() => toggle(document.id)}
                    aria-label={`Seleccionar ${document.name}`}
                  />
                  <span className="min-w-0">
                    <span className="block truncate font-medium text-slate-950 dark:text-slate-50">{document.name}</span>
                    <span className="mt-1 block text-xs text-muted-foreground">
                      {formatBytes(document.size)} • {document.pageCount} págs • {document.chunkCount} chunks
                    </span>
                  </span>
                </label>
                <Badge variant={statusVariants[document.status]}>{statusLabels[document.status]}</Badge>
              </div>
              {document.errorMessage ? <p className="mt-2 text-xs text-destructive">{document.errorMessage}</p> : null}
              <div className="mt-3 flex items-center justify-between gap-2 text-xs text-muted-foreground">
                <span className="truncate">{document.embeddingProvider}/{document.embeddingModel}</span>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => void removeDocument(document.id)}
                  disabled={deletingId === document.id}
                  className="dark:hover:bg-[#333333]"
                >
                  <Trash2 className="h-4 w-4" aria-hidden="true" />
                  Borrar
                </Button>
              </div>
            </div>
          );
        })}
      </CardContent>
    </Card>
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
