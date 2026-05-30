# DOCSAI

Open-source RAG assistant for business documents. Upload PDFs, parse them with LiteParse, generate cloud embeddings, and chat with answers grounded in document/page/chunk citations.

> Español abajo.

## English

### What it does

DOCSAI is a portfolio-ready document chat app:

1. Authenticated users upload PDF files.
2. The app validates and stores files privately.
3. A background worker parses pages with LiteParse.
4. A simple custom chunker creates citation-ready chunks.
5. OpenAI or OpenRouter generates 1536-dimensional embeddings.
6. PostgreSQL/pgvector retrieves relevant chunks.
7. The chat answers only from retrieved context and cites sources like `[S1]`.

### Stack

- Next.js + TypeScript + Tailwind CSS + shadcn/ui-style components
- Vercel AI SDK for streaming chat and provider integration
- LiteParse for PDF parsing
- Drizzle ORM + PostgreSQL/pgvector
- Graphile Worker for background ingestion
- Better Auth with email/password
- Cloud embeddings: OpenAI or OpenRouter

Intentionally not used: LangChain, LangGraph, Redis/BullMQ, Qdrant, external S3/UploadThing, or unnecessary microservices.

### Secure local defaults

- `pnpm dev` and `pnpm start` listen on `127.0.0.1`.
- `compose.yml` publishes PostgreSQL only on `127.0.0.1:5432`.
- Uploaded files are stored privately under `.data/uploads`.
- `.env` must never be committed.
- npm/pnpm lifecycle scripts are disabled through `.npmrc`.

### Requirements

- Node.js 22+
- pnpm 11+
- Docker/Compose for local PostgreSQL, or PostgreSQL 17 with pgvector
- OpenAI or OpenRouter API key

### Local setup

```bash
cp .env.example .env
# edit .env and configure BETTER_AUTH_SECRET + OPENAI_API_KEY or OPENROUTER_API_KEY

docker compose up -d postgres
pnpm db:generate
pnpm db:migrate
pnpm dev
```

Run the worker in another terminal:

```bash
pnpm worker
```

By default, the app is available only at `http://127.0.0.1:3000`.

### Relevant environment variables

| Variable | Purpose |
| --- | --- |
| `EMBEDDINGS_PROVIDER` | `openai` or `openrouter` |
| `EMBEDDINGS_MODEL` | Default: `text-embedding-3-small` |
| `CHAT_PROVIDER` | `openai` or `openrouter` |
| `CHAT_MODEL` | Default: `openrouter/free` |
| `MAX_UPLOAD_BYTES` | PDF upload size limit |
| `MAX_PARSE_PAGES` | Maximum PDF pages to parse |
| `ALLOW_SIGN_UP` | Keep `false` for closed demos |

> v1 fixes pgvector at 1536 dimensions. Larger embedding models require a schema migration and reindex.

### Scripts

- `pnpm dev` — Next.js server on `127.0.0.1`
- `pnpm worker` — Graphile Worker process
- `pnpm db:generate` — generate Drizzle migrations
- `pnpm db:migrate` — create vector extension and apply migrations
- `pnpm typecheck` / `pnpm lint` / `pnpm test` / `pnpm build`

---

## Español

### Qué hace

DOCSAI es una app de chat con documentos lista para portafolio:

1. Los usuarios autenticados suben PDFs.
2. La app valida y guarda los archivos de forma privada.
3. Un worker en segundo plano parsea páginas con LiteParse.
4. Un chunker propio crea fragmentos listos para citar.
5. OpenAI u OpenRouter generan embeddings de 1536 dimensiones.
6. PostgreSQL/pgvector recupera chunks relevantes.
7. El chat responde solo con contexto recuperado y cita fuentes como `[S1]`.

### Stack

- Next.js + TypeScript + Tailwind CSS + componentes estilo shadcn/ui
- Vercel AI SDK para chat streaming e integración de providers
- LiteParse para parsear PDFs
- Drizzle ORM + PostgreSQL/pgvector
- Graphile Worker para ingestión en background
- Better Auth con email/password
- Embeddings cloud: OpenAI u OpenRouter

Intencionalmente no usa: LangChain, LangGraph, Redis/BullMQ, Qdrant, S3/UploadThing externo ni microservicios innecesarios.

### Seguridad local por defecto

- `pnpm dev` y `pnpm start` escuchan en `127.0.0.1`.
- `compose.yml` publica PostgreSQL solo en `127.0.0.1:5432`.
- Los archivos subidos se guardan de forma privada en `.data/uploads`.
- `.env` nunca debe commitearse.
- Los lifecycle scripts de npm/pnpm están desactivados con `.npmrc`.

### Requisitos

- Node.js 22+
- pnpm 11+
- Docker/Compose para PostgreSQL local, o PostgreSQL 17 con pgvector
- API key de OpenAI u OpenRouter

### Setup local

```bash
cp .env.example .env
# edita .env y configura BETTER_AUTH_SECRET + OPENAI_API_KEY u OPENROUTER_API_KEY

docker compose up -d postgres
pnpm db:generate
pnpm db:migrate
pnpm dev
```

En otra terminal:

```bash
pnpm worker
```

Por defecto, la app queda disponible solo en `http://127.0.0.1:3000`.

### Variables relevantes

| Variable | Uso |
| --- | --- |
| `EMBEDDINGS_PROVIDER` | `openai` u `openrouter` |
| `EMBEDDINGS_MODEL` | Por defecto: `text-embedding-3-small` |
| `CHAT_PROVIDER` | `openai` u `openrouter` |
| `CHAT_MODEL` | Por defecto: `openrouter/free` |
| `MAX_UPLOAD_BYTES` | Límite de tamaño para PDFs |
| `MAX_PARSE_PAGES` | Máximo de páginas PDF a parsear |
| `ALLOW_SIGN_UP` | Mantener `false` para demos cerrados |

> v1 fija pgvector en 1536 dimensiones. Modelos de embeddings más grandes requieren migración de schema y reindexado.

### Scripts

- `pnpm dev` — servidor Next.js en `127.0.0.1`
- `pnpm worker` — proceso de Graphile Worker
- `pnpm db:generate` — genera migraciones Drizzle
- `pnpm db:migrate` — crea la extensión vector y aplica migraciones
- `pnpm typecheck` / `pnpm lint` / `pnpm test` / `pnpm build`
