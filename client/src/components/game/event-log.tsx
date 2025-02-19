import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useTranslation } from "react-i18next";
import { useGameState } from "@/hooks/use-game-state";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";
import { useState } from "react";

export function EventLog() {
  const { t } = useTranslation();
  const { gameState, updateGameState } = useGameState();
  const [isEditing, setIsEditing] = useState(false);

  const urlParams = new URLSearchParams(window.location.search);
  const gameId = urlParams.get("gameId");

  if (!gameId) return null;

  const handleClearLog = async () => {
    try {
      await updateGameState(gameId, {
        ...gameState,
        eventLog: []
      });
      setIsEditing(false);
    } catch (error) {
      console.error("Failed to clear event log:", error);
    }
  };

  const handleRemoveEvent = async (index: number) => {
    try {
      const newEventLog = gameState.eventLog.filter((_, i) => i !== index);
      await updateGameState(gameId, {
        ...gameState,
        eventLog: newEventLog
      });
    } catch (error) {
      console.error("Failed to remove event:", error);
    }
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>{t("game.events.title")}</CardTitle>
        <div className="flex gap-2">
          {gameState.eventLog.length > 0 && (
            <>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsEditing(!isEditing)}
              >
                {isEditing ? t("common.done") : t("common.edit")}
              </Button>
              {isEditing && (
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={handleClearLog}
                >
                  {t("common.clearAll")}
                </Button>
              )}
            </>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[200px] pr-4">
          {gameState.eventLog.length > 0 ? (
            <div className="space-y-2">
              {gameState.eventLog.map((event, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between text-sm p-2 rounded bg-muted"
                >
                  <span>{event}</span>
                  {isEditing && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleRemoveEvent(index)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">
              {t("game.events.empty")}
            </p>
          )}
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
