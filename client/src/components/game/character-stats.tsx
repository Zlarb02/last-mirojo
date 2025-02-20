import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useTranslation } from "react-i18next";
import { useGameState, type Stat } from "@/hooks/use-game-state";
import { useToast } from "@/hooks/use-toast";
import { Activity, User, Book, Backpack, Trash2 } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { StatDisplay } from "./stat-display";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface EditedState {
  stats: Stat[];
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
  inventory: string[];
}

export function CharacterStats() {
  const { t } = useTranslation();
  const { toast } = useToast();
  const { gameState, updateGameState } = useGameState();
  const [isEditing, setIsEditing] = useState(false);
  const [editedStats, setEditedStats] = useState<EditedState>({
    stats: gameState.stats,
    characterName: gameState.characterName || "",
    characterDescription: gameState.characterDescription || "",
    mainQuest: gameState.mainQuest || {
      title: "",
      description: "",
      status: "active",
    },
    sideQuests: gameState.sideQuests || [],
    inventory: gameState.inventory || [],
  });

  useEffect(() => {
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
      inventory: gameState.inventory || [],
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
      inventory: gameState.inventory || [],
    });
  };

  const handleSave = async () => {
    try {
      if (!gameId) {
        toast({
          title: t("error"),
          description: t("game.stats.noGameId"),
          variant: "destructive",
        });
        return;
      }

      const success = await updateGameState(gameId, editedStats);

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

  const handleAddStat = () => {
    setEditedStats({
      ...editedStats,
      stats: [...editedStats.stats, {
        name: t("game.stats.newStat"),
        value: 0,
        config: {
          type: "number",
          color: "#3b82f6", // Toujours fournir une couleur par défaut
          max: 100
        }
      }]
    });
  };

  return (
    <Tabs defaultValue="stats" className="space-y-4">
      <TabsList className="grid w-full grid-cols-4 gap-4 bg-background p-1">
        <TabsTrigger
          value="character"
          className="transition-all data-[state=active]:scale-150"
        >
          <User className="h-4 w-4 transition-all data-[state=active]:text-primary" />
        </TabsTrigger>
        <TabsTrigger
          value="stats"
          className="transition-all data-[state=active]:scale-150"
        >
          <Activity className="h-4 w-4 transition-all data-[state=active]:text-primary" />
        </TabsTrigger>
        <TabsTrigger
          value="inventory"
          className="transition-all data-[state=active]:scale-150"
        >
          <Backpack className="h-4 w-4 transition-all data-[state=active]:text-primary" />
        </TabsTrigger>
        <TabsTrigger
          value="quests"
          className="transition-all data-[state=active]:scale-150"
        >
          <Book className="h-4 w-4 transition-all data-[state=active]:text-primary" />
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
            {isEditing && (
              <Button onClick={handleAddStat} variant="outline">
                {t("game.stats.addStat")}
              </Button>
            )}
          </CardHeader>
          <CardContent className="space-y-4">
            {editedStats.stats.map((stat, index) => (
              <div key={index} className="space-y-2">
                {isEditing ? (
                  <div className="space-y-2 p-4 border rounded-lg">
                    <div className="flex justify-between items-center">
                      <Input
                        value={stat.name}
                        onChange={(e) => {
                          const newStats = [...editedStats.stats];
                          newStats[index] = { ...stat, name: e.target.value };
                          setEditedStats({ ...editedStats, stats: newStats });
                        }}
                        placeholder={t("game.stats.statName")}
                        className="flex-1 mr-2"
                      />
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          const newStats = editedStats.stats.filter((_, i) => i !== index);
                          setEditedStats({ ...editedStats, stats: newStats });
                        }}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>

                    <Select
                      value={stat.config.type}
                      onValueChange={(value: 'progress' | 'number' | 'text') => {
                        const newStats = [...editedStats.stats];
                        newStats[index] = {
                          ...stat,
                          config: { 
                            ...stat.config, 
                            type: value,
                            max: value === 'progress' ? 100 : undefined,
                            color: value === 'progress' ? '#000000' : undefined
                          }
                        };
                        setEditedStats({ ...editedStats, stats: newStats });
                      }}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder={t("game.stats.type")} />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="progress">{t("game.stats.typeProgress")}</SelectItem>
                        <SelectItem value="number">{t("game.stats.typeNumber")}</SelectItem>
                        <SelectItem value="text">{t("game.stats.typeText")}</SelectItem>
                      </SelectContent>
                    </Select>

                    {stat.config.type === 'progress' && (
                      <div className="space-y-2">
                        <Input
                          type="number"
                          min="0"
                          value={stat.config.max}
                          onChange={(e) => {
                            const newStats = [...editedStats.stats];
                            newStats[index] = {
                              ...stat,
                              config: { ...stat.config, max: Number(e.target.value) }
                            };
                            setEditedStats({ ...editedStats, stats: newStats });
                          }}
                          placeholder={t("game.stats.maxValue")}
                        />
                        <div className="flex items-center gap-2">
                          <span className="text-sm">{t("game.stats.color")}:</span>
                          <Input
                            type="color"
                            value={stat.config.color}
                            onChange={(e) => {
                              const newStats = [...editedStats.stats];
                              newStats[index] = {
                                ...stat,
                                config: { ...stat.config, color: e.target.value }
                              };
                              setEditedStats({ ...editedStats, stats: newStats });
                            }}
                            className="w-20 h-8 p-1"
                          />
                        </div>
                      </div>
                    )}

                    <Input
                      type={stat.config.type === 'number' ? 'number' : 'text'}
                      value={stat.value}
                      onChange={(e) => {
                        const newStats = [...editedStats.stats];
                        newStats[index] = {
                          ...stat,
                          value: stat.config.type === 'number' 
                            ? Number(e.target.value)
                            : e.target.value
                        };
                        setEditedStats({ ...editedStats, stats: newStats });
                      }}
                      placeholder={t("game.stats.value")}
                    />
                  </div>
                ) : (
                  <StatDisplay stat={stat} />
                )}
              </div>
            ))}
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
              <label className="text-sm font-medium">{t("game.character.name")}</label>
              {isEditing ? (
                <Input
                  value={editedStats.characterName}
                  onChange={(e) =>
                    setEditedStats({
                      ...editedStats,
                      characterName: e.target.value,
                    })
                  }
                  placeholder={t("game.character.name")}
                />
              ) : (
                <p className="text-sm">
                  {gameState.characterName || t("game.character.noName")}
                </p>
              )}
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">{t("game.character.description")}</label>
              {isEditing ? (
                <Textarea
                  value={editedStats.characterDescription}
                  onChange={(e) =>
                    setEditedStats({
                      ...editedStats,
                      characterDescription: e.target.value,
                    })
                  }
                  placeholder={t("game.character.description")}
                />
              ) : (
                <p className="text-sm">
                  {gameState.characterDescription || t("game.character.noDescription")}
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
              <h3 className="font-medium">{t("game.quests.mainQuest")}</h3>
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
                    placeholder={t("game.quests.questTitle")}
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
                    placeholder={t("game.quests.questDescription")}
                  />
                </div>
              ) : (
                <div className="rounded-lg bg-muted p-4">
                  <h4 className="font-medium">
                    {gameState.mainQuest?.title || t("game.quests.noQuest")}
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
                    placeholder={t("game.inventory.newItem")}
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
                    {t("game.inventory.add")}
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
                            {t("common.delete")}
                          </Button>
                        </div>
                      )}
                    </div>
                  )
                )}
                {(isEditing ? editedStats.inventory : gameState.inventory)
                  .length === 0 && (
                  <p className="text-sm text-muted-foreground">
                    {t("game.inventory.empty")}
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
