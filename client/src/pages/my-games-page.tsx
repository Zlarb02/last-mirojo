import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { useTranslation } from "react-i18next";
import { SideMenu } from "@/components/layout/side-menu";
import { Header } from "@/components/layout/header";
import { useGames } from "@/hooks/use-games";
import { Loader2, Trash2, Edit2, Plus } from "lucide-react";
import { navigate } from "wouter/use-browser-location";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { ScrollArea } from "@/components/ui/scroll-area";
import { AIMessage } from "@/components/chat/ai-message";
import { Input } from "@/components/ui/input";

export default function MyGamesPage() {
  const { t } = useTranslation();
  const { games, isLoading, error, refetch } = useGames();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const deleteMutation = useMutation({
    mutationFn: async (gameId: string) => {
      await apiRequest("DELETE", `/api/games/${gameId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["games"] });
      toast({
        title: t("success"),
        description: t("myGames.deleted"),
      });
    },
    onError: (error) => {
      console.error("Failed to delete game:", error);
      toast({
        title: t("error"),
        description: t("myGames.deleteFailed"),
        variant: "destructive",
      });
    },
  });

  const renameMutation = useMutation({
    mutationFn: async ({
      gameId,
      name,
      description,
    }: {
      gameId: string;
      name: string;
      description: string;
    }) => {
      await apiRequest("PATCH", `/api/games/${gameId}/name`, {
        name,
        description,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["games"] });
      toast({
        title: t("success"),
        description: t("myGames.renamed"),
      });
    },
    onError: (error) => {
      console.error("Failed to rename game:", error);
      toast({
        title: t("error"),
        description: t("myGames.renameFailed"),
        variant: "destructive",
      });
    },
  });

  const updateDescriptionMutation = useMutation({
    mutationFn: async ({
      gameId,
      description,
    }: {
      gameId: string;
      description: string;
    }) => {
      await apiRequest("PATCH", `/api/games/${gameId}/description`, {
        description,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["games"] });
      toast({
        title: t("success"),
        description: t("myGames.descriptionUpdated"),
      });
    },
    onError: (error) => {
      console.error("Failed to update description:", error);
      toast({
        title: t("error"),
        description: t("myGames.descriptionUpdateFailed"),
        variant: "destructive",
      });
    },
  });

  const handleDeleteGame = async (gameId: string) => {
    deleteMutation.mutate(gameId);
  };

  const handleRenameGame = async (
    gameId: string,
    name: string,
    description: string
  ) => {
    renameMutation.mutate({ gameId, name, description });
  };

  const handleUpdateDescription = async (
    gameId: string,
    description: string
  ) => {
    updateDescriptionMutation.mutate({ gameId, description });
  };

  function formatDateTime(dateString: string | Date | undefined | null) {
    if (!dateString) {
      return t("myGames.invalidDate");
    }

    try {
      // Convert the timestamp to a Date object
      const date = new Date(dateString);

      // Return early if invalid date
      if (isNaN(date.getTime())) {
        console.warn("Invalid date received:", dateString);
        return t("myGames.invalidDate");
      }

      return new Intl.DateTimeFormat("fr-FR", {
        year: "numeric",
        month: "long",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      }).format(date);
    } catch (error) {
      console.error("Error formatting date:", error);
      return t("myGames.invalidDate");
    }
  }

  return (
    <div className="min-h-screen bg-background flex">
      <SideMenu />

      <div className="flex-1 flex flex-col">
        <Header />
        <div className="container mx-auto">
          <h1 className="text-2xl font-bold mb-6 p-4">
            {t("myGames.title", "Mes parties")}
          </h1>

          {isLoading && (
            <div className="flex justify-center">
              <Loader2 className="h-6 w-6 animate-spin" />
            </div>
          )}

          {error && (
            <div className="text-red-500 text-center">
              {t("myGames.error", "Erreur lors du chargement des parties")}
            </div>
          )}

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 p-4">
            {games.map((game) => (
              <Card key={game.id}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <CardTitle>
                        {game.name ||
                          t("myGames.untitledGame", "Partie sans nom")}
                      </CardTitle>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-4 w-4 p-0"
                          >
                            <Edit2 className="h-4 w-4" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>
                              {t("myGames.rename")}
                            </AlertDialogTitle>
                          </AlertDialogHeader>
                          <div className="space-y-4">
                            <div className="space-y-2">
                              <Input
                                defaultValue={game.name}
                                placeholder={t("myGames.renamePlaceholder")}
                                id={`rename-${game.id}`}
                              />
                            </div>
                          </div>
                          <AlertDialogFooter>
                            <AlertDialogCancel>
                              {t("common.cancel")}
                            </AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => {
                                const nameInput = document.getElementById(
                                  `rename-${game.id}`
                                ) as HTMLInputElement;
                                handleRenameGame(
                                  game.id,
                                  nameInput.value,
                                  game.description
                                );
                              }}
                            >
                              {t("common.save")}
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </div>
                  <CardDescription>
                    <span className="block space-y-1">
                      <span className="block">
                        {t("myGames.created", "Créée le")}{" "}
                        {formatDateTime(game.createdAt)}
                      </span>
                      <span className="block">
                        {t("myGames.lastPlayed", "Dernière modification le")}{" "}
                        {formatDateTime(game.updatedAt)}
                      </span>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <span className="block mt-2 flex items-center gap-2 cursor-pointer hover:opacity-80">
                            {game.description ? (
                              <>
                                <Edit2 className="h-4 w-4 text-muted-foreground" />
                                <span className="text-sm text-muted-foreground">
                                  {game.description}
                                </span>
                              </>
                            ) : (
                              <>
                                <Plus className="h-4 w-4 text-muted-foreground" />
                                <span className="text-sm text-muted-foreground italic">
                                  {t(
                                    "myGames.noDescription",
                                    "Ajouter une description"
                                  )}
                                </span>
                              </>
                            )}
                          </span>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>
                              {t(
                                "myGames.editDescription",
                                "Modifier la description"
                              )}
                            </AlertDialogTitle>
                          </AlertDialogHeader>
                          <div className="space-y-4">
                            <div className="space-y-2">
                              <Input
                                defaultValue={game.description}
                                placeholder={t(
                                  "myGames.descriptionPlaceholder"
                                )}
                                id={`description-${game.id}`}
                              />
                            </div>
                          </div>
                          <AlertDialogFooter>
                            <AlertDialogCancel>
                              {t("common.cancel")}
                            </AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => {
                                const descInput = document.getElementById(
                                  `description-${game.id}`
                                ) as HTMLInputElement;
                                handleUpdateDescription(
                                  game.id,
                                  descInput.value
                                );
                              }}
                            >
                              {t("common.save")}
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </span>
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <ScrollArea className="h-[150px] w-full pr-4">
                    <div className="space-y-4">
                      {game.conversation.messages.map((message, index) => (
                        <div
                          key={index}
                          className={`flex ${
                            message.role === "user"
                              ? "justify-end"
                              : "justify-start"
                          }`}
                        >
                          <div
                            className={`max-w-[90%] rounded-lg px-4 py-2 ${
                              message.role === "user"
                                ? "bg-primary text-primary-foreground"
                                : "bg-muted"
                            }`}
                          >
                            {message.role === "assistant" ? (
                              <AIMessage content={message.content} />
                            ) : (
                              <div>{message.content}</div>
                            )}
                            {message.timestamp && (
                              <div className="text-xs opacity-50 mt-1">
                                {new Date(
                                  message.timestamp
                                ).toLocaleTimeString()}
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                  <div className="flex gap-2">
                    <Button
                      className="flex-1"
                      onClick={() => navigate(`/?gameId=${game.id}`)}
                    >
                      {t("myGames.continue", "Reprendre")}
                    </Button>

                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="destructive" size="icon">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>
                            {t("myGames.deleteTitle")}
                          </AlertDialogTitle>
                          <AlertDialogDescription>
                            {t("myGames.deleteDescription")}
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>
                            {t("common.cancel")}
                          </AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => handleDeleteGame(game.id)}
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                          >
                            {t("common.delete")}
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </CardContent>
              </Card>
            ))}

            <Card>
              <CardHeader>
                <CardTitle>{t("myGames.newGame", "Nouvelle partie")}</CardTitle>
                <CardDescription>
                  {t("myGames.startNew", "Commencer une nouvelle aventure")}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => navigate("/new-game")}
                >
                  {t("myGames.create", "Créer")}
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
