CREATE TYPE "public"."document_status" AS ENUM('queued', 'processing', 'ready', 'failed');--> statement-breakpoint
CREATE TYPE "public"."provider_name" AS ENUM('openai', 'openrouter');--> statement-breakpoint
CREATE TABLE "account" (
	"id" text PRIMARY KEY NOT NULL,
	"accountId" text NOT NULL,
	"providerId" text NOT NULL,
	"userId" text NOT NULL,
	"accessToken" text,
	"refreshToken" text,
	"idToken" text,
	"accessTokenExpiresAt" timestamp with time zone,
	"refreshTokenExpiresAt" timestamp with time zone,
	"scope" text,
	"password" text,
	"createdAt" timestamp with time zone DEFAULT now() NOT NULL,
	"updatedAt" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "chunks" (
	"id" text PRIMARY KEY NOT NULL,
	"documentId" text NOT NULL,
	"pageNumber" integer NOT NULL,
	"chunkIndex" integer NOT NULL,
	"text" text NOT NULL,
	"embedding" vector(1536) NOT NULL,
	"metadata" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"createdAt" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "document_pages" (
	"id" text PRIMARY KEY NOT NULL,
	"documentId" text NOT NULL,
	"pageNumber" integer NOT NULL,
	"width" integer NOT NULL,
	"height" integer NOT NULL,
	"text" text NOT NULL,
	"createdAt" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "documents" (
	"id" text PRIMARY KEY NOT NULL,
	"userId" text NOT NULL,
	"name" text NOT NULL,
	"originalName" text NOT NULL,
	"mimeType" text NOT NULL,
	"size" integer NOT NULL,
	"storagePath" text NOT NULL,
	"status" "document_status" DEFAULT 'queued' NOT NULL,
	"errorMessage" text,
	"embeddingProvider" "provider_name" DEFAULT 'openai' NOT NULL,
	"embeddingModel" text DEFAULT 'text-embedding-3-small' NOT NULL,
	"embeddingDimensions" integer DEFAULT 1536 NOT NULL,
	"createdAt" timestamp with time zone DEFAULT now() NOT NULL,
	"updatedAt" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "session" (
	"id" text PRIMARY KEY NOT NULL,
	"expiresAt" timestamp with time zone NOT NULL,
	"token" text NOT NULL,
	"createdAt" timestamp with time zone DEFAULT now() NOT NULL,
	"updatedAt" timestamp with time zone DEFAULT now() NOT NULL,
	"ipAddress" text,
	"userAgent" text,
	"userId" text NOT NULL,
	CONSTRAINT "session_token_unique" UNIQUE("token")
);
--> statement-breakpoint
CREATE TABLE "user" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"email" text NOT NULL,
	"emailVerified" boolean DEFAULT false NOT NULL,
	"image" text,
	"createdAt" timestamp with time zone DEFAULT now() NOT NULL,
	"updatedAt" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "user_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE "verification" (
	"id" text PRIMARY KEY NOT NULL,
	"identifier" text NOT NULL,
	"value" text NOT NULL,
	"expiresAt" timestamp with time zone NOT NULL,
	"createdAt" timestamp with time zone DEFAULT now() NOT NULL,
	"updatedAt" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "account" ADD CONSTRAINT "account_userId_user_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "chunks" ADD CONSTRAINT "chunks_documentId_documents_id_fk" FOREIGN KEY ("documentId") REFERENCES "public"."documents"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "document_pages" ADD CONSTRAINT "document_pages_documentId_documents_id_fk" FOREIGN KEY ("documentId") REFERENCES "public"."documents"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "documents" ADD CONSTRAINT "documents_userId_user_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "session" ADD CONSTRAINT "session_userId_user_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "account_user_id_idx" ON "account" USING btree ("userId");--> statement-breakpoint
CREATE INDEX "chunks_document_id_idx" ON "chunks" USING btree ("documentId");--> statement-breakpoint
CREATE UNIQUE INDEX "chunks_document_chunk_idx" ON "chunks" USING btree ("documentId","chunkIndex");--> statement-breakpoint
CREATE INDEX "chunks_embedding_hnsw_idx" ON "chunks" USING hnsw ("embedding" vector_cosine_ops);--> statement-breakpoint
CREATE INDEX "document_pages_document_id_idx" ON "document_pages" USING btree ("documentId");--> statement-breakpoint
CREATE UNIQUE INDEX "document_pages_document_page_idx" ON "document_pages" USING btree ("documentId","pageNumber");--> statement-breakpoint
CREATE INDEX "documents_user_id_idx" ON "documents" USING btree ("userId");--> statement-breakpoint
CREATE INDEX "documents_status_idx" ON "documents" USING btree ("status");--> statement-breakpoint
CREATE INDEX "session_user_id_idx" ON "session" USING btree ("userId");--> statement-breakpoint
CREATE INDEX "verification_identifier_idx" ON "verification" USING btree ("identifier");