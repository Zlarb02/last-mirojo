import {
  pgTable,
  text,
  uuid,
  jsonb,
  timestamp,
} from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: uuid("id").primaryKey().defaultRandom(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  currentGameState: jsonb("current_game_state"),
  language: text("language").default("en"),
});

export interface StatConfig {
  type: 'progress' | 'number' | 'text';
  max?: number;
  color?: string;
}

export interface Stat {
  name: string;
  value: string | number;
  config: {
    type: 'progress' | 'number' | 'text';
    max?: number;
    color?: string;
  };
}

export const gameStates = pgTable("game_states", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  stats: jsonb("stats").notNull().$type<Stat[]>(),
  inventory: jsonb("inventory").notNull(),
  eventLog: jsonb("event_log").notNull(),
  savedAt: text("saved_at").notNull(),
  characterName: text("character_name"),
  characterDescription: text("character_description"),
  mainQuest: jsonb("main_quest"),
  sideQuests: jsonb("side_quests").default('[]').notNull(), // Changed this line
});

export const insertUserSchema = createInsertSchema(users);

export interface Message {
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
}

export const games = pgTable("games", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id").references(() => users.id, {
    onDelete: "cascade",
  }),
  gameStateId: uuid("game_state_id").references(() => gameStates.id, {
    onDelete: "cascade",
  }),
  conversation: jsonb("conversation").$type<{ messages: Message[]; timestamp: string }>().notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export type Game = typeof games.$inferSelect;
export type NewGame = typeof games.$inferInsert;
export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type GameState = typeof gameStates.$inferSelect;
