import { useState, useEffect } from 'react';
import { apiRequest } from '@/lib/queryClient';

interface GameStats {
  health: number;
  mana: number;
  level: number;
}

interface GameState {
  stats: GameStats;
  inventory: string[];
  eventLog: string[];
  characterName: string;
  characterDescription: string;
  mainQuest: {
    title: string;
    description: string;
    status: 'active' | 'completed';
  };
  sideQuests: Array<{
    title: string;
    description: string;
    status: 'active' | 'completed';
  }>;
}

export function useGameState() {
  const [gameState, setGameState] = useState<GameState>({
    stats: {
      health: 100,
      mana: 100,
      level: 1,
    },
    inventory: [],
    eventLog: [],
    characterName: "",
    characterDescription: "",
    mainQuest: {
      title: "",
      description: "",
      status: "active"
    },
    sideQuests: []
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchGameState = async () => {
    try {
      setIsLoading(true);
      const urlParams = new URLSearchParams(window.location.search);
      const gameId = urlParams.get("gameId");
      
      let res;
      if (gameId) {
        res = await apiRequest("GET", `/api/game-state/${gameId}`);
      } else {
        res = await apiRequest("GET", `/api/game-state`);
      }

      if (!res.ok) throw new Error("Failed to fetch game state");
      const data = await res.json();
      setGameState(data);
    } catch (err) {
      console.error('Error fetching game state:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch game state');
    } finally {
      setIsLoading(false);
    }
  };

  const updateGameState = async (gameId: string, newState: Partial<GameState>) => {
    try {
      const res = await apiRequest("PATCH", `/api/game-state/${gameId}`, newState);
      if (!res.ok) throw new Error("Failed to update game state");
      setGameState(prev => ({ ...prev, ...newState }));
      return true;
    } catch (err) {
      console.error('Error updating game state:', err);
      setError(err instanceof Error ? err.message : 'Failed to update game state');
      return false;
    }
  };

  useEffect(() => {
    fetchGameState();
  }, [window.location.search]);

  return { 
    gameState, 
    setGameState,
    isLoading, 
    error, 
    refetch: fetchGameState,
    updateGameState
  };
}
