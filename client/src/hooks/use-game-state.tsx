import { useState, useEffect } from "react";
import { apiRequest } from "@/lib/queryClient";
import { SavedConversation } from "@/types/chat";

export interface Stat {
  name: string;
  value: string | number;
  config: {
    type: "progress" | "number" | "text";
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
    status: "Not started" | "active" | "completed";
  };
  sideQuests: Array<{
    title: string;
    description: string;
    status: "active" | "completed";
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
          color: "#ef4444", // rouge par défaut
        },
      },
      {
        name: "Mana",
        value: 100,
        config: {
          type: "progress",
          max: 100,
          color: "#3b82f6", // bleu par défaut
        },
      },
      {
        name: "Niveau",
        value: 1,
        config: {
          type: "number",
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
      status: "Not started",
    },
    sideQuests: [],
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchGameState = async () => {
    try {
      setIsLoading(true);
      const urlParams = new URLSearchParams(window.location.search);
      const gameId = urlParams.get("gameId");

      if (!gameId) {
        setIsLoading(false);
        return;
      }

      try {
        const res = await apiRequest("GET", `/api/game-state/${gameId}`);
        const data = await res.json();

        // Ensure data has required properties with type validation
        const validatedData = {
          stats: Array.isArray(data?.stats) ? data.stats : gameState.stats,
          inventory: Array.isArray(data?.inventory) ? data.inventory : [],
          eventLog: Array.isArray(data?.eventLog) ? data.eventLog : [],
          characterName: data?.characterName || "",
          characterDescription: data?.characterDescription || "",
          mainQuest: data?.mainQuest || {
            title: "",
            description: "",
            status: "Not started" as const,
          },
          sideQuests: Array.isArray(data?.sideQuests) ? data.sideQuests : [],
        };

        // Validate stats
        const validatedStats = validatedData.stats.map((stat: Stat) => ({
          ...stat,
          config: {
            ...stat.config,
            color:
              stat.config.type === "progress"
                ? stat.config.color || "#3b82f6"
                : undefined,
          },
        }));

        setGameState({ ...validatedData, stats: validatedStats });
      } catch (error) {
        throw new Error(
          error instanceof Error ? error.message : "Failed to fetch game state"
        );
      }
    } catch (err) {
      console.error("Error fetching game state:", err);
      setError(
        err instanceof Error ? err.message : "Failed to fetch game state"
      );
      // Ne pas réinitialiser l'état en cas d'erreur
    } finally {
      setIsLoading(false);
    }
  };

  const updateGameState = async (
    gameId: string,
    newState: Partial<GameState>
  ) => {
    try {
      const response = await apiRequest(
        "PATCH",
        `/api/game-state/${gameId}`,
        newState
      );
      // If we get here, the request was successful (either got "OK" or JSON response)
      setGameState((prev) => ({ ...prev, ...newState }));
      return true;
    } catch (err) {
      console.error("Error updating game state:", err);
      setError(
        err instanceof Error ? err.message : "Failed to update game state"
      );
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
    updateGameState,
  };
}
