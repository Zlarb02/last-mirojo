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
import { Loader2, Trash2 } from "lucide-react";
import { navigate } from "wouter/use-browser-location";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

export default function MyGamesPage() {
  const { t } = useTranslation();
  const { games, isLoading, error, refetch } = useGames();
  const { toast } = useToast();

  const handleDeleteGame = async (gameId: number) => {
    try {
      const res = await apiRequest("DELETE", `/api/games/${gameId}`);
      if (!res.ok) throw new Error("Failed to delete game");

      await refetch();
      toast({
        title: t("success"),
        description: t("myGames.deleted"),
      });
    } catch (error) {
      console.error("Failed to delete game:", error);
      toast({
        title: t("error"),
        description: t("myGames.deleteFailed"),
        variant: "destructive",
      });
    }
  };

  function formatDateTime(dateString: string) {
    try {
      const date = new Date(dateString);
      return new Intl.DateTimeFormat("fr-FR", {
        year: "numeric",
        month: "long",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      }).format(date);
    } catch (error) {
      console.error("Error formatting date:", error);
      return "Date invalide";
    }
  }

  return (
    <div className="min-h-screen bg-background flex">
      <SideMenu />

      <div className="flex-1 flex flex-col">
        <Header />
        <div className="container mx-auto">
          <h1 className="text-2xl font-bold mb-6">
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

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {games.map((game) => (
              <Card key={game.id}>
                <CardHeader>
                  <CardTitle>
                    {t("myGames.savedGame", "Partie sauvegardée")}
                  </CardTitle>
                  <CardDescription className="space-y-1">
                    <p>
                      {t("myGames.created", "Créée le")}{" "}
                      {formatDateTime(game.created_at)}
                    </p>
                    <p>
                      {t("myGames.lastPlayed", "Dernière modification le")}{" "}
                      {formatDateTime(game.updated_at)}
                    </p>
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="mb-4 text-sm text-muted-foreground line-clamp-2">
                    {game.conversation.messages[
                      game.conversation.messages.length - 1
                    ]?.content || t("myGames.noMessages")}
                  </p>
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
