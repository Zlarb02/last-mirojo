import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useTranslation } from "react-i18next";
import Layout from "@/components/layout";

export default function MyGamesPage() {
  const { t } = useTranslation();

  return (
    <Layout>
      <div className="container mx-auto">
        <h1 className="text-2xl font-bold mb-6">{t('myGames.title', 'Mes parties')}</h1>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          <Card>
            <CardHeader>
              <CardTitle>{t('myGames.currentGame', 'Partie en cours')}</CardTitle>
              <CardDescription>
                {t('myGames.lastPlayed', 'Dernière partie le')} {new Date().toLocaleDateString()}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button className="w-full">
                {t('myGames.continue', 'Continuer')}
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>{t('myGames.newGame', 'Nouvelle partie')}</CardTitle>
              <CardDescription>
                {t('myGames.startNew', 'Commencer une nouvelle aventure')}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button variant="outline" className="w-full">
                {t('myGames.create', 'Créer')}
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </Layout>
  );
}