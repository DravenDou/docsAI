import { relations, sql } from "drizzle-orm";
import {
  boolean,
  index,
  integer,
  jsonb,
  pgEnum,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
  vector,
} from "drizzle-orm/pg-core";

export const documentStatus = pgEnum("document_status", ["queued", "processing", "ready", "failed"]);
export const providerName = pgEnum("provider_name", ["openai", "openrouter"]);

export const user = pgTable("user", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  emailVerified: boolean("emailVerified").notNull().default(false),
  image: text("image"),
  createdAt: timestamp("createdAt", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updatedAt", { withTimezone: true }).notNull().defaultNow(),
});

export const session = pgTable(
  "session",
  {
    id: text("id").primaryKey(),
    expiresAt: timestamp("expiresAt", { withTimezone: true }).notNull(),
    token: text("token").notNull().unique(),
    createdAt: timestamp("createdAt", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updatedAt", { withTimezone: true }).notNull().defaultNow(),
    ipAddress: text("ipAddress"),
    userAgent: text("userAgent"),
    userId: text("userId").notNull().references(() => user.id, { onDelete: "cascade" }),
  },
  (table) => [index("session_user_id_idx").on(table.userId)],
);

export const account = pgTable(
  "account",
  {
    id: text("id").primaryKey(),
    accountId: text("accountId").notNull(),
    providerId: text("providerId").notNull(),
    userId: text("userId").notNull().references(() => user.id, { onDelete: "cascade" }),
    accessToken: text("accessToken"),
    refreshToken: text("refreshToken"),
    idToken: text("idToken"),
    accessTokenExpiresAt: timestamp("accessTokenExpiresAt", { withTimezone: true }),
    refreshTokenExpiresAt: timestamp("refreshTokenExpiresAt", { withTimezone: true }),
    scope: text("scope"),
    password: text("password"),
    createdAt: timestamp("createdAt", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updatedAt", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [index("account_user_id_idx").on(table.userId)],
);

export const verification = pgTable(
  "verification",
  {
    id: text("id").primaryKey(),
    identifier: text("identifier").notNull(),
    value: text("value").notNull(),
    expiresAt: timestamp("expiresAt", { withTimezone: true }).notNull(),
    createdAt: timestamp("createdAt", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updatedAt", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [index("verification_identifier_idx").on(table.identifier)],
);

export const documents = pgTable(
  "documents",
  {
    id: text("id").primaryKey(),
    userId: text("userId").notNull().references(() => user.id, { onDelete: "cascade" }),
    name: text("name").notNull(),
    originalName: text("originalName").notNull(),
    mimeType: text("mimeType").notNull(),
    size: integer("size").notNull(),
    storagePath: text("storagePath").notNull(),
    status: documentStatus("status").notNull().default("queued"),
    errorMessage: text("errorMessage"),
    embeddingProvider: providerName("embeddingProvider").notNull().default("openai"),
    embeddingModel: text("embeddingModel").notNull().default("text-embedding-3-small"),
    embeddingDimensions: integer("embeddingDimensions").notNull().default(1536),
    createdAt: timestamp("createdAt", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updatedAt", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [index("documents_user_id_idx").on(table.userId), index("documents_status_idx").on(table.status)],
);

export const documentPages = pgTable(
  "document_pages",
  {
    id: text("id").primaryKey(),
    documentId: text("documentId").notNull().references(() => documents.id, { onDelete: "cascade" }),
    pageNumber: integer("pageNumber").notNull(),
    width: integer("width").notNull(),
    height: integer("height").notNull(),
    text: text("text").notNull(),
    createdAt: timestamp("createdAt", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    index("document_pages_document_id_idx").on(table.documentId),
    uniqueIndex("document_pages_document_page_idx").on(table.documentId, table.pageNumber),
  ],
);

export const chunks = pgTable(
  "chunks",
  {
    id: text("id").primaryKey(),
    documentId: text("documentId").notNull().references(() => documents.id, { onDelete: "cascade" }),
    pageNumber: integer("pageNumber").notNull(),
    chunkIndex: integer("chunkIndex").notNull(),
    text: text("text").notNull(),
    embedding: vector("embedding", { dimensions: 1536 }).notNull(),
    metadata: jsonb("metadata").$type<Record<string, unknown>>().notNull().default(sql`'{}'::jsonb`),
    createdAt: timestamp("createdAt", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    index("chunks_document_id_idx").on(table.documentId),
    uniqueIndex("chunks_document_chunk_idx").on(table.documentId, table.chunkIndex),
    index("chunks_embedding_hnsw_idx").using("hnsw", table.embedding.op("vector_cosine_ops")),
  ],
);

export const documentsRelations = relations(documents, ({ one, many }) => ({
  owner: one(user, { fields: [documents.userId], references: [user.id] }),
  pages: many(documentPages),
  chunks: many(chunks),
}));

export const documentPagesRelations = relations(documentPages, ({ one }) => ({
  document: one(documents, { fields: [documentPages.documentId], references: [documents.id] }),
}));

export const chunksRelations = relations(chunks, ({ one }) => ({
  document: one(documents, { fields: [chunks.documentId], references: [documents.id] }),
}));
