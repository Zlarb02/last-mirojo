import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { useTranslation } from "react-i18next";
import { ChatInterface } from "@/components/chat/chat-interface";
import { CharacterStats } from "@/components/game/character-stats";
import { EventLog } from "@/components/game/event-log";
import { LanguageSwitcher } from "@/components/layout/language-switcher";
import { SideMenu } from "@/components/layout/side-menu";

export default function HomePage() {
  const { logoutMutation } = useAuth();
  const { t } = useTranslation();

  return (
    <div className="min-h-screen bg-background flex">
      <SideMenu />

      <div className="flex-1 flex flex-col">
        <header className="border-b">
          <div className="container mx-auto px-4 py-4 flex justify-between items-center">
            <h1 className="text-2xl font-bold">{t("app.title")}</h1>
            <div className="flex items-center gap-4">
              <LanguageSwitcher />
              <Button variant="outline" onClick={() => logoutMutation.mutate()}>
                {t("auth.logout")}
              </Button>
            </div>
          </div>
        </header>

        <main className="flex-1 container mx-auto px-4 py-8">
          <div className="grid lg:grid-cols-[1fr_300px] gap-8">
            <div className="space-y-8">
              <ChatInterface />
            </div>
            <div className="space-y-8">
              <CharacterStats />
              <EventLog />
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}