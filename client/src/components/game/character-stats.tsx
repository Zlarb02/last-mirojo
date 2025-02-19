import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useTranslation } from "react-i18next";
import { useGameState } from "@/hooks/use-game-state";
import { useToast } from "@/hooks/use-toast";

export function CharacterStats() {
  const { t } = useTranslation();
  const { toast } = useToast();
  const { gameState, updateGameState } = useGameState();
  const [isEditing, setIsEditing] = useState(false);
  const [editedStats, setEditedStats] = useState(gameState.stats);

  // Récupérer le gameId depuis l'URL
  const urlParams = new URLSearchParams(window.location.search);
  const gameId = urlParams.get("gameId");

  // Ne rien afficher si pas de gameId
  if (!gameId) {
    return null;
  }

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleCancel = () => {
    setIsEditing(false);
    setEditedStats(gameState.stats);
  };

  const handleSave = async () => {
    try {
      const urlParams = new URLSearchParams(window.location.search);
      const gameId = urlParams.get("gameId");
      
      if (!gameId) {
        toast({
          title: t("error"),
          description: t("game.stats.noGameId"),
          variant: "destructive",
        });
        return;
      }

      const success = await updateGameState(gameId, {
        stats: editedStats,
        inventory: gameState.inventory,
        eventLog: gameState.eventLog
      });

      if (success) {
        setIsEditing(false);
        toast({
          title: t("success"),
          description: t("game.stats.updated")
        });
      }
    } catch (error) {
      console.error("Failed to update game state:", error);
      toast({
        title: t("error"),
        description: t("game.stats.updateFailed"),
        variant: "destructive"
      });
    }
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>{t("game.stats.title")}</CardTitle>
        {!isEditing ? (
          <Button variant="outline" size="sm" onClick={handleEdit}>
            {t("game.stats.edit")}
          </Button>
        ) : (
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={handleCancel}>
              {t("common.cancel")}
            </Button>
            <Button size="sm" onClick={handleSave}>
              {t("common.save")}
            </Button>
          </div>
        )}
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>{t("game.stats.health")}</span>
            {isEditing ? (
              <Input
                type="number"
                min="0"
                max="100"
                value={editedStats.health}
                onChange={(e) => setEditedStats({
                  ...editedStats,
                  health: Math.min(100, Math.max(0, parseInt(e.target.value) || 0))
                })}
                className="w-20 h-6 text-right"
              />
            ) : (
              <span>{gameState.stats.health}/100</span>
            )}
          </div>
          <Progress value={isEditing ? editedStats.health : gameState.stats.health} className="h-2" />
        </div>
        
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>{t("game.stats.mana")}</span>
            {isEditing ? (
              <Input
                type="number"
                min="0"
                max="100"
                value={editedStats.mana}
                onChange={(e) => setEditedStats({
                  ...editedStats,
                  mana: Math.min(100, Math.max(0, parseInt(e.target.value) || 0))
                })}
                className="w-20 h-6 text-right"
              />
            ) : (
              <span>{gameState.stats.mana}/100</span>
            )}
          </div>
          <Progress value={isEditing ? editedStats.mana : gameState.stats.mana} className="h-2" />
        </div>

        <div className="flex justify-between items-center">
          <span className="text-sm">{t("game.stats.level")}</span>
          {isEditing ? (
            <Input
              type="number"
              min="1"
              value={editedStats.level}
              onChange={(e) => setEditedStats({
                ...editedStats,
                level: Math.max(1, parseInt(e.target.value) || 1)
              })}
              className="w-20 h-6 text-right"
            />
          ) : (
            <span className="text-2xl font-bold">{gameState.stats.level}</span>
          )}
        </div>
      </CardContent>
    </Card>
  );
}