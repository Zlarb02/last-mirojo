import type { Express } from "express";
import { createServer, type Server } from "http";
import { setupAuth } from "./auth";
import { storage } from "./storage";
import { generateResponse } from "./services/groq";

export async function registerRoutes(app: Express): Promise<Server> {
  setupAuth(app);

  // Game state management
  // Add this endpoint after the existing chat endpoint
  app.post("/api/game/save", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);

    try {
      const userId = req.user!.id;
      const { conversationId, conversation, gameState } = req.body;

      let savedGame;

      // Si un ID est fourni, mettre à jour le jeu existant
      if (conversationId) {
        const existingGame = await storage.getGameById(conversationId);
        if (!existingGame || existingGame.user_id !== userId) {
          return res.status(404).json({ error: "Game not found" });
        }

        savedGame = await storage.updateGame(conversationId, {
          conversation,
        });

        // Mettre à jour le game state
        if (gameState && existingGame.game_state_id) {
          await storage.updateGameStateByGameId(existingGame.game_state_id, gameState);
        }
      } else {
        // Créer un nouveau jeu avec son game state
        savedGame = await storage.saveGame({
          user_id: userId,
          conversation,
          gameState,
        });
      }

      res.json({
        ...savedGame,
      });
    } catch (error) {
      console.error("Failed to save game:", error);
      res.status(500).json({ error: "Failed to save game" });
    }
  });

  app.get("/api/game/load/:id", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);

    try {
      const userId = req.user!.id;
      const gameId = parseInt(req.params.id);

      const game = await storage.getGameById(gameId);

      if (!game || game.user_id !== userId) {
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
          level: 1
        },
        inventory: [],
        eventLog: []
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
      const gameId = req.query.gameId ? parseInt(req.query.gameId as string) : null;

      if (gameId) {
        // Mise à jour d'une partie existante
        const game = await storage.getGameById(gameId);
        if (!game || game.user_id !== userId) {
          return res.status(404).json({ error: "Game not found" });
        }
        if (game.game_state_id === null) {
          return res.status(404).json({ error: "Game state not found" });
        }
        await storage.updateGameStateByGameId(game.game_state_id, {
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
      const gameId = parseInt(req.params.gameId);

      // Vérifier que le jeu existe et appartient à l'utilisateur
      const game = await storage.getGameById(gameId);
      if (!game || game.user_id !== userId) {
        return res.status(404).json({ error: "Game not found" });
      }

      // Récupérer le game state associé au jeu
      if (game.game_state_id === null) {
        return res.status(404).json({ error: "Game state not found" });
      }
      const gameState = await storage.getGameStateByGameId(game.game_state_id);
      if (!gameState) {
        return res.status(404).json({ error: "Game state not found" });
      }

      res.json({
        stats: gameState.stats,
        inventory: gameState.inventory,
        eventLog: gameState.eventLog,
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
      const gameId = parseInt(req.params.gameId);
      const { stats, inventory, eventLog } = req.body;

      // Vérifier que le jeu existe et appartient à l'utilisateur
      const game = await storage.getGameById(gameId);
      if (!game || game.user_id !== userId) {
        return res.status(404).json({ error: "Game not found" });
      }
      if (game.game_state_id === null) {
        return res.status(404).json({ error: "Game state not found" });
      }
      await storage.updateGameStateByGameId(game.game_state_id, {
        stats,
        inventory,
        eventLog,
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
        if (game && game.game_state_id) {
          const dbGameState = await storage.getGameStateByGameId(game.game_state_id);
          if (dbGameState) {
            currentGameState = {
              stats: dbGameState.stats,
              inventory: dbGameState.inventory,
              eventLog: dbGameState.eventLog
            };
          }
        }
      }

      const response = await generateResponse(message, context, currentGameState);
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
      const gameId = parseInt(req.params.id);

      // Check if game exists and belongs to user
      const game = await storage.getGameById(gameId);
      if (!game || game.user_id !== userId) {
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

  const httpServer = createServer(app);
  return httpServer;
}
