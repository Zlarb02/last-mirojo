import { User, InsertUser, GameState } from "@shared/schema";
import session from "express-session";
import createMemoryStore from "memorystore";

const MemoryStore = createMemoryStore(session);

export interface IStorage {
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateGameState(userId: number, gameState: Partial<GameState>): Promise<void>;
  getGameState(userId: number): Promise<GameState | undefined>;
  sessionStore: session.Store;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private gameStates: Map<number, GameState>;
  public sessionStore: session.Store;
  currentId: number;

  constructor() {
    this.users = new Map();
    this.gameStates = new Map();
    this.currentId = 1;
    this.sessionStore = new MemoryStore({
      checkPeriod: 86400000,
    });
  }

  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.currentId++;
    const user: User = { ...insertUser, id, currentGameState: null };
    this.users.set(id, user);
    return user;
  }

  async updateGameState(userId: number, gameState: Partial<GameState>): Promise<void> {
    const existing = this.gameStates.get(userId) || {};
    this.gameStates.set(userId, { ...existing, ...gameState, userId });
  }

  async getGameState(userId: number): Promise<GameState | undefined> {
    return this.gameStates.get(userId);
  }
}

export const storage = new MemStorage();
