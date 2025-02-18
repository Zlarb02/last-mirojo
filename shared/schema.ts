import { pgTable, text, serial, integer, boolean, jsonb, timestamp } from "drizzle-orm/pg-core";
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

export const games = pgTable("games", {
  id: serial("id").primaryKey(),
  user_id: integer("user_id").references(() => users.id, { 
    onDelete: "cascade", 
    onUpdate: "cascade" 
  }),
  game_state_id: integer("game_state_id").references(() => gameStates.id, { 
    onDelete: "cascade" 
  }),
  conversation: jsonb("conversation").notNull(),
  created_at: timestamp("created_at").defaultNow(),
  updated_at: timestamp("updated_at").defaultNow(),
});

export type Game = typeof games.$inferSelect;
export type NewGame = typeof games.$inferInsert;

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type GameState = typeof gameStates.$inferSelect;
