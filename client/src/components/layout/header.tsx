import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { useTranslation } from "react-i18next";
import { LanguageSwitcher } from "@/components/layout/language-switcher";
import { LogOut, Music2, Pin } from "lucide-react";
import { ThemeSwitcher } from "@/components/theme/theme-switcher";
import logoPath from "@/assets/logo.png";
import { MusicPlayer } from "@/components/player/music-player";
import { useState } from "react";

export function Header() {
  const { logoutMutation } = useAuth();
  const { t } = useTranslation();
  const [showMusicPlayer, setShowMusicPlayer] = useState(false);
  const [isPinned, setIsPinned] = useState(false);

  return (
    <>
      <header
        className={`border-b bg-muted/50 backdrop-blur  w-full ${
          isPinned ? "fixed top-0 left-0 z-50" : ""
        }`}
      >
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-2 ml-16 sm:mx-auto">
            <img
              src={logoPath}
              alt="Mirojo Logo"
              width={32}
              height={32}
              className="w-8 h-8 dark:invert"
            />
            <h1 className="text-2xl font-bold hidden sm:block">mirojo.app</h1>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setShowMusicPlayer(!showMusicPlayer)}
              title={t("player.music")}
            >
              <Music2 className="h-5 w-5" />
            </Button>
            <LanguageSwitcher />
            <ThemeSwitcher />
            <Button
              variant="ghost"
              size="icon"
              onClick={() => logoutMutation.mutate()}
              title={t("auth.logout")}
            >
              <LogOut className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </header>
      {isPinned && <div className="h-[72px]" />}
      {showMusicPlayer && (
        <MusicPlayer onClose={() => setShowMusicPlayer(false)} />
      )}
    </>
  );
}
