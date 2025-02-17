import { User, InsertUser, GameState } from "@shared/schema";
import { db, users, gameStates } from "./db";
import { eq } from "drizzle-orm";
import session from "express-session";
import connectPg from "connect-pg-simple";

const PostgresSessionStore = connectPg(session);

export interface IStorage {
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateGameState(userId: number, gameState: Partial<GameState>): Promise<void>;
  getGameState(userId: number): Promise<GameState | undefined>;
  sessionStore: session.Store;
}

export class DatabaseStorage implements IStorage {
  public sessionStore: session.Store;

  constructor() {
    this.sessionStore = new PostgresSessionStore({
      conString: process.env.DATABASE_URL, // 🔥 Remplace `pool` par `conString`
      createTableIfMissing: true,
    });
  }

  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.username, username));
    return user;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values({
        ...insertUser,
        currentGameState: null,
        language: insertUser.language || "en",
      })
      .returning();
    return user;
  }

  async updateGameState(
    userId: number,
    gameState: Partial<GameState>,
  ): Promise<void> {
    const [existing] = await db
      .select()
      .from(gameStates)
      .where(eq(gameStates.userId, userId));

    if (existing) {
      await db
        .update(gameStates)
        .set({
          ...gameState,
          savedAt: new Date().toISOString(),
        })
        .where(eq(gameStates.userId, userId));
    } else {
      await db.insert(gameStates).values({
        userId,
        stats: gameState.stats || {},
        inventory: gameState.inventory || {},
        eventLog: gameState.eventLog || {},
        savedAt: new Date().toISOString(),
      });
    }
  }

  async getGameState(userId: number): Promise<GameState | undefined> {
    const [gameState] = await db
      .select()
      .from(gameStates)
      .where(eq(gameStates.userId, userId));
    return gameState;
  }
}

export const storage = new DatabaseStorage();
