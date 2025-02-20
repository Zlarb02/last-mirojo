import { useTranslation } from "react-i18next";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Bell, BellRing } from "lucide-react";

export function NotificationSettings() {
  const { t } = useTranslation();
  const [gameNotifs, setGameNotifs] = useState(false);
  const [soundEffects, setSoundEffects] = useState(false);
  const [permission, setPermission] = useState<NotificationPermission | null>(null);

  useEffect(() => {
    setGameNotifs(localStorage.getItem("game-notifications") === "true");
    setSoundEffects(localStorage.getItem("sound-effects") === "true");
    setPermission(Notification.permission);
  }, []);

  const requestPermission = async () => {
    try {
      const result = await Notification.requestPermission();
      setPermission(result);
      if (result === "granted") {
        setGameNotifs(true);
        localStorage.setItem("game-notifications", "true");
      }
    } catch (error) {
      console.error("Erreur lors de la demande de permission:", error);
    }
  };

  const handleGameNotifsChange = (checked: boolean) => {
    if (checked && permission !== "granted") {
      requestPermission();
    } else {
      setGameNotifs(checked);
      localStorage.setItem("game-notifications", checked.toString());
    }
  };

  const handleSoundEffectsChange = (checked: boolean) => {
    setSoundEffects(checked);
    localStorage.setItem("sound-effects", checked.toString());
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>{t("settings.notifications.title")}</CardTitle>
          <CardDescription>
            {permission === "default" && t("settings.notifications.permission")}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {permission === "default" ? (
            <Button 
              onClick={requestPermission}
              className="w-full"
              variant="outline"
            >
              <Bell className="mr-2 h-4 w-4" />
              {t("settings.notifications.enable")}
            </Button>
          ) : (
            <>
              <div className="flex items-center justify-between">
                <Label htmlFor="game-notifications">
                  {t("settings.gameNotifications")}
                </Label>
                <Switch
                  id="game-notifications"
                  checked={gameNotifs}
                  onCheckedChange={handleGameNotifsChange}
                  disabled={permission === "denied"}
                />
              </div>
              <div className="flex items-center justify-between">
                <Label htmlFor="sound-effects">
                  {t("settings.soundEffects")}
                </Label>
                <Switch
                  id="sound-effects"
                  checked={soundEffects}
                  onCheckedChange={handleSoundEffectsChange}
                />
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
