import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useTranslation } from "react-i18next";
import { SideMenu } from "@/components/layout/side-menu";
import { Header } from "@/components/layout/header";
import { useGames } from '@/hooks/use-games';
import { Loader2 } from 'lucide-react';
import { navigate } from "wouter/use-browser-location";

export default function MyGamesPage() {
  const { t } = useTranslation();
  const { games, isLoading, error } = useGames();

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
                  <CardDescription>
                    {t("myGames.lastPlayed", "Dernière partie le")}{" "}
                    {new Date(game.saved_at).toLocaleDateString()}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="mb-4 text-sm text-muted-foreground line-clamp-2">
                    {game.conversation.messages[game.conversation.messages.length - 1]?.content || t("myGames.noMessages")}
                  </p>
                  <Button 
                    className="w-full"
                    onClick={() => navigate('/')}
                  >
                    {t("myGames.continue", "Continuer")}
                  </Button>
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
                  onClick={() => navigate('/new-game')}
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
