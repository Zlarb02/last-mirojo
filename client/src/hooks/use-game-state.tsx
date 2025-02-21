import { useState, useEffect } from 'react';
import { apiRequest } from '@/lib/queryClient';

export interface Stat {
  name: string;
  value: string | number;
  config: {
    type: 'progress' | 'number' | 'text';
    max?: number;
    color?: string;
  };
}

interface GameState {
  stats: Stat[];
  inventory: string[];
  eventLog: string[];
  characterName: string;
  characterDescription: string;
  mainQuest: {
    title: string;
    description: string;
    status: 'Not started' | 'active' | 'completed';
  };
  sideQuests: Array<{
    title: string;
    description: string;
    status: 'active' | 'completed';
  }>;
}

export function useGameState() {
  const [gameState, setGameState] = useState<GameState>({
    stats: [
      {
        name: "Santé",
        value: 100,
        config: {
          type: "progress",
          max: 100,
          color: "#ef4444" // rouge par défaut
        }
      },
      {
        name: "Mana",
        value: 100,
        config: {
          type: "progress",
          max: 100,
          color: "#3b82f6" // bleu par défaut
        }
      },
      {
        name: "Niveau",
        value: 1,
        config: {
          type: "number"
        }
      }
    ],
    inventory: [],
    eventLog: [],
    characterName: "",
    characterDescription: "",
    mainQuest: {
      title: "",
      description: "",
      status: "Not started"
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
        return; // Don't fetch if no gameId
      }

      if (!res.ok) throw new Error("Failed to fetch game state");
      const data = await res.json();
      // S'assurer que les stats ont des couleurs valides
      const validatedStats = data.stats.map((stat: Stat) => {
        if (stat.config.type === 'progress' && !stat.config.color) {
          return {
            ...stat,
            config: {
              ...stat.config,
              color: '#3b82f6' // couleur par défaut si manquante
            }
          };
        }
        return stat;
      });
      setGameState({ ...data, stats: validatedStats });
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
