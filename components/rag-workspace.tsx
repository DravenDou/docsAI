"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { FileText, LockKeyhole, LogOut, MessageSquareText, PanelLeftClose, PanelLeftOpen } from "lucide-react";
import { useRouter } from "next/navigation";

import { ChatPanel } from "@/components/chat-panel";
import { DocumentList } from "@/components/document-list";
import { DocumentUploader } from "@/components/document-uploader";
import { LanguageToggle } from "@/components/language-toggle";
import { useLanguage } from "@/components/language-provider";
import { ThemeToggle } from "@/components/theme-toggle";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { authClient } from "@/src/lib/auth-client";
import { cn } from "@/src/lib/utils";
import type { ModelAccessMode } from "@/src/rag/model-options";
import type { DocumentSummary } from "@/src/types/documents";

export function RagWorkspace({ modelAccess, userEmail }: { modelAccess: ModelAccessMode; userEmail: string }) {
  const router = useRouter();
  const { t } = useLanguage();
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
    if (!response.ok) throw new Error(body.error ?? t.workspace.loadDocumentsError);
    const nextDocuments = body.documents ?? [];
    documentsRef.current = nextDocuments;
    setDocuments(nextDocuments);
    const nextReadyIds = new Set(
      nextDocuments.filter((document) => document.status === "ready").map((document) => document.id),
    );
    setSelectedIds((current) => current.filter((id) => nextReadyIds.has(id)));
  }, [t.workspace.loadDocumentsError]);

  useEffect(() => {
    let ignore = false;

    async function run() {
      try {
        if (!ignore) setError(null);
        await loadDocuments();
      } catch (currentError) {
        if (!ignore) setError(currentError instanceof Error ? currentError.message : t.workspace.unknownError);
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
  }, [loadDocuments, t.workspace.unknownError]);

  useEffect(() => {
    const frame = window.requestAnimationFrame(() => {
      const stored = window.localStorage.getItem("docsai-docs-panel-open") ?? window.localStorage.getItem("bussi-docs-panel-open");
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
    window.localStorage.setItem("docsai-docs-panel-open", String(isSidebarOpen));
  }, [isSidebarOpen, isSidebarPreferenceLoaded]);

  const readyDocuments = useMemo(() => documents.filter((document) => document.status === "ready"), [documents]);

  async function refreshDocuments() {
    setError(null);
    try {
      await loadDocuments();
    } catch (currentError) {
      setError(currentError instanceof Error ? currentError.message : t.workspace.unknownError);
    }
  }

  async function signOut() {
    await authClient.signOut();
    router.replace("/");
    router.refresh();
  }

  return (
    <main className="flex max-h-[100dvh] min-h-[100dvh] overflow-hidden bg-app-background text-foreground transition-colors duration-300">
      {isSidebarOpen ? (
        <button
          type="button"
          className="fixed inset-0 z-30 bg-black/20 backdrop-blur-[1px] md:hidden dark:bg-black/55"
          aria-label={t.workspace.closePanel}
          onClick={() => setIsSidebarOpen(false)}
        />
      ) : null}

      <aside
        id="documents-panel"
        className={cn(
          "fixed inset-y-0 left-0 z-40 flex h-[100dvh] w-[21rem] max-w-[calc(100vw-1rem)] shrink-0 flex-col overflow-hidden border-r border-app-border bg-app-sidebar text-foreground shadow-2xl shadow-black/10 transition-[transform,width,opacity,border-color,background-color] duration-300 ease-out md:static md:z-auto md:max-w-none md:shadow-none",
          isSidebarOpen
            ? "translate-x-0 opacity-100"
            : "-translate-x-full opacity-0 md:w-0 md:translate-x-0 md:border-r-0 md:opacity-100",
        )}
      >
        <div className="flex h-14 shrink-0 items-center gap-3 border-b border-app-border px-3">
          <div className="flex size-8 items-center justify-center rounded-[var(--radius-row)] border border-app-border bg-app-surface-raised text-foreground shadow-sm">
            <MessageSquareText className="size-4" aria-hidden="true" />
          </div>
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold tracking-tight">DOCSAI</p>
            <p className="text-xs text-app-text-muted">{t.workspace.docsSubtitle}</p>
          </div>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="ml-auto size-9 rounded-full hover:bg-app-hover"
            aria-controls="documents-panel"
            aria-expanded={isSidebarOpen}
            aria-label={t.workspace.closePanel}
            onClick={() => setIsSidebarOpen(false)}
          >
            <PanelLeftClose className="size-4" aria-hidden="true" />
          </Button>
        </div>

        <div className="docsai-scrollbar min-h-0 flex-1 overflow-y-auto p-3">
          <div className="mb-3 flex items-center gap-2 px-1 text-xs font-medium uppercase tracking-[0.18em] text-app-text-muted">
            <FileText className="size-3.5" aria-hidden="true" />
            {t.workspace.documents}
          </div>
          <div className="space-y-3">
            {modelAccess === "openrouter-free" ? (
              <div className="rounded-[var(--radius-panel)] border border-app-border bg-app-muted-surface p-3 text-xs leading-5 text-app-text-muted">
                <div className="mb-1 flex items-center gap-2 font-medium text-foreground">
                  <LockKeyhole className="size-3.5" aria-hidden="true" />
                  {t.workspace.demoTitle}
                </div>
                {t.workspace.demoDescription}
              </div>
            ) : null}
            <DocumentUploader modelAccess={modelAccess} onUploaded={refreshDocuments} />
            <DocumentList
              documents={documents}
              isLoading={isLoading}
              selectedIds={selectedIds}
              onSelectionChange={setSelectedIds}
              onDeleted={refreshDocuments}
            />
          </div>
        </div>

        <div className="shrink-0 border-t border-app-border p-3">
          <div className="mb-3 truncate rounded-[var(--radius-row)] border border-app-border bg-app-surface-raised px-3 py-2 text-xs text-app-text-muted">
            {userEmail}
          </div>
          <div className="grid grid-cols-[1fr_auto_auto] gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="w-full rounded-full border-app-border bg-app-surface-raised hover:bg-app-hover"
              onClick={signOut}
            >
              <LogOut className="size-4" aria-hidden="true" />
              {t.workspace.signOut}
            </Button>
            <LanguageToggle />
            <ThemeToggle className="size-9 rounded-full border-app-border bg-app-surface-raised hover:bg-app-hover" />
          </div>
        </div>
      </aside>

      <section className="flex min-w-0 flex-1 flex-col">
        <div className="flex h-14 shrink-0 items-center justify-between border-b border-app-border bg-app-background px-3 transition-colors md:hidden">
          <div className="flex min-w-0 items-center gap-3">
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="size-9 rounded-full hover:bg-app-hover"
              aria-controls="documents-panel"
              aria-expanded={isSidebarOpen}
              aria-label={isSidebarOpen ? t.workspace.closePanel : t.workspace.openPanel}
              onClick={() => setIsSidebarOpen((open) => !open)}
            >
              {isSidebarOpen ? (
                <PanelLeftClose className="size-4" aria-hidden="true" />
              ) : (
                <PanelLeftOpen className="size-4" aria-hidden="true" />
              )}
            </Button>
            <div className="min-w-0">
              <p className="text-sm font-semibold tracking-tight">DOCSAI</p>
              <p className="truncate text-xs text-app-text-muted">{userEmail}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <ThemeToggle className="size-9 rounded-full border-app-border bg-app-surface-raised hover:bg-app-hover" />
            <LanguageToggle className="hidden sm:inline-flex" />
            <Button type="button" variant="outline" size="sm" className="rounded-full border-app-border" onClick={signOut}>
              {t.workspace.signOut}
            </Button>
          </div>
        </div>
        {error ? (
          <Alert variant="destructive" className="m-3 rounded-[var(--radius-panel)]">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        ) : null}
        <ChatPanel
          documents={readyDocuments}
          isSidebarOpen={isSidebarOpen}
          modelAccess={modelAccess}
          selectedIds={selectedIds}
          onSelectionChange={setSelectedIds}
          onToggleSidebar={() => setIsSidebarOpen((open) => !open)}
        />
      </section>
    </main>
  );
}
