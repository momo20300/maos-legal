import { pgTable, text, timestamp, numeric, serial, integer } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const userBalance = pgTable("user_balance", {
  userId: text("user_id").primaryKey(),
  balanceMad: numeric("balance_mad", { precision: 10, scale: 2 }).notNull().default("0"),
  freeCreditsRemainingMad: numeric("free_credits_remaining_mad", { precision: 10, scale: 2 }).notNull().default("100"),
  totalCallMinutes: integer("total_call_minutes").notNull().default(0),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const balanceTransactions = pgTable("balance_transactions", {
  id: serial("id").primaryKey(),
  userId: text("user_id").notNull(),
  amountMad: numeric("amount_mad", { precision: 10, scale: 2 }).notNull(),
  type: text("type").notNull(),
  description: text("description").notNull(),
  callId: text("call_id"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertUserBalanceSchema = createInsertSchema(userBalance);
export type InsertUserBalance = z.infer<typeof insertUserBalanceSchema>;
export type UserBalance = typeof userBalance.$inferSelect;

export const insertBalanceTransactionSchema = createInsertSchema(balanceTransactions);
export type InsertBalanceTransaction = z.infer<typeof insertBalanceTransactionSchema>;
export type BalanceTransaction = typeof balanceTransactions.$inferSelect;
