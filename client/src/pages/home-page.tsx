import { useEffect, useState } from "react";
import { SideMenu } from "@/components/layout/side-menu";
import { Header } from "@/components/layout/header";
import { ChatInterface } from "@/components/chat/chat-interface";
import { CharacterStats } from "@/components/game/character-stats";
import { EventLog } from "@/components/game/event-log";
import { apiRequest } from "@/lib/queryClient";
import { SavedConversation } from "@/types/chat";
import { useLocation } from "wouter";

// Simplifié - plus besoin de gérer le gameId
export default function HomePage() {
  return (
    <>
      <SideMenu />
      <div className="min-h-screen bg-screen">
        <div className="flex flex-col h-screen">
          <Header />
          <main className="flex-1 container mx-auto p-4">
            <div className="grid grid-cols-1 md:grid-cols-[1fr_300px] gap-4">
              <ChatInterface />
              <div className="space-y-4">
                <CharacterStats />
                <EventLog />
              </div>
            </div>
          </main>
        </div>
      </div>
    </>
  );
}
