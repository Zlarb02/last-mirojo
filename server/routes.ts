import type { Express } from "express";
import { createServer, type Server } from "http";
import { setupAuth } from "./auth";
import { storage } from "./storage";
import { generateResponse } from "./services/groq";
import { userPreferences } from "@shared/schema";

export async function registerRoutes(app: Express): Promise<Server> {
  setupAuth(app);

  // Game state management
  // Add this endpoint after the existing chat endpoint
  app.post("/api/game/save", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);

    try {
      const userId = req.user!.id;
      const { conversation, gameState, name, description } = req.body;

      if (!conversation || !conversation.messages) {
        return res.status(400).json({ error: "Invalid conversation data" });
      }

      const savedGame = await storage.saveGame({
        user_id: userId,
        conversation: {
          messages: conversation.messages,
          timestamp: conversation.timestamp || new Date().toISOString(),
        },
        gameState: gameState
          ? {
              ...gameState,
              userId,
            }
          : undefined,
        name: name || "",
        description: description || "",
      });

      res.json(savedGame);
    } catch (error) {
      console.error("Failed to save game:", error);
      res.status(500).json({
        error: error instanceof Error ? error.message : "Failed to save game",
      });
    }
  });

  app.get("/api/game/load/:id", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);

    try {
      const userId = req.user!.id;
      const gameId = req.params.id;

      const game = await storage.getGameById(gameId);

      if (!game || game.userId !== userId) {
        return res.status(404).json({ error: "Game not found" });
      }

      res.json(game);
    } catch (error) {
      console.error("Failed to load game:", error);
      res.status(500).json({ error: "Failed to load game" });
    }
  });

  // Game state route
  app.get("/api/game-state", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);

    try {
      // Retourner un état initial par défaut
      res.json({
        stats: {
          health: 100,
          mana: 100,
          level: 1,
        },
        inventory: [],
        eventLog: [],
        characterName: "",
        characterDescription: "",
        mainQuest: { title: "", description: "", status: "active" },
        sideQuests: [],
      });
    } catch (error) {
      console.error("Failed to create initial game state:", error);
      res.status(500).json({ error: "Failed to create initial game state" });
    }
  });

  // Modifier la route PATCH pour gérer aussi les nouvelles parties
  app.patch("/api/game-state", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);

    try {
      const userId = req.user!.id;
      const { stats, inventory, eventLog } = req.body;
      const gameId = req.query.gameId ? (req.query.gameId as string) : null;

      if (gameId) {
        // Mise à jour d'une partie existante
        const game = await storage.getGameById(gameId);
        if (!game || game.userId !== userId) {
          return res.status(404).json({ error: "Game not found" });
        }
        if (game.gameStateId === null) {
          return res.status(404).json({ error: "Game state not found" });
        }
        await storage.updateGameStateByGameId(game.gameStateId, {
          stats,
          inventory,
          eventLog,
        });
      } else {
        // Création d'un nouveau game state pour une nouvelle partie
        const gameState = await storage.createInitialGameState(userId);
        await storage.updateGameStateByGameId(gameState.id, {
          stats,
          inventory,
          eventLog,
        });
      }

      res.sendStatus(200);
    } catch (error) {
      console.error("Failed to update game state:", error);
      res.status(500).json({ error: "Failed to update game state" });
    }
  });

  // Game state with game id route
  app.get("/api/game-state/:gameId", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);

    try {
      const userId = req.user!.id;
      const gameId = req.params.gameId;

      // Vérifier que le jeu existe et appartient à l'utilisateur
      const game = await storage.getGameById(gameId);
      if (!game || game.userId !== userId) {
        return res.status(404).json({ error: "Game not found" });
      }

      // Récupérer le game state associé au jeu
      if (game.gameStateId === null) {
        return res.status(404).json({ error: "Game state not found" });
      }
      const gameState = await storage.getGameStateByGameId(game.gameStateId);
      if (!gameState) {
        return res.status(404).json({ error: "Game state not found" });
      }

      res.json({
        stats: gameState.stats,
        inventory: gameState.inventory,
        eventLog: gameState.eventLog,
        characterName: gameState.characterName,
        characterDescription: gameState.characterDescription,
        mainQuest: gameState.mainQuest || {
          title: "",
          description: "",
          status: "active",
        },
        sideQuests: gameState.sideQuests || [],
      });
    } catch (error) {
      console.error("Failed to fetch game state:", error);
      res.status(500).json({ error: "Failed to fetch game state" });
    }
  });
  // Route pour mettre à jour l'état du jeu
  app.patch("/api/game-state/:gameId", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);

    try {
      const userId = req.user!.id;
      const gameId = req.params.gameId;
      const {
        stats,
        inventory,
        eventLog,
        characterName,
        characterDescription,
        mainQuest,
        sideQuests,
      } = req.body;

      // Vérifier que le jeu existe et appartient à l'utilisateur
      const game = await storage.getGameById(gameId);
      if (!game || game.userId !== userId) {
        return res.status(404).json({ error: "Game not found" });
      }
      if (game.gameStateId === null) {
        return res.status(404).json({ error: "Game state not found" });
      }
      await storage.updateGameStateByGameId(game.gameStateId, {
        stats,
        inventory,
        eventLog,
        characterName,
        characterDescription,
        mainQuest,
        sideQuests,
      });

      res.sendStatus(200);
    } catch (error) {
      console.error("Failed to update game state:", error);
      res.status(500).json({ error: "Failed to update game state" });
    }
  });

  // Chat endpoint
  app.post("/api/chat", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);

    try {
      const { message, context, gameState, gameId } = req.body;

      // Si un gameId est fourni, on récupère l'état du jeu depuis la base
      let currentGameState = gameState;
      if (gameId) {
        const game = await storage.getGameById(gameId);
        if (game && game.gameStateId) {
          const dbGameState = await storage.getGameStateByGameId(
            game.gameStateId
          );
          if (dbGameState) {
            currentGameState = {
              stats: dbGameState.stats,
              inventory: dbGameState.inventory,
              eventLog: dbGameState.eventLog,
              characterName: dbGameState.characterName,
              characterDescription: dbGameState.characterDescription,
              mainQuest: dbGameState.mainQuest,
              sideQuests: dbGameState.sideQuests,
            };
          }
        }
      }

      const response = await generateResponse(
        message,
        context,
        currentGameState
      );
      res.json({ response });
    } catch (error) {
      console.error("Chat error:", error);
      res.status(500).json({ error: "Failed to generate response" });
    }
  });

  // Language preference
  app.post("/api/user/language", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);

    const user = await storage.getUser(req.user!.id);
    if (!user) return res.sendStatus(404);

    user.language = req.body.language;
    res.sendStatus(200);
  });

  // Nouvelle route pour les préférences de thème
  app.post("/api/user/theme-preferences", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);

    try {
      const userId = req.user!.id;
      const { customColors, themeMode, themeVariant, background } = req.body;

      // Log pour le débogage
      console.log('Received theme preferences update:', {
        userId,
        customColors,
        themeMode,
        themeVariant,
        background
      });

      // Valider le format du background si présent
      if (background && (!background.type || !background.overlay)) {
        return res.status(400).json({ 
          error: "Invalid background format" 
        });
      }

      await storage.updateUserPreferences(userId, {
        customColors,
        themeMode,
        themeVariant,
        background
      });

      res.json({ success: true });
    } catch (error) {
      console.error("Failed to update theme preferences:", error);
      res.status(500).json({ error: "Failed to update theme preferences" });
    }
  });

  // Ajouter cette nouvelle route pour récupérer les préférences de thème
  app.get("/api/user/theme-preferences", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);

    try {
      const preferences = await storage.getUserPreferences(req.user!.id);
      res.json(preferences);
    } catch (error) {
      console.error("Failed to fetch theme preferences:", error);
      res.status(500).json({ error: "Failed to fetch theme preferences" });
    }
  });

  app.get("/api/games", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);

    try {
      const userId = req.user!.id;
      const games = await storage.getUserGames(userId);
      res.json(games);
    } catch (error) {
      console.error("Failed to fetch games:", error);
      res.status(500).json({ error: "Failed to fetch games" });
    }
  });

  app.get("/api/games/last", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);

    try {
      const userId = req.user!.id;
      const conversation = await storage.getLastConversation(userId);
      res.json({ conversation });
    } catch (error) {
      console.error("Failed to fetch last conversation:", error);
      res.status(500).json({ error: "Failed to fetch last conversation" });
    }
  });

  app.delete("/api/games/:id", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);

    try {
      const userId = req.user!.id;
      const gameId = req.params.id;

      // Check if game exists and belongs to user
      const game = await storage.getGameById(gameId);
      if (!game || game.userId !== userId) {
        return res.status(404).json({ error: "Game not found" });
      }

      await storage.deleteGame(gameId);
      // Send 204 No Content for successful deletion
      res.sendStatus(204);
    } catch (error) {
      console.error("Failed to delete game:", error);
      res.status(500).json({ error: "Failed to delete game" });
    }
  });

  app.get("/api/game/:id", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);

    try {
      const userId = req.user!.id;
      const gameId = req.params.id;

      const game = await storage.getGameById(gameId);
      if (!game || game.userId !== userId) {
        return res.status(404).json({ error: "Game not found" });
      }

      res.json(game);
    } catch (error) {
      console.error("Failed to fetch game:", error);
      res.status(500).json({ error: "Failed to fetch game" });
    }
  });

  app.post("/api/game/:id", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);

    try {
      const userId = req.user!.id;
      const gameId = req.params.id;
      const { conversation, gameState, name, description } = req.body;

      // Vérifier que le jeu existe et appartient à l'utilisateur
      const game = await storage.getGameById(gameId);
      if (!game || game.userId !== userId) {
        return res.status(404).json({ error: "Game not found" });
      }

      // Mettre à jour la conversation et le game state
      const updatedGame = await storage.updateGame(gameId, {
        conversation,
        name,
        description,
      });

      if (gameState && game.gameStateId) {
        await storage.updateGameStateByGameId(game.gameStateId, gameState);
      }

      res.json(updatedGame);
    } catch (error) {
      console.error("Failed to update game:", error);
      res.status(500).json({ error: "Failed to update game" });
    }
  });

  app.patch("/api/games/:id/name", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);

    try {
      const userId = req.user!.id;
      const gameId = req.params.id;
      const { name } = req.body;

      const game = await storage.getGameById(gameId);
      if (!game || game.userId !== userId) {
        return res.status(404).json({ error: "Game not found" });
      }

      const updatedGame = await storage.updateGame(gameId, {
        conversation: game.conversation,
        name,
      });

      res.json(updatedGame);
    } catch (error) {
      console.error("Failed to rename game:", error);
      res.status(500).json({ error: "Failed to rename game" });
    }
  });

  // Ajouter cette nouvelle route pour la description
  app.patch("/api/games/:id/description", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);

    try {
      const userId = req.user!.id;
      const gameId = req.params.id;
      const { description } = req.body;

      const game = await storage.getGameById(gameId);
      if (!game || game.userId !== userId) {
        return res.status(404).json({ error: "Game not found" });
      }

      const updatedGame = await storage.updateGame(gameId, {
        conversation: game.conversation,
        description,
      });

      res.json(updatedGame);
    } catch (error) {
      console.error("Failed to update description:", error);
      res.status(500).json({ error: "Failed to update description" });
    }
  });

  app.get("/api/youtube/search", async (req, res) => {
    const apiKey = process.env.YOUTUBE_API_KEY;
    const query = req.query.q as string;

    if (!query) {
      return res.status(400).json({ error: "Query parameter is required" });
    }

    try {
      const response = await fetch(
        `https://www.googleapis.com/youtube/v3/search?part=snippet&maxResults=9&q=${encodeURIComponent(
          query
        )}&type=video&key=${apiKey}`
      );

      const data = await response.json();
      res.json(data);
    } catch (error) {
      console.error("YouTube API error:", error);
      res.status(500).json({ error: "Failed to fetch YouTube results" });
    }
  });

  app.get("/api/unsplash/search", async (req, res) => {
    if (!process.env.UNSPLASH_ACCESS_KEY) {
      return res.status(500).json({ error: "Unsplash API key is not configured" });
    }

    const query = req.query.q as string;
    if (!query) {
      return res.status(400).json({ error: "Query parameter is required" });
    }

    try {
      const results = await searchUnsplash(query);
      res.json(results);
    } catch (error) {
      console.error("Unsplash API error:", error);
      res.status(500).json({ error: "Failed to fetch Unsplash results" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}

export async function searchUnsplash(query: string) {
  const response = await fetch(
    `https://api.unsplash.com/search/photos?page=1&query=${encodeURIComponent(query)}&per_page=30`,
    {
      headers: {
        Authorization: `Client-ID ${process.env.UNSPLASH_ACCESS_KEY}`,
      },
    }
  );

  const data = await response.json();
  return data.results.map((photo: any) => ({
    id: photo.id,
    url: photo.urls.full,
    thumbnail: photo.urls.small,
    title: photo.description || photo.alt_description || 'Untitled',
  }));
}
