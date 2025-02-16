import type { Express } from "express";
import { createServer, type Server } from "http";
import { setupAuth } from "./auth";
import { storage } from "./storage";

export async function registerRoutes(app: Express): Promise<Server> {
  setupAuth(app);

  // Game state management
  app.post("/api/game/save", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    
    const userId = req.user!.id;
    await storage.updateGameState(userId, {
      ...req.body,
      savedAt: new Date().toISOString()
    });
    res.sendStatus(200);
  });

  app.get("/api/game/load", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    
    const userId = req.user!.id;
    const gameState = await storage.getGameState(userId);
    if (!gameState) return res.sendStatus(404);
    res.json(gameState);
  });

  // Language preference
  app.post("/api/user/language", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    
    const user = await storage.getUser(req.user!.id);
    if (!user) return res.sendStatus(404);
    
    user.language = req.body.language;
    res.sendStatus(200);
  });

  const httpServer = createServer(app);
  return httpServer;
}
