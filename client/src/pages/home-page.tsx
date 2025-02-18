import { useEffect, useState } from "react";
import { ChatInterface } from "@/components/chat/chat-interface";
import { CharacterStats } from "@/components/game/character-stats";
import { EventLog } from "@/components/game/event-log";
import { SideMenu } from "@/components/layout/side-menu";
import { Header } from "@/components/layout/header";
import { apiRequest } from "@/lib/queryClient";
import type { SavedConversation } from "@/types/chat";

export default function HomePage() {
  const [savedConversation, setSavedConversation] = useState<
    SavedConversation | undefined
  >(undefined);

  useEffect(() => {
    const loadConversation = async () => {
      try {
        // Récupérer le gameId depuis l'URL
        const urlParams = new URLSearchParams(window.location.search);
        const gameId = urlParams.get("gameId");

        let res;
        if (gameId) {
          // Charger un jeu spécifique
          res = await apiRequest("GET", `/api/game/load/${gameId}`);
        } else {
          // Charger le dernier jeu si aucun ID n'est spécifié
          res = await apiRequest("GET", "/api/games/last");
        }

        if (!res.ok) throw new Error("Failed to fetch conversation");

        const data = await res.json();
        setSavedConversation(data.conversation || undefined);
      } catch (error) {
        console.error("Failed to load conversation:", error);
      }
    };

    loadConversation();
  }, [window.location.search]); // Dépendance à l'URL pour détecter les changements

  return (
    <div className="min-h-screen bg-background flex">
      <SideMenu />

      <div className="flex-1 flex flex-col">
        <Header />

        <main className="flex-1 container mx-auto px-4 py-8">
          <div className="grid lg:grid-cols-[1fr_300px] gap-8">
            <div className="space-y-8">
              <ChatInterface initialConversation={savedConversation} />
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
