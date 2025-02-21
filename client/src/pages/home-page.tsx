import { useEffect, useState } from "react";
import { SideMenu } from "@/components/layout/side-menu";
import { Header } from "@/components/layout/header";
import { ChatInterface } from "@/components/chat/chat-interface";
import { apiRequest } from "@/lib/queryClient";
import { SavedConversation } from "@/types/chat";
import { useLocation } from "wouter";

export default function HomePage() {
  const [conversation, setConversation] = useState<SavedConversation | null>(null);
  const [location] = useLocation();
  const gameId = new URLSearchParams(location.split('?')[1]).get('gameId');

  useEffect(() => {
    if (gameId) {
      loadGameConversation(gameId);
    }
  }, [gameId]);

  const loadGameConversation = async (gameId: string) => {
    try {
      // Au lieu de '/api/game/load/:id', on utilise '/api/games/:id'
      const gameData = await apiRequest("GET", `/api/games/${gameId}`);
      if (gameData?.conversation) {
        setConversation(gameData.conversation);
      }
    } catch (error) {
      console.error("Failed to load game conversation:", error);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="flex h-screen">
        <SideMenu />
        <div className="flex-1 flex flex-col">
          <Header />
          <main className="flex-1 container mx-auto p-4">
            <ChatInterface 
              initialConversation={conversation || undefined} 
              gameId={gameId || undefined}
            />
          </main>
        </div>
      </div>
    </div>
  );
}
