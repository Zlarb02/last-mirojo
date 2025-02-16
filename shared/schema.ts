import { pgTable, text, serial, integer, boolean, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  currentGameState: jsonb("current_game_state"),
  language: text("language").default("en"),
});

export const gameStates = pgTable("game_states", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  stats: jsonb("stats").notNull(),
  inventory: jsonb("inventory").notNull(),
  eventLog: jsonb("event_log").notNull(),
  savedAt: text("saved_at").notNull(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
  language: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type GameState = typeof gameStates.$inferSelect;
