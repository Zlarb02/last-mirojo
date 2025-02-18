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
      const { conversationId, conversation } = req.body;

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
      } else {
        // Sinon, créer un nouveau jeu
        savedGame = await storage.saveGame({
          user_id: userId,
          conversation,
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

  // Chat endpoint
  app.post("/api/chat", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);

    try {
      const { message, context } = req.body;
      const response = await generateResponse(message, context);
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
