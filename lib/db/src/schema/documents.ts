import { pgTable, serial, text, integer, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";
import { conversations } from "./conversations";

export const documentArchive = pgTable("document_archive", {
  id: serial("id").primaryKey(),
  userId: text("user_id").notNull(),
  conversationId: integer("conversation_id")
    .references(() => conversations.id, { onDelete: "cascade" }),
  docNumber: integer("doc_number").notNull(),
  title: text("title").notNull(),
  content: text("content").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

export const insertDocumentArchiveSchema = createInsertSchema(documentArchive).omit({
  id: true,
  createdAt: true,
});

export type DocumentArchive = typeof documentArchive.$inferSelect;
export type InsertDocumentArchive = z.infer<typeof insertDocumentArchiveSchema>;
