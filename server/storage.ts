import { User, InsertUser, GameState, games } from "@shared/schema";
import { db, users, gameStates } from "./db";
import { asc, desc, eq } from "drizzle-orm";
import session from "express-session";
import connectPg from "connect-pg-simple";

interface Game {
  id: number;
  user_id: number;
  game_state_id: number;
  conversation: {
    messages: Array<{
      role: string;
      content: string;
      timestamp: string;
    }>;
    timestamp: string;
  };
  created_at: string;
  updated_at: string;
}

const PostgresSessionStore = connectPg(session);

export interface IStorage {
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateGameStateByGameId(gameId: number, gameState: Partial<GameState>): Promise<void>;
  getGameStateByGameId(gameId: number): Promise<GameState | undefined>;
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
  async saveGame(data: Pick<Game, "user_id" | "conversation"> & { gameState?: any }) {
    // Créer d'abord un nouveau game state
    const [gameState] = await db
      .insert(gameStates)
      .values({
        userId: data.user_id,
        stats: data.gameState?.stats || {},
        inventory: data.gameState?.inventory || [],
        eventLog: data.gameState?.eventLog || [],
        savedAt: new Date().toISOString(),
      })
      .returning();

    // Ensuite créer le jeu avec le game_state_id
    const [savedGame] = await db
      .insert(games)
      .values({
        user_id: data.user_id,
        game_state_id: gameState.id,
        conversation: data.conversation,
      })
      .returning();

    return {
      ...savedGame,
      stats: gameState.stats,
      saved_at: gameState.savedAt,
    };
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


  async createInitialGameState(userId: number): Promise<GameState> {
    const initialGameState = {
      userId,
      stats: {
        health: 0,
        mana: 0,
        level: 0,
      },
      inventory: [],
      eventLog: [],
      savedAt: new Date().toISOString(),
    };

    const [gameState] = await db
      .insert(gameStates)
      .values(initialGameState)
      .returning();

    return gameState;
  }

  async getGameStateByGameId(gameStateId: number): Promise<GameState | undefined> {
    const [gameState] = await db
      .select()
      .from(gameStates)
      .where(eq(gameStates.id, gameStateId));

    return gameState;
}


async updateGameStateByGameId(
  gameStateId: number,
  gameState: Partial<GameState>
): Promise<void> {
  await db
    .update(gameStates)
    .set({
      ...gameState,
      savedAt: new Date().toISOString(),
    })
    .where(eq(gameStates.id, gameStateId));
}

  async getUserGames(userId: number) {
    return await db
      .select({
        id: games.id,
        user_id: games.user_id,
        game_state_id: games.game_state_id,
        conversation: games.conversation,
        created_at: games.created_at,
        updated_at: games.updated_at,
        stats: gameStates.stats,
        saved_at: gameStates.savedAt,
      })
      .from(games)
      .leftJoin(gameStates, eq(games.game_state_id, gameStates.id))
      .where(eq(games.user_id, userId))
      .orderBy(desc(games.updated_at))
      .then((games) =>
        games.map((game) => ({
          ...game,
          id: Number(game.id), // Conversion explicite en number
          user_id: Number(game.user_id),
          game_state_id: Number(game.game_state_id),
        }))
      );
  }

  async getLastConversation(userId: number) {
    const [lastGame] = await db
      .select({
        id: games.id,
        user_id: games.user_id,
        game_state_id: games.game_state_id,
        conversation: games.conversation,
        created_at: games.created_at,
        updated_at: games.updated_at,
        stats: gameStates.stats,
        saved_at: gameStates.savedAt,
      })
      .from(games)
      .leftJoin(gameStates, eq(games.game_state_id, gameStates.id))
      .where(eq(games.user_id, userId))
      .orderBy(desc(games.updated_at))
      .limit(1);

    return lastGame?.conversation || null;
  }

  async getGameById(gameId: number) {
    const [game] = await db
      .select({
        id: games.id,
        user_id: games.user_id,
        game_state_id: games.game_state_id,
        conversation: games.conversation,
        created_at: games.created_at,
        updated_at: games.updated_at,
        stats: gameStates.stats,
        saved_at: gameStates.savedAt,
      })
      .from(games)
      .leftJoin(gameStates, eq(games.game_state_id, gameStates.id))
      .where(eq(games.id, gameId));

    return game;
  }

  async deleteGame(gameId: number) {
    // D'abord supprimer le jeu lui-même
    const [deletedGame] = await db
      .delete(games)
      .where(eq(games.id, gameId))
      .returning();

    // Puis supprimer le game state associé si nécessaire
    if (deletedGame?.game_state_id) {
      await db
        .delete(gameStates)
        .where(eq(gameStates.id, deletedGame.game_state_id));
    }

    return deletedGame;
  }

  async updateGame(gameId: number, data: { conversation: any }) {
    const [updatedGame] = await db
      .update(games)
      .set({
        conversation: data.conversation,
      })
      .where(eq(games.id, gameId))
      .returning();

    return updatedGame;
  }
}

export const storage = new DatabaseStorage();
