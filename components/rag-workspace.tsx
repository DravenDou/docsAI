"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { FileText, LogOut, MessageSquareText, PanelLeftClose, PanelLeftOpen } from "lucide-react";
import { useRouter } from "next/navigation";

import { ChatPanel } from "@/components/chat-panel";
import { DocumentList } from "@/components/document-list";
import { DocumentUploader } from "@/components/document-uploader";
import { ThemeToggle } from "@/components/theme-toggle";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { authClient } from "@/src/lib/auth-client";
import { cn } from "@/src/lib/utils";
import type { DocumentSummary } from "@/src/types/documents";

export function RagWorkspace({ userEmail }: { userEmail: string }) {
  const router = useRouter();
  const [documents, setDocuments] = useState<DocumentSummary[]>([]);
  const documentsRef = useRef<DocumentSummary[]>([]);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isSidebarPreferenceLoaded, setIsSidebarPreferenceLoaded] = useState(false);

  const loadDocuments = useCallback(async () => {
    const response = await fetch("/api/documents", { cache: "no-store" });
    const body = (await response.json()) as { documents?: DocumentSummary[]; error?: string };
    if (!response.ok) throw new Error(body.error ?? "No se pudieron cargar los documentos.");
    const nextDocuments = body.documents ?? [];
    documentsRef.current = nextDocuments;
    setDocuments(nextDocuments);
    const nextReadyIds = new Set(
      nextDocuments.filter((document) => document.status === "ready").map((document) => document.id),
    );
    setSelectedIds((current) => current.filter((id) => nextReadyIds.has(id)));
  }, []);

  useEffect(() => {
    let ignore = false;

    async function run() {
      try {
        if (!ignore) setError(null);
        await loadDocuments();
      } catch (currentError) {
        if (!ignore) setError(currentError instanceof Error ? currentError.message : "Error desconocido.");
      } finally {
        if (!ignore) setIsLoading(false);
      }
    }

    void run();
    const interval = window.setInterval(() => {
      if (documentsRef.current.some((document) => document.status === "queued" || document.status === "processing")) {
        void run();
      }
    }, 4000);

    return () => {
      ignore = true;
      window.clearInterval(interval);
    };
  }, [loadDocuments]);

  useEffect(() => {
    const frame = window.requestAnimationFrame(() => {
      const stored = window.localStorage.getItem("bussi-docs-panel-open");
      if (stored !== null) {
        setIsSidebarOpen(stored === "true");
      } else if (window.matchMedia("(max-width: 767px)").matches) {
        setIsSidebarOpen(false);
      }
      setIsSidebarPreferenceLoaded(true);
    });

    return () => window.cancelAnimationFrame(frame);
  }, []);

  useEffect(() => {
    if (!isSidebarPreferenceLoaded) return;
    window.localStorage.setItem("bussi-docs-panel-open", String(isSidebarOpen));
  }, [isSidebarOpen, isSidebarPreferenceLoaded]);

  const readyDocuments = useMemo(() => documents.filter((document) => document.status === "ready"), [documents]);

  async function refreshDocuments() {
    setError(null);
    try {
      await loadDocuments();
    } catch (currentError) {
      setError(currentError instanceof Error ? currentError.message : "Error desconocido.");
    }
  }

  async function signOut() {
    await authClient.signOut();
    router.replace("/");
    router.refresh();
  }

  return (
    <main className="flex h-screen min-h-screen overflow-hidden bg-white text-slate-950 transition-colors duration-300 dark:bg-[#212121] dark:text-slate-50">
      {isSidebarOpen ? (
        <button
          type="button"
          className="fixed inset-0 z-30 bg-slate-950/20 backdrop-blur-[1px] md:hidden dark:bg-black/50"
          aria-label="Cerrar panel de documentos"
          onClick={() => setIsSidebarOpen(false)}
        />
      ) : null}
      <aside
        id="documents-panel"
        className={cn(
          "fixed inset-y-0 left-0 z-40 flex h-full w-80 shrink-0 flex-col overflow-hidden border-r border-[#e5e5e5] bg-[#f9f9f9] text-slate-900 shadow-2xl shadow-slate-950/10 transition-[transform,width,opacity,background-color,border-color] duration-200 ease-out md:static md:z-auto md:shadow-none dark:border-[#2f2f2f] dark:bg-[#171717] dark:text-slate-100",
          isSidebarOpen
            ? "translate-x-0 opacity-100"
            : "-translate-x-full opacity-0 md:w-0 md:translate-x-0 md:border-r-0",
        )}
      >
        <div className="flex h-14 items-center gap-3 border-b border-[#e5e5e5] px-3 dark:border-[#2f2f2f]">
          <div className="flex h-8 w-8 items-center justify-center rounded-xl border border-[#e5e5e5] bg-white text-slate-950 shadow-sm dark:border-[#2f2f2f] dark:bg-[#212121] dark:text-slate-50">
            <MessageSquareText className="h-4 w-4" aria-hidden="true" />
          </div>
          <div className="min-w-0">
            <p className="truncate text-sm font-medium">Bussi RAG</p>
            <p className="text-xs text-slate-500 dark:text-slate-400">Docs empresariales</p>
          </div>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="ml-auto h-8 w-8"
            aria-controls="documents-panel"
            aria-expanded={isSidebarOpen}
            aria-label="Cerrar panel de documentos"
            onClick={() => setIsSidebarOpen(false)}
          >
            <PanelLeftClose className="h-4 w-4" aria-hidden="true" />
          </Button>
        </div>

        <div className="flex-1 space-y-3 overflow-y-auto p-2">
          <div className="rounded-2xl border border-[#e5e5e5] bg-white p-2 transition-colors dark:border-[#2f2f2f] dark:bg-[#212121]">
            <div className="mb-2 flex items-center gap-2 px-2 pt-1 text-sm font-medium">
              <FileText className="h-4 w-4" aria-hidden="true" />
              Documentos
            </div>
            <DocumentUploader onUploaded={refreshDocuments} />
          </div>
          <DocumentList
            documents={documents}
            isLoading={isLoading}
            selectedIds={selectedIds}
            onSelectionChange={setSelectedIds}
            onDeleted={refreshDocuments}
          />
        </div>

        <div className="border-t border-[#e5e5e5] p-3 dark:border-[#2f2f2f]">
          <div className="mb-3 truncate rounded-xl bg-white px-3 py-2 text-xs text-slate-500 dark:bg-[#212121] dark:text-slate-400">
            {userEmail}
          </div>
          <div className="grid grid-cols-[1fr_auto] gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="w-full bg-white dark:border-[#2f2f2f] dark:bg-[#212121]"
              onClick={signOut}
            >
              <LogOut className="h-4 w-4" aria-hidden="true" />
              Salir
            </Button>
            <ThemeToggle className="h-9 w-9 dark:border-[#2f2f2f] dark:bg-[#212121]" />
          </div>
        </div>
      </aside>

      <section className="flex min-w-0 flex-1 flex-col">
        <div className="flex h-14 items-center justify-between border-b border-slate-200 bg-white px-4 transition-colors dark:border-[#2f2f2f] dark:bg-[#212121] md:hidden">
          <div className="flex min-w-0 items-center gap-3">
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="h-9 w-9"
              aria-controls="documents-panel"
              aria-expanded={isSidebarOpen}
              aria-label={isSidebarOpen ? "Cerrar panel de documentos" : "Abrir panel de documentos"}
              onClick={() => setIsSidebarOpen((open) => !open)}
            >
              {isSidebarOpen ? (
                <PanelLeftClose className="h-4 w-4" aria-hidden="true" />
              ) : (
                <PanelLeftOpen className="h-4 w-4" aria-hidden="true" />
              )}
            </Button>
            <div className="min-w-0">
              <p className="text-sm font-semibold">Bussi RAG</p>
              <p className="truncate text-xs text-slate-500 dark:text-slate-400">{userEmail}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <ThemeToggle className="h-9 w-9 dark:border-[#2f2f2f] dark:bg-[#212121]" />
            <Button type="button" variant="outline" size="sm" onClick={signOut}>
              Salir
            </Button>
          </div>
        </div>
        {error ? (
          <Alert variant="destructive" className="m-3">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        ) : null}
        <ChatPanel
          documents={readyDocuments}
          isSidebarOpen={isSidebarOpen}
          selectedIds={selectedIds}
          onSelectionChange={setSelectedIds}
          onToggleSidebar={() => setIsSidebarOpen((open) => !open)}
        />
      </section>
    </main>
  );
}
