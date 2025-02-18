import type { Express } from "express";
import { createServer, type Server } from "http";
import { setupAuth } from "./auth";
import { storage } from "./storage";
import { generateResponse } from "./services/groq";

export async function registerRoutes(app: Express): Promise<Server> {
  setupAuth(app);

  // Game state management
// Add this endpoint after the existing chat endpoint
app.post("/api/chat/save", async (req, res) => {
  if (!req.isAuthenticated()) return res.sendStatus(401);

  try {
    const userId = req.user!.id;
    const { conversation } = req.body;
    const gameState = await storage.getGameState(userId);
    
    // Get the latest game state for the user
    if (!gameState) return res.status(404).json({ error: "No game state found" });

    // Save conversation to chat_histories table
    await storage.saveChatHistory({
      user_id: userId,
      game_state_id: gameState.id,
      conversation: conversation,
    });

    res.sendStatus(200);
  } catch (error) {
    console.error("Failed to save chat history:", error);
    res.status(500).json({ error: "Failed to save conversation" });
  }
});

  app.get("/api/game/load", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);

    const userId = req.user!.id;
    const gameState = await storage.getGameState(userId);
    if (!gameState) return res.sendStatus(404);
    res.json(gameState);
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

  const httpServer = createServer(app);
  return httpServer;
}
