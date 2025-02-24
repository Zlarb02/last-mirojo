import {
  User,
  InsertUser,
  GameState,
  Game,
  Message,
  userPreferences,
} from "@shared/schema";
import { db, users, gameStates, games as gamesTable } from "./db";
import { asc, desc, eq } from "drizzle-orm";
import session from "express-session";
import connectPg from "connect-pg-simple";

const PostgresSessionStore = connectPg(session);

export interface IStorage {
  getUser(id: string): Promise<User | undefined>; // Changed from number to string
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateGameStateByGameId(
    gameId: string,
    gameState: Partial<GameState>
  ): Promise<void>; // Changed from number to string
  getGameStateByGameId(gameId: string): Promise<GameState | undefined>; // Changed from number to string
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

  async createInitialGameState(userId: string): Promise<GameState> {
    // Changed from number to string
    const initialGameState = {
      userId,
      stats: [
        {
          name: "Santé",
          value: 100,
          config: {
            type: "progress" as const, // Forcer le type littéral
            max: 100,
            color: "#ef4444",
          },
        },
        {
          name: "Mana",
          value: 100,
          config: {
            type: "progress" as const, // Forcer le type littéral
            max: 100,
            color: "#3b82f6",
          },
        },
        {
          name: "Niveau",
          value: 1,
          config: {
            type: "number" as const, // Forcer le type littéral
          },
        },
      ],
      inventory: [],
      eventLog: [],
      characterName: "",
      characterDescription: "",
      mainQuest: {
        title: "",
        description: "",
        status: "Not started" as const,
      },
      sideQuests: [],
      savedAt: new Date().toISOString(),
    };

    const [gameState] = await db
      .insert(gameStates)
      .values(initialGameState)
      .returning();

    return gameState;
  }

  async saveGame(data: {
    user_id: string;
    name: string; // S'assurer que le name est utilisé
    description: string;
    conversation: { messages: Message[]; timestamp: string };
    gameState?: Partial<GameState>;
  }) {
    try {
      if (!data.user_id) {
        throw new Error("User ID is required");
      }

      // Ensure valid default values for game state
      const gameStateData = {
        userId: data.user_id,
        stats: data.gameState?.stats || [],
        inventory: data.gameState?.inventory || [],
        eventLog: data.gameState?.eventLog || [],
        characterName: data.gameState?.characterName || "",
        characterDescription: data.gameState?.characterDescription || "",
        mainQuest: data.gameState?.mainQuest || null,
        // Ensure sideQuests is properly handled as JSONB
        sideQuests: data.gameState?.sideQuests || [], // Changed to default empty array
        savedAt: new Date().toISOString(),
      };

      // Create new game state
      const [gameState] = await db
        .insert(gameStates)
        .values(gameStateData)
        .returning();

      if (!gameState) {
        throw new Error("Failed to create game state");
      }

      // Create new game with proper conversation format and name
      const gameData = {
        userId: data.user_id,
        name: data.name, // Ajouter le nom
        description: data.description,
        gameStateId: gameState.id,
        conversation: {
          messages: data.conversation.messages || [],
          timestamp: data.conversation.timestamp || new Date().toISOString(),
        },
      };

      const [savedGame] = await db
        .insert(gamesTable)
        .values(gameData)
        .returning();

      if (!savedGame) {
        throw new Error("Failed to save game");
      }

      return {
        ...savedGame,
        stats: gameState.stats,
        saved_at: gameState.savedAt,
      };
    } catch (error) {
      console.error("Error saving game:", error);
      throw error;
    }
  }

  async getUser(id: string): Promise<User | undefined> {
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
        language: insertUser.language || "en",
      })
      .returning();
    return user;
  }

  async getGameStateByGameId(
    gameStateId: string
  ): Promise<GameState | undefined> {
    // Changed from number to string
    const [gameState] = await db
      .select()
      .from(gameStates)
      .where(eq(gameStates.id, gameStateId));

    return gameState;
  }

  async updateGameStateByGameId(
    gameStateId: string, // Changed from number to string
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

  // Modifier la méthode getUserGames pour inclure le nom
  async getUserGames(userId: string): Promise<Game[]> {
    const results = await db
      .select({
        id: gamesTable.id,
        userId: gamesTable.userId,
        gameStateId: gamesTable.gameStateId,
        name: gamesTable.name, // Ajouter le champ name
        description: gamesTable.description, // Ajouter le champ description
        conversation: gamesTable.conversation,
        createdAt: gamesTable.createdAt,
        updatedAt: gamesTable.updatedAt,
      })
      .from(gamesTable)
      .leftJoin(gameStates, eq(gamesTable.gameStateId, gameStates.id))
      .where(eq(gamesTable.userId, userId))
      .orderBy(desc(gamesTable.updatedAt));

    return results;
  }

  async getLastConversation(
    userId: string
  ): Promise<{ messages: Message[]; timestamp: string } | null> {
    // Changed from number to string
    const [lastGame] = await db
      .select({
        id: gamesTable.id,
        user_id: gamesTable.userId,
        game_state_id: gamesTable.gameStateId,
        conversation: gamesTable.conversation,
        created_at: gamesTable.createdAt,
        updated_at: gamesTable.updatedAt,
        stats: gameStates.stats,
        saved_at: gameStates.savedAt,
      })
      .from(gamesTable)
      .leftJoin(gameStates, eq(gamesTable.gameStateId, gameStates.id))
      .where(eq(gamesTable.userId, userId))
      .orderBy(desc(gamesTable.updatedAt))
      .limit(1);

    return lastGame?.conversation || null;
  }

  async getGameById(gameId: string): Promise<Game | undefined> {
    // Changed from number to string
    const [result] = await db
      .select({
        id: gamesTable.id,
        userId: gamesTable.userId,
        name: gamesTable.name, // Ajouter le nom
        description: gamesTable.description, // Ajouter la description
        gameStateId: gamesTable.gameStateId,
        conversation: gamesTable.conversation,
        createdAt: gamesTable.createdAt,
        updatedAt: gamesTable.updatedAt,
      })
      .from(gamesTable)
      .leftJoin(gameStates, eq(gamesTable.gameStateId, gameStates.id))
      .where(eq(gamesTable.id, gameId));

    return result;
  }

  async deleteGame(gameId: string): Promise<Game | undefined> {
    // Changed from number to string
    const [deletedGame] = await db
      .delete(gamesTable)
      .where(eq(gamesTable.id, gameId))
      .returning();

    if (deletedGame?.gameStateId) {
      await db
        .delete(gameStates)
        .where(eq(gameStates.id, deletedGame.gameStateId));
    }

    return deletedGame;
  }

  async updateGame(
    gameId: string,
    data: {
      conversation: { messages: Message[]; timestamp: string };
      name?: string;
      description?: string;
    }
  ): Promise<Game> {
    const [updatedGame] = await db
      .update(gamesTable)
      .set({
        conversation: data.conversation,
        name: data.name || undefined,
        description: data.description || undefined,
        updatedAt: new Date(),
      })
      .where(eq(gamesTable.id, gameId))
      .returning();

    if (!updatedGame) {
      throw new Error("Game not found");
    }

    return updatedGame;
  }

  async updateUserPreferences(
    userId: string,
    data: {
      customColors?: { primary?: string; secondary?: string } | null;
      themeVariant?: string;
      themeMode?: string;
      background?: {
        type: "none" | "image" | "video";
        url: string;
        overlay: string;
        useLightTheme?: boolean;
      };
    }
  ): Promise<void> {
    // Créer un objet de mise à jour qui ne contient que les champs définis
    const updateData: Record<string, any> = {};
    
    if (data.customColors !== undefined) {
      updateData.customColors = data.customColors;
    }
    if (data.themeVariant !== undefined) {
      updateData.themeVariant = data.themeVariant;
    }
    if (data.themeMode !== undefined) {
      updateData.themeMode = data.themeMode;
    }
    if (data.background !== undefined) {
      updateData.background = data.background;
    }
    
    updateData.updatedAt = new Date();
  
    // Log pour le débogage
    console.log('Updating user preferences:', {
      userId,
      updateData
    });
  
    // Effectuer la mise à jour
    const result = await db
      .update(userPreferences)
      .set(updateData)
      .where(eq(userPreferences.userId, userId))
      .returning();
  
    // Log pour confirmer la mise à jour
    console.log('Update result:', result);
  }

  async getUserPreferences(userId: string) {
    const [preferences] = await db
      .select({
        themeVariant: userPreferences.themeVariant,
        themeMode: userPreferences.themeMode,
        customColors: userPreferences.customColors,
        background: userPreferences.background,
      })
      .from(userPreferences)
      .where(eq(userPreferences.userId, userId));

    return {
      themeVariant: preferences?.themeVariant || "classic",
      themeMode: preferences?.themeMode || "system",
      customColors: preferences?.customColors || null,
      background: preferences?.background || {
        type: "none",
        url: "",
        overlay: "0.85",
        useLightTheme: false,
      },
    };
  }
}

export const storage = new DatabaseStorage();
