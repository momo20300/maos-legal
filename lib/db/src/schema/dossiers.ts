import { integer, pgTable, serial, text, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const dossiers = pgTable("dossiers", {
  id: serial("id").primaryKey(),
  userId: text("user_id").notNull(),
  name: text("name").notNull(),
  description: text("description"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

export const dossierItems = pgTable("dossier_items", {
  id: serial("id").primaryKey(),
  dossierId: integer("dossier_id")
    .notNull()
    .references(() => dossiers.id, { onDelete: "cascade" }),
  itemType: text("item_type").notNull(),
  conversationId: integer("conversation_id"),
  addedAt: timestamp("added_at", { withTimezone: true }).defaultNow().notNull(),
});

export const insertDossierSchema = createInsertSchema(dossiers).omit({ id: true, createdAt: true });
export const insertDossierItemSchema = createInsertSchema(dossierItems).omit({ id: true, addedAt: true });

export type Dossier = typeof dossiers.$inferSelect;
export type InsertDossier = z.infer<typeof insertDossierSchema>;
export type DossierItem = typeof dossierItems.$inferSelect;
export type InsertDossierItem = z.infer<typeof insertDossierItemSchema>;
