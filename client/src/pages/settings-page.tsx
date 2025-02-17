import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useTranslation } from "react-i18next";
import { SideMenu } from "@/components/layout/side-menu";
import { Header } from "@/components/layout/header";

export default function SettingsPage() {
  const { t, i18n } = useTranslation();

  return (
    <div className="min-h-screen bg-background flex">
      <SideMenu />

      <div className="flex-1 flex flex-col">
        <Header />

        <main className="flex-1 container mx-auto px-4 py-8">
          <h1 className="text-2xl font-bold mb-6">
            {t("settings.title", "Réglages")}
          </h1>
          <div className="space-y-4 max-w-2xl">
            <Card>
              <CardHeader>
                <CardTitle>{t("settings.language", "Langue")}</CardTitle>
              </CardHeader>
              <CardContent>
                <Select
                  defaultValue={i18n.language}
                  onValueChange={(value) => i18n.changeLanguage(value)}
                >
                  <SelectTrigger>
                    <SelectValue
                      placeholder={t(
                        "settings.selectLanguage",
                        "Sélectionner une langue"
                      )}
                    />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="fr">Français</SelectItem>
                    <SelectItem value="en">English</SelectItem>
                  </SelectContent>
                </Select>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>
                  {t("settings.notifications", "Notifications")}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label htmlFor="game-notifications">
                    {t("settings.gameNotifications", "Notifications de jeu")}
                  </Label>
                  <Switch id="game-notifications" />
                </div>
                <div className="flex items-center justify-between">
                  <Label htmlFor="sound-effects">
                    {t("settings.soundEffects", "Effets sonores")}
                  </Label>
                  <Switch id="sound-effects" />
                </div>
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    </div>
  );
}
