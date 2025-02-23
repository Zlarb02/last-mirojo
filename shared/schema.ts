import { pgTable, text, uuid, jsonb, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: uuid("id").primaryKey().defaultRandom(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  language: text("language").default("en"),
});

export const userPreferences = pgTable("user_preferences", {
  userId: uuid("user_id")
    .primaryKey()
    .references(() => users.id, { onDelete: "cascade" }),
  themeVariant: text("theme_variant").default("classic").notNull(),
  themeMode: text("theme_mode").default("system").notNull(),
  themeColors: jsonb("theme_colors").default(
    '{"primary": null, "secondary": null}'
  ),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
  customColors: jsonb("custom_colors"),
});

export interface StatConfig {
  type: "progress" | "number" | "text";
  max?: number;
  color?: string;
}

export interface Stat {
  name: string;
  value: string | number;
  config: {
    type: "progress" | "number" | "text";
    max?: number;
    color?: string;
  };
}

export const gameStates = pgTable("game_states", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  stats: jsonb("stats").notNull().$type<Stat[]>(),
  inventory: jsonb("inventory").notNull(),
  eventLog: jsonb("event_log").notNull(),
  savedAt: text("saved_at").notNull(),
  characterName: text("character_name"),
  characterDescription: text("character_description"),
  mainQuest: jsonb("main_quest"),
  sideQuests: jsonb("side_quests").default("[]").notNull(),
});

export const insertUserSchema = createInsertSchema(users);

export interface Message {
  role: "user" | "assistant";
  content: string;
  timestamp: string;
}

export const games = pgTable("games", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  gameStateId: uuid("game_state_id")
    .notNull()
    .references(() => gameStates.id, { onDelete: "cascade" }),
  name: text("name").default("").notNull(),
  description: text("description").default(""),
  conversation: jsonb("conversation")
    .$type<{ messages: Message[]; timestamp: string }>()
    .notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export type Game = typeof games.$inferSelect;
export type NewGame = typeof games.$inferInsert;
export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type GameState = typeof gameStates.$inferSelect;
