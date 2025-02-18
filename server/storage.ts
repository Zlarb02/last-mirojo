import { User, InsertUser, GameState, chatHistories } from "@shared/schema";
import { db, users, gameStates } from "./db";
import { desc, eq } from "drizzle-orm";
import session from "express-session";
import connectPg from "connect-pg-simple";

// Add this interface
interface ChatHistoryData {
  user_id: number;
  game_state_id: number;
  conversation: any;
}

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

  // Add this method to your storage class
async saveChatHistory(data: ChatHistoryData) {
  return await db.insert(chatHistories).values({
    user_id: data.user_id,
    game_state_id: data.game_state_id,
    conversation: data.conversation,
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

  async createInitialGameState(userId: number): Promise<GameState> {
    const initialGameState = {
      userId,
      stats: {
        health: 100,
        mana: 100,
        level: 1
      },
      inventory: [],
      eventLog: [],
      savedAt: new Date().toISOString()
    };

    const [gameState] = await db
      .insert(gameStates)
      .values(initialGameState)
      .returning();

    return gameState;
  }

  async getGameState(userId: number): Promise<GameState | undefined> {
    const [gameState] = await db
      .select()
      .from(gameStates)
      .where(eq(gameStates.userId, userId));

    if (!gameState) {
      // Auto-create initial game state if none exists
      return this.createInitialGameState(userId);
    }
    return gameState;
  }

  async getUserGames(userId: number) {
    return await db
      .select({
        id: gameStates.id,
        saved_at: gameStates.savedAt,
        stats: gameStates.stats,
        conversation: chatHistories.conversation,
      })
      .from(gameStates)
      .leftJoin(
        chatHistories,
        eq(gameStates.id, chatHistories.game_state_id)
      )
      .where(eq(gameStates.userId, userId))
      .orderBy(desc(gameStates.savedAt));
  }
}


export const storage = new DatabaseStorage();
