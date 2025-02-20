import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useTranslation } from "react-i18next";
import { useGameState } from "@/hooks/use-game-state";
import { useToast } from "@/hooks/use-toast";
import {
  Activity,
  Heart,
  Atom,
  Star,
  User,
  Book,
  Backpack,
} from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface EditedState {
  stats: {
    health: number;
    mana: number;
    level: number;
  };
  characterName: string;
  characterDescription: string;
  mainQuest: {
    title: string;
    description: string;
    status: "active" | "completed";
  };
  sideQuests: Array<{
    title: string;
    description: string;
    status: "active" | "completed";
  }>;
  inventory: string[]; // Ajout de l'inventaire
}

export function CharacterStats() {
  const { t } = useTranslation();
  const { toast } = useToast();
  const { gameState, updateGameState } = useGameState();
  const [isEditing, setIsEditing] = useState(false);
  const [editedStats, setEditedStats] = useState<EditedState>({
    stats: {
      health: gameState.stats.health,
      mana: gameState.stats.mana,
      level: gameState.stats.level,
    },
    characterName: gameState.characterName || "",
    characterDescription: gameState.characterDescription || "",
    mainQuest: gameState.mainQuest || {
      title: "",
      description: "",
      status: "active",
    },
    sideQuests: gameState.sideQuests || [],
    inventory: gameState.inventory || [], // Ajout de l'inventaire
  });

  useEffect(() => {
    setEditedStats({
      stats: {
        health: gameState.stats.health,
        mana: gameState.stats.mana,
        level: gameState.stats.level,
      },
      characterName: gameState.characterName || "",
      characterDescription: gameState.characterDescription || "",
      mainQuest: gameState.mainQuest || {
        title: "",
        description: "",
        status: "active",
      },
      sideQuests: gameState.sideQuests || [],
      inventory: gameState.inventory || [], // Ajout de l'inventaire
    });
  }, [gameState]);

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
    setEditedStats({
      stats: gameState.stats,
      characterName: gameState.characterName || "",
      characterDescription: gameState.characterDescription || "",
      mainQuest: gameState.mainQuest || {
        title: "",
        description: "",
        status: "active",
      },
      sideQuests: gameState.sideQuests || [],
      inventory: gameState.inventory || [], // Ajout de l'inventaire
    });
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
        stats: editedStats.stats,
        characterName: editedStats.characterName,
        characterDescription: editedStats.characterDescription,
        mainQuest: editedStats.mainQuest,
        sideQuests: editedStats.sideQuests,
        inventory: editedStats.inventory, // Assurez-vous que l'inventaire est inclus
        eventLog: gameState.eventLog,
      });

      if (success) {
        setIsEditing(false);
        toast({
          title: t("success"),
          description: t("game.stats.updated"),
        });
      }
    } catch (error) {
      console.error("Failed to update game state:", error);
      toast({
        title: t("error"),
        description: t("game.stats.updateFailed"),
        variant: "destructive",
      });
    }
  };
  let number: number = 50;
  return (
    <Tabs defaultValue="stats" className="space-y-4">
      <TabsList className="grid w-full grid-cols-4 gap-4 bg-background p-1">
        <TabsTrigger
          value="stats"
          className="transition-all data-[state=active]:scale-150"
        >
          <Activity className="h-4 w-4 transition-all data-[state=active]:text-primary" />
        </TabsTrigger>
        <TabsTrigger
          value="character"
          className="transition-all data-[state=active]:scale-150"
        >
          <User className="h-4 w-4 transition-all data-[state=active]:text-primary" />
        </TabsTrigger>
        <TabsTrigger
          value="quests"
          className="transition-all data-[state=active]:scale-150"
        >
          <Book className="h-4 w-4 transition-all data-[state=active]:text-primary" />
        </TabsTrigger>
        <TabsTrigger
          value="inventory"
          className="transition-all data-[state=active]:scale-150"
        >
          <Backpack className="h-4 w-4 transition-all data-[state=active]:text-primary" />
        </TabsTrigger>
      </TabsList>

      <TabsContent value="stats">
        <Card>
          <CardHeader className="flex flex-col gap-4 items-center justify-between">
            <div className="flex items-center gap-2">
              <Activity className="h-4 w-4" />
              <CardTitle>{t("game.stats.title")}</CardTitle>
            </div>
            {!isEditing ? (
              <Button variant="outline" size="sm" onClick={handleEdit}>
                {t("game.stats.edit")}
              </Button>
            ) : (
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={handleCancel}>
                  {t("common.cancel")}
                </Button>
                <Button variant="outline" size="sm" onClick={handleSave}>
                  {t("common.save")}
                </Button>
              </div>
            )}
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <div className="flex items-center gap-2">
                  <Heart className="h-4 w-4 text-red-500" />
                  <span>{t("game.stats.health")}</span>
                </div>
                {isEditing ? (
                  <Input
                    type="number"
                    min="0"
                    max="100"
                    value={editedStats.stats.health}
                    onChange={(e) =>
                      setEditedStats({
                        ...editedStats,
                        stats: {
                          ...editedStats.stats,
                          health: Math.min(
                            100,
                            Math.max(0, parseInt(e.target.value) || 0)
                          ),
                        },
                      })
                    }
                    className="w-20 h-6 text-right"
                  />
                ) : (
                  <span>{gameState.stats.health}/100</span>
                )}
              </div>
              <Progress
                value={
                  isEditing ? editedStats.stats.health : gameState.stats.health
                }
                className="h-2 bg-red-100"
                indicatorClassName="bg-red-500"
              />
            </div>

            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <div className="flex items-center gap-2">
                  <Atom className="h-4 w-4 text-blue-500" />
                  <span>{t("game.stats.mana")}</span>
                </div>
                {isEditing ? (
                  <Input
                    type="number"
                    min="0"
                    max="100"
                    value={editedStats.stats.mana}
                    onChange={(e) =>
                      setEditedStats({
                        ...editedStats,
                        stats: {
                          ...editedStats.stats,
                          mana: Math.min(
                            100,
                            Math.max(0, parseInt(e.target.value) || 0)
                          ),
                        },
                      })
                    }
                    className="w-20 h-6 text-right"
                  />
                ) : (
                  <span>{gameState.stats.mana}/100</span>
                )}
              </div>
              <Progress
                value={
                  isEditing ? editedStats.stats.mana : gameState.stats.mana
                }
                className="h-2 bg-blue-100"
                indicatorClassName="bg-blue-500"
              />
            </div>

            <div className="flex justify-between items-center">
              <div className="flex items-center gap-2">
                <Star className="h-4 w-4 text-yellow-500" />
                <span className="text-sm">{t("game.stats.level")}</span>
              </div>
              {isEditing ? (
                <Input
                  type="number"
                  min="1"
                  value={editedStats.stats.level}
                  onChange={(e) =>
                    setEditedStats({
                      ...editedStats,
                      stats: {
                        ...editedStats.stats,
                        level: Math.max(1, parseInt(e.target.value) || 1),
                      },
                    })
                  }
                  className="w-20 h-6 text-right"
                />
              ) : (
                <span className="text-2xl font-bold">
                  {gameState.stats.level}
                </span>
              )}
            </div>
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="character">
        <Card>
          <CardHeader className="flex flex-col gap-4 items-center justify-between">
            <div className="flex items-center gap-2">
              <User className="h-4 w-4" />
              <CardTitle>{t("game.character.title")}</CardTitle>
            </div>
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
              <label className="text-sm font-medium">Nom du personnage</label>
              {isEditing ? (
                <Input
                  value={editedStats.characterName}
                  onChange={(e) =>
                    setEditedStats({
                      ...editedStats,
                      characterName: e.target.value,
                    })
                  }
                  placeholder="Nom du personnage"
                />
              ) : (
                <p className="text-sm">
                  {gameState.characterName || "Sans nom"}
                </p>
              )}
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Description</label>
              {isEditing ? (
                <Textarea
                  value={editedStats.characterDescription}
                  onChange={(e) =>
                    setEditedStats({
                      ...editedStats,
                      characterDescription: e.target.value,
                    })
                  }
                  placeholder="Description du personnage"
                />
              ) : (
                <p className="text-sm">
                  {gameState.characterDescription || "Aucune description"}
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="quests">
        <Card>
          <CardHeader className="flex flex-col gap-4 items-center justify-between">
            <div className="flex items-center gap-2">
              <Book className="h-4 w-4" />
              <CardTitle>{t("game.quests.title")}</CardTitle>
            </div>
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
              <h3 className="font-medium">Quête principale</h3>
              {isEditing ? (
                <div className="space-y-2">
                  <Input
                    value={editedStats.mainQuest.title}
                    onChange={(e) =>
                      setEditedStats({
                        ...editedStats,
                        mainQuest: {
                          ...editedStats.mainQuest,
                          title: e.target.value,
                        },
                      })
                    }
                    placeholder="Titre de la quête"
                  />
                  <Textarea
                    value={editedStats.mainQuest.description}
                    onChange={(e) =>
                      setEditedStats({
                        ...editedStats,
                        mainQuest: {
                          ...editedStats.mainQuest,
                          description: e.target.value,
                        },
                      })
                    }
                    placeholder="Description de la quête"
                  />
                </div>
              ) : (
                <div className="rounded-lg bg-muted p-4">
                  <h4 className="font-medium">
                    {gameState.mainQuest?.title || "Aucune quête"}
                  </h4>
                  <p className="text-sm mt-2">
                    {gameState.mainQuest?.description}
                  </p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="inventory">
        <Card>
          <CardHeader className="flex flex-col gap-4 items-center justify-between">
            <div className="flex items-center gap-2">
              <Backpack className="h-4 w-4" />
              <CardTitle>{t("game.inventory.title")}</CardTitle>
            </div>
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
          <CardContent>
            <div className="space-y-4">
              {isEditing && (
                <div className="flex gap-2">
                  <Input
                    placeholder="Nouvel item"
                    onKeyPress={(e) => {
                      if (e.key === "Enter") {
                        const input = e.currentTarget;
                        if (input.value.trim()) {
                          setEditedStats({
                            ...editedStats,
                            inventory: [
                              ...editedStats.inventory,
                              input.value.trim(),
                            ],
                          });
                          input.value = "";
                        }
                      }
                    }}
                  />
                  <Button
                    variant="outline"
                    onClick={(e) => {
                      const input = e.currentTarget
                        .previousElementSibling as HTMLInputElement;
                      if (input.value.trim()) {
                        setEditedStats({
                          ...editedStats,
                          inventory: [
                            ...editedStats.inventory,
                            input.value.trim(),
                          ],
                        });
                        input.value = "";
                      }
                    }}
                  >
                    Ajouter
                  </Button>
                </div>
              )}
              <div className="space-y-2">
                {(isEditing ? editedStats.inventory : gameState.inventory).map(
                  (item, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-2 rounded-lg bg-muted"
                    >
                      {isEditing ? (
                        <Input
                          value={item}
                          onChange={(e) => {
                            const newInventory = [...editedStats.inventory];
                            newInventory[index] = e.target.value;
                            setEditedStats({
                              ...editedStats,
                              inventory: newInventory,
                            });
                          }}
                          className="w-full mr-2"
                        />
                      ) : (
                        <span>{item}</span>
                      )}
                      {isEditing && (
                        <div className="flex gap-2 flex-shrink-0">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              setEditedStats({
                                ...editedStats,
                                inventory: editedStats.inventory.filter(
                                  (_, i) => i !== index
                                ),
                              });
                            }}
                            className="text-destructive hover:text-destructive"
                          >
                            Supprimer
                          </Button>
                        </div>
                      )}
                    </div>
                  )
                )}
                {(isEditing ? editedStats.inventory : gameState.inventory)
                  .length === 0 && (
                  <p className="text-sm text-muted-foreground">
                    Inventaire vide
                  </p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  );
}
