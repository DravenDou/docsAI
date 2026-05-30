# Bussi RAG Portfolio

Asistente RAG open source para documentos empresariales: subes PDFs, se parsean con LiteParse, se chunkearán, se generan embeddings cloud y el chat responde con citas.

## Stack

- Next.js + TypeScript + Tailwind CSS + componentes estilo shadcn/ui
- Vercel AI SDK para chat streaming y providers LLM
- LiteParse para parsear PDFs
- Drizzle ORM + PostgreSQL/pgvector
- Graphile Worker para ingestión en background
- Better Auth con email/password
- Embeddings cloud: OpenAI u OpenRouter

No usa LangChain, LangGraph, Redis/BullMQ, Qdrant, S3 externo ni microservicios innecesarios.

## Seguridad local por defecto

- `pnpm dev` y `pnpm start` escuchan en `127.0.0.1`.
- `compose.yml` publica PostgreSQL solo en `127.0.0.1:5432`.
- Los archivos subidos se guardan en `.data/uploads` con permisos privados.
- `.env` no debe commitearse.
- npm/pnpm lifecycle scripts están desactivados mediante `.npmrc` y config global en este VPS.

## Requisitos

- Node.js 22+
- pnpm 11+
- Docker/Compose para PostgreSQL local, o PostgreSQL 17 con extensión pgvector
- API key de OpenAI u OpenRouter

## Setup local

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

Abre la app solo desde el túnel/host local que autorices. Por defecto Next queda en `http://127.0.0.1:3000`.

## Flujo RAG

1. El usuario sube un PDF autenticado.
2. La API valida tipo/tamaño, guarda el archivo privado y encola `ingest-document`.
3. Graphile Worker usa LiteParse para extraer texto por página.
4. El chunker propio crea chunks con metadatos.
5. El provider cloud seleccionado por documento genera embeddings de 1536 dimensiones.
6. pgvector recupera chunks por similitud cosine.
7. El prompt del chat exige responder solo con contexto y citar fuentes `[S1]`, donde cada fuente incluye documento, página y chunk.

## Variables relevantes

- `EMBEDDINGS_PROVIDER=openai|openrouter`
- `EMBEDDINGS_MODEL=text-embedding-3-small` por defecto
- Selector de upload: OpenAI `text-embedding-3-small` u OpenRouter `nvidia/llama-nemotron-embed-vl-1b-v2:free`
- `CHAT_PROVIDER=openai|openrouter`
- `CHAT_MODEL=openrouter/free` por defecto para el router gratuito de OpenRouter
- `MAX_UPLOAD_BYTES` para límite de PDF
- `MAX_PARSE_PAGES` para acotar parsing

> Nota: v1 fija pgvector en 1536 dimensiones. Para `text-embedding-3-large` habría que migrar schema y reindexar.

## Scripts

- `pnpm dev` — servidor Next local en 127.0.0.1
- `pnpm worker` — worker local de Graphile
- `pnpm db:generate` — genera migraciones Drizzle
- `pnpm db:migrate` — crea extensión vector, aplica migraciones Drizzle y Graphile
- `pnpm typecheck` / `pnpm lint` / `pnpm test` / `pnpm build`

## Roadmap de portfolio

- Soporte adicional para DOCX cuando el entorno tenga LibreOffice aislado.
- Reindex controlado si se cambia de modelo/dimensiones de embeddings.
- Pantalla de fuentes recuperadas junto a cada respuesta.
- Tests E2E con Playwright cuando haya dominio/HTTPS autorizado.
