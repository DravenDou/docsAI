export const languages = ["en", "es"] as const;
export type Language = (typeof languages)[number];

export const languageLabels: Record<Language, string> = {
  es: "ES",
  en: "EN",
};

export function isLanguage(value: string | null | undefined): value is Language {
  return value === "es" || value === "en";
}

export function normalizeLanguage(value: string | null | undefined): Language {
  if (!value) return "en";
  const normalized = value.toLowerCase();
  if (normalized.startsWith("en")) return "en";
  if (normalized.startsWith("es")) return "es";
  return "en";
}

export const translations = {
  es: {
    common: {
      language: "Idioma",
      switchLanguage: "Cambiar idioma",
      spanish: "Español",
      english: "Inglés",
      themeToLight: "Cambiar a modo claro",
      themeToDark: "Cambiar a modo oscuro",
      openRouterFree: "OpenRouter free",
    },
    landing: {
      tagline: "Asistente RAG open source",
      badgeProfessional: "RAG profesional",
      badgeOpenSource: "Open source",
      badgeEnterpriseDocs: "Docs empresariales",
      title: "Chatea con tus documentos. Recibe respuestas citadas.",
      description:
        "DOCSAI es un RAG profesional para consultar documentos empresariales con respuestas citadas y contexto recuperado. Usa Next.js, Vercel AI SDK, LiteParse, PostgreSQL/pgvector, Graphile Worker y Better Auth.",
      enterDemo: "Entrar al demo",
      viewRepo: "Ver repositorio",
      highlights: {
        parse: {
          title: "Parseo confiable",
          description: "LiteParse extrae contenido por página para mantener evidencia rastreable.",
        },
        citations: {
          title: "RAG con citas",
          description: "Cada respuesta importante referencia documento, página y chunk.",
        },
        pgvector: {
          title: "pgvector local",
          description: "PostgreSQL, Drizzle y búsqueda vectorial sin servicios externos innecesarios.",
        },
        privateVps: {
          title: "VPS privado",
          description: "Archivos y base de datos protegidos, sin exponer recursos internos.",
        },
      },
    },
    auth: {
      title: "Iniciar sesión",
      description: "El registro público está cerrado. Usa tu cuenta de prueba para revisar el demo.",
      email: "Email",
      password: "Contraseña",
      submit: "Entrar",
      pending: "Entrando...",
      signInError: "No se pudo iniciar sesión.",
    },
    workspace: {
      docsSubtitle: "Docs empresariales",
      documents: "Documentos",
      demoTitle: "Demo público",
      demoDescription: "Esta cuenta usa solo modelos gratuitos de OpenRouter para chat y embeddings.",
      signOut: "Salir",
      closePanel: "Cerrar panel de documentos",
      openPanel: "Abrir panel de documentos",
      loadDocumentsError: "No se pudieron cargar los documentos.",
      unknownError: "Error desconocido.",
    },
    chat: {
      title: "Chat con documentos",
      contextPrefix: "Contexto",
      noSelection: "Sin selección: buscará en todos tus documentos listos.",
      useAll: "Usar todos",
      readyTitle: "Tus documentos están listos",
      emptyTitle: "Empieza con tu primer documento",
      readyDescription: "Pregunta sobre todos tus documentos listos o selecciona fuentes concretas desde el panel lateral.",
      emptyDescription: "Sube un PDF, espera el procesamiento y conversa con respuestas basadas solo en contexto recuperado.",
      demoFree: "Demo free",
      firstStep: "El primer paso vive en el panel de documentos.",
      panelOpen: "Panel abierto",
      openPanel: "Abrir panel",
      documentReadySingular: "documento listo para consultar.",
      documentReadyPlural: "documentos listos para consultar.",
      suggestions: [
        "Resume el documento y cita las páginas clave",
        "Extrae riesgos, decisiones y próximos pasos",
        "¿Qué dice sobre costos, fechas o responsabilidades?",
      ],
      onboarding: [
        {
          title: "Sube un PDF",
          description: "El archivo queda en storage local privado y se procesa en segundo plano.",
        },
        {
          title: "Espera el estado Listo",
          description: "LiteParse extrae páginas, DOCSAI crea chunks y pgvector guarda embeddings.",
        },
        {
          title: "Pregunta con citas",
          description: "Cada respuesta debe citar fuente, página y chunk para que puedas auditarla.",
        },
      ],
      uploadRequired: "Sube al menos un PDF y espera a que esté listo antes de preguntar.",
      placeholder: "Pregunta algo sobre tus documentos...",
      keyboardHint: "Enter para enviar. Shift+Enter nueva línea",
      stop: "Detener",
      send: "Enviar",
      disclaimer: "DOCSAI puede equivocarse; verifica documento, página y chunk en las citas.",
      citationsDetected: "citas detectadas",
      citedInAnswer: "citado en la respuesta",
      toolbar: "Respuesta basada en contexto recuperado. Verifica citas [S].",
      thinking: "Pensando",
    },
    uploader: {
      title: "Subir PDF",
      description: "Storage local privado, procesamiento con citas por página y chunk.",
      demoWarning: "Modo demo: solo está habilitado el embedding gratuito de OpenRouter.",
      legend: "Embeddings para este documento",
      selectPdf: "Selecciona un PDF primero.",
      uploadFailed: "No se pudo subir el documento.",
      queued: "Documento en cola. El worker lo procesará en segundo plano.",
      unknownUpload: "Error desconocido al subir.",
      removeFile: "Quitar archivo",
      uploading: "Subiendo...",
      submit: "Subir y procesar",
      embeddingOptions: {
        openai: {
          label: "OpenAI",
          shortLabel: "OpenAI",
          description: "text-embedding-3-small, estable y recomendado para el demo.",
        },
        openrouter: {
          label: "OpenRouter gratis",
          shortLabel: "OpenRouter free",
          description: "NVIDIA Llama Nemotron Embed VL 1B V2 vía OpenRouter.",
        },
      },
    },
    documents: {
      library: "Biblioteca",
      subtitle: "Selecciona documentos listos para acotar el contexto.",
      loading: "Cargando documentos...",
      emptyTitle: "Tu biblioteca está vacía",
      emptyDescription: "Sube un PDF y DOCSAI lo convertirá en contexto consultable con citas.",
      hints: [
        "Sube un PDF desde el módulo superior.",
        "Espera a que aparezca como Listo.",
        "Pregunta desde el chat y valida las fuentes [S].",
      ],
      status: {
        queued: "En cola",
        processing: "Procesando",
        ready: "Listo",
        failed: "Falló",
      },
      selectDocument: "Seleccionar",
      pages: "págs",
      chunks: "chunks",
      delete: "Borrar",
      deleteFailed: "No se pudo borrar el documento.",
    },
  },
  en: {
    common: {
      language: "Language",
      switchLanguage: "Switch language",
      spanish: "Spanish",
      english: "English",
      themeToLight: "Switch to light mode",
      themeToDark: "Switch to dark mode",
      openRouterFree: "OpenRouter free",
    },
    landing: {
      tagline: "Open source RAG assistant",
      badgeProfessional: "Professional RAG",
      badgeOpenSource: "Open source",
      badgeEnterpriseDocs: "Enterprise docs",
      title: "Chat with your documents. Get cited answers.",
      description:
        "DOCSAI is a professional RAG for querying enterprise documents with cited answers and retrieved context. It uses Next.js, Vercel AI SDK, LiteParse, PostgreSQL/pgvector, Graphile Worker, and Better Auth.",
      enterDemo: "Open demo",
      viewRepo: "View repository",
      highlights: {
        parse: {
          title: "Reliable parsing",
          description: "LiteParse extracts content page by page to keep evidence traceable.",
        },
        citations: {
          title: "Cited RAG",
          description: "Every important answer references document, page, and chunk.",
        },
        pgvector: {
          title: "Local pgvector",
          description: "PostgreSQL, Drizzle, and vector search without unnecessary external services.",
        },
        privateVps: {
          title: "Private VPS",
          description: "Files and database stay protected without exposing internal resources.",
        },
      },
    },
    auth: {
      title: "Sign in",
      description: "Public registration is closed. Use your test account to review the demo.",
      email: "Email",
      password: "Password",
      submit: "Sign in",
      pending: "Signing in...",
      signInError: "Could not sign in.",
    },
    workspace: {
      docsSubtitle: "Enterprise docs",
      documents: "Documents",
      demoTitle: "Public demo",
      demoDescription: "This account only uses free OpenRouter models for chat and embeddings.",
      signOut: "Sign out",
      closePanel: "Close documents panel",
      openPanel: "Open documents panel",
      loadDocumentsError: "Could not load documents.",
      unknownError: "Unknown error.",
    },
    chat: {
      title: "Document chat",
      contextPrefix: "Context",
      noSelection: "No selection: it will search all your ready documents.",
      useAll: "Use all",
      readyTitle: "Your documents are ready",
      emptyTitle: "Start with your first document",
      readyDescription: "Ask across all ready documents or select specific sources from the sidebar.",
      emptyDescription: "Upload a PDF, wait for processing, and chat with answers grounded only in retrieved context.",
      demoFree: "Free demo",
      firstStep: "The first step lives in the documents panel.",
      panelOpen: "Panel open",
      openPanel: "Open panel",
      documentReadySingular: "document ready to query.",
      documentReadyPlural: "documents ready to query.",
      suggestions: [
        "Summarize the document and cite key pages",
        "Extract risks, decisions, and next steps",
        "What does it say about costs, dates, or responsibilities?",
      ],
      onboarding: [
        {
          title: "Upload a PDF",
          description: "The file stays in private local storage and is processed in the background.",
        },
        {
          title: "Wait for Ready",
          description: "LiteParse extracts pages, DOCSAI creates chunks, and pgvector stores embeddings.",
        },
        {
          title: "Ask with citations",
          description: "Every answer should cite source, page, and chunk so you can audit it.",
        },
      ],
      uploadRequired: "Upload at least one PDF and wait until it is ready before asking.",
      placeholder: "Ask something about your documents...",
      keyboardHint: "Enter to send. Shift+Enter for a new line",
      stop: "Stop",
      send: "Send",
      disclaimer: "DOCSAI can make mistakes; verify document, page, and chunk in the citations.",
      citationsDetected: "citations detected",
      citedInAnswer: "cited in the answer",
      toolbar: "Answer based on retrieved context. Verify [S] citations.",
      thinking: "Thinking",
    },
    uploader: {
      title: "Upload PDF",
      description: "Private local storage, processed with page and chunk citations.",
      demoWarning: "Demo mode: only the free OpenRouter embedding is enabled.",
      legend: "Embeddings for this document",
      selectPdf: "Select a PDF first.",
      uploadFailed: "Could not upload the document.",
      queued: "Document queued. The worker will process it in the background.",
      unknownUpload: "Unknown upload error.",
      removeFile: "Remove file",
      uploading: "Uploading...",
      submit: "Upload and process",
      embeddingOptions: {
        openai: {
          label: "OpenAI",
          shortLabel: "OpenAI",
          description: "text-embedding-3-small, stable and recommended for the demo.",
        },
        openrouter: {
          label: "Free OpenRouter",
          shortLabel: "OpenRouter free",
          description: "NVIDIA Llama Nemotron Embed VL 1B V2 through OpenRouter.",
        },
      },
    },
    documents: {
      library: "Library",
      subtitle: "Select ready documents to narrow the context.",
      loading: "Loading documents...",
      emptyTitle: "Your library is empty",
      emptyDescription: "Upload a PDF and DOCSAI will turn it into cited, searchable context.",
      hints: [
        "Upload a PDF from the module above.",
        "Wait until it appears as Ready.",
        "Ask from the chat and verify the [S] sources.",
      ],
      status: {
        queued: "Queued",
        processing: "Processing",
        ready: "Ready",
        failed: "Failed",
      },
      selectDocument: "Select",
      pages: "pages",
      chunks: "chunks",
      delete: "Delete",
      deleteFailed: "Could not delete the document.",
    },
  },
} as const;

export type Dictionary = (typeof translations)[Language];
