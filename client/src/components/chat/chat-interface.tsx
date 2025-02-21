import { useState, useEffect, useRef } from "react";
import { useTranslation } from "react-i18next";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Save, Send, Loader2, PowerIcon } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Message, SavedConversation } from "@/types/chat";
import { useGameState } from "@/hooks/use-game-state";
import { AIMessage } from "./ai-message";

interface ChatInterfaceProps {
  initialConversation?: SavedConversation;
}

export function ChatInterface({ initialConversation }: ChatInterfaceProps) {
  const { t } = useTranslation();
  const { toast } = useToast();
  const { gameState, updateGameState } = useGameState();
  const [messages, setMessages] = useState<Message[]>(
    () => initialConversation?.messages || []
  );
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [currentGameId, setCurrentGameId] = useState<number | undefined>(
    initialConversation?.id
  );
  const [autoSave, setAutoSave] = useState(false);
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (initialConversation?.messages) {
      setMessages(initialConversation.messages);
    }
  }, [initialConversation?.timestamp]); // Dépend du timestamp pour détecter les changements

  const handleResponse = async (response: string, currentState: any) => {
    // Extraire le message des balises <response>
    const messageMatch = response.match(/<response>([\s\S]*?)<\/response>/);
    if (!messageMatch)
      return { cleanResponse: response, updates: currentState };

    // Parser le contenu de la réponse
    const content = messageMatch[1];
    const healthMatch = content.match(/<health>(.*?)<\/health>/);
    const manaMatch = content.match(/<mana>(.*?)<\/mana>/);
    const levelMatch = content.match(/<level>(.*?)<\/level>/);

    // Créer les mises à jour en fonction des valeurs trouvées
    const updates = {
      stats: { ...currentState.stats },
      inventory: [...currentState.inventory],
      eventLog: [...currentState.eventLog],
    };

    if (healthMatch) updates.stats.health = parseInt(healthMatch[1]);
    if (manaMatch) updates.stats.mana = parseInt(manaMatch[1]);
    if (levelMatch) updates.stats.level = parseInt(levelMatch[1]);

    return { cleanResponse: response, updates };
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage: Message = {
      role: "user",
      content: input,
      timestamp: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    try {
      const lastMessages = messages.slice(-4);
      const contextMessages = [...lastMessages, userMessage];
      const urlParams = new URLSearchParams(window.location.search);
      const gameId = urlParams.get("gameId");

      let gameStateRes;
      if (gameId) {
        gameStateRes = await apiRequest("GET", `/api/game-state/${gameId}`);
      } else {
        gameStateRes = await apiRequest("GET", `/api/game-state`);
      }

      if (!gameStateRes.ok) throw new Error("Failed to fetch game state");
      const gameStateData = await gameStateRes.json();

      // Envoyer tout l'état du jeu à l'API chat
      const res = await apiRequest("POST", "/api/chat", {
        message: input,
        context: contextMessages,
        gameState: {
          ...gameStateData,
          characterName: gameState.characterName,
          characterDescription: gameState.characterDescription,
          mainQuest: gameState.mainQuest,
          sideQuests: gameState.sideQuests,
        },
        gameId,
      });

      if (!res.ok) throw new Error("Failed to get AI response");

      const data = await res.json();
      const { cleanResponse, updates } = await handleResponse(
        data.response,
        gameStateData
      );

      const assistantMessage: Message = {
        role: "assistant",
        content: cleanResponse,
        timestamp: new Date().toISOString(),
      };

      if (gameId) {
        await updateGameState(gameId, updates);
      }

      setMessages((prev) => [...prev, assistantMessage]);

      if (autoSave) {
        await handleSaveConversation(
          [...messages, userMessage, assistantMessage],
          true
        );
      }
    } catch (error) {
      console.error("Failed to get AI response:", error);
      toast({
        title: t("error"),
        description: t("game.chat.failed"),
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveConversation = async (
    messagesToSave = messages,
    isAutoSave = false
  ) => {
    if (messagesToSave.length === 0) return;

    try {
      const endpoint = "/api/game/save";
      const payload = {
        conversationId: currentGameId,
        conversation: {
          messages: messagesToSave,
          timestamp: new Date().toISOString(),
        },
        gameState: {
          stats: gameState.stats || [],
          inventory: Array.isArray(gameState.inventory) ? gameState.inventory : [],
          eventLog: Array.isArray(gameState.eventLog) ? gameState.eventLog : [],
          characterName: gameState.characterName || "",
          characterDescription: gameState.characterDescription || "",
          mainQuest: gameState.mainQuest || null,
          sideQuests: Array.isArray(gameState.sideQuests) ? gameState.sideQuests : null,
          savedAt: new Date().toISOString(),
        },
      };

      console.log('Saving game with payload:', payload); // Debug log

      const res = await apiRequest("POST", endpoint, payload);
      
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(`Failed to save game: ${errorData.error}`);
      }

      const savedGame = await res.json();

      if (savedGame.id && !currentGameId) {
        setCurrentGameId(savedGame.id);
        const newUrl = new URL(window.location.href);
        newUrl.searchParams.set("gameId", savedGame.id);
        window.history.pushState({}, "", newUrl.toString());
      }

      if (!isAutoSave) {
        toast({
          title: t("success"),
          description: t("game.chat.saved"),
        });
      }
    } catch (error) {
      console.error("Failed to save conversation:", error);
      toast({
        title: t("error"),
        description: t("game.chat.saveFailed"),
        variant: "destructive",
      });
      throw error;
    }
  };

  return (
    <Card className="min-h-[300px] max-h-[600px] h-full flex flex-col">
      <CardHeader className="flex flex-row justify-between items-center">
        <CardTitle>{t("game.adventure")}</CardTitle>
        <div className="flex gap-2 relative z-10">
          <Button
            onClick={() => setAutoSave(!autoSave)}
            type="button"
            variant={autoSave ? "default" : "outline"}
            className="relative active:scale-95 transition-all"
            title={
              autoSave ? t("game.chat.autoSaveOn") : t("game.chat.autoSaveOff")
            }
          >
            <PowerIcon
              className={`h-4 w-4 ${
                autoSave ? "text-green-500" : "text-gray-500"
              }`}
            />
          </Button>
          <Button
            onClick={() => handleSaveConversation()}
            type="button"
            disabled={messages.length === 0 || isLoading}
            className="relative bg-primary text-primary-foreground hover:bg-primary/90 active:scale-95 transition-all"
            title={t("game.chat.save")}
          >
            <Save className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="flex-1 flex flex-col min-h-0">
        <ScrollArea className="flex-1 pr-4" ref={scrollAreaRef}>
          <div className="space-y-4">
            {messages.map((message, i) => (
              <div
                key={i}
                className={`flex ${
                  message.role === "user" ? "justify-end" : "justify-start"
                }`}
              >
                <div
                  className={`max-w-[80%] rounded-lg px-4 py-2 ${
                    message.role === "user"
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted"
                  }`}
                >
                  {message.role === "assistant" ? (
                    <AIMessage content={message.content} />
                  ) : (
                    message.content.split("\n").map((text, i) => (
                      <p key={i} className={i > 0 ? "mt-2" : ""}>
                        {text}
                      </p>
                    ))
                  )}
                  {message.timestamp && (
                    <div className="text-xs opacity-50 mt-1">
                      {new Date(message.timestamp).toLocaleTimeString()}
                    </div>
                  )}
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-muted rounded-lg px-4 py-2 flex items-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  {t("game.chat.thinking")}
                </div>
              </div>
            )}
          </div>
        </ScrollArea>
        <form onSubmit={handleSubmit} className="flex-none mt-4 flex gap-2">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={t("game.chat.placeholder")}
            disabled={isLoading}
            className="flex-1"
          />
          <Button
            type="submit"
            disabled={isLoading}
            title={t("game.chat.send")}
          >
            <Send className="h-4 w-4" />
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
