import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { useTranslation } from "react-i18next";
import { apiRequest } from "@/lib/queryClient";

interface GameState {
  stats: {
    health: number;
    mana: number;
    level: number;
  };
}

export function CharacterStats() {
  const { t } = useTranslation();
  const [gameState, setGameState] = useState<GameState>({
    stats: {
      health: 100,
      mana: 100,
      level: 1,
    },
  });

  const fetchGameState = async () => {
    try {
      const res = await apiRequest("GET", "/api/game-state");
      if (!res.ok) throw new Error("Failed to fetch game state");
      const data = await res.json();
      setGameState(data);
    } catch (error) {
      console.error("Failed to fetch game state:", error);
    }
  };

  useEffect(() => {
    fetchGameState();
    // Rafraîchir toutes les 5 secondes
    const interval = setInterval(fetchGameState, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t("game.stats.title")}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>{t("game.stats.health")}</span>
            <span>{gameState.stats.health}/100</span>
          </div>
          <Progress value={gameState.stats.health} className="h-2" />
        </div>
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>{t("game.stats.mana")}</span>
            <span>{gameState.stats.mana}/100</span>
          </div>
          <Progress value={gameState.stats.mana} className="h-2" />
        </div>
        <div className="flex justify-between items-center">
          <span className="text-sm">{t("game.stats.level")}</span>
          <span className="text-2xl font-bold">{gameState.stats.level}</span>
        </div>
      </CardContent>
    </Card>
  );
}
