import { pgTable, text, timestamp, integer } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const callLogs = pgTable("call_logs", {
  id: text("id").primaryKey(),
  userId: text("user_id").notNull(),
  callId: text("call_id").notNull(),
  language: text("language").notNull().default("fr"),
  agentId: text("agent_id"),
  durationSeconds: integer("duration_seconds"),
  status: text("status").default("initiated"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertCallLogSchema = createInsertSchema(callLogs);
export type InsertCallLog = z.infer<typeof insertCallLogSchema>;
export type CallLog = typeof callLogs.$inferSelect;
