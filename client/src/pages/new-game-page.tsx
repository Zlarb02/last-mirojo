import { ChatInterface } from "@/components/chat/chat-interface";
import { CharacterStats } from "@/components/game/character-stats";
import { EventLog } from "@/components/game/event-log";
import { SideMenu } from "@/components/layout/side-menu";
import { Header } from "@/components/layout/header";

export default function NewGamePage() {
  return (
    <>
      <SideMenu />
      <div className="min-h-screen bg-screen flex flex-col">
        <div className="flex-1 flex flex-col">
          <Header />
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
    </>
  );
}
