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
import { parseGameEvents, cleanMessageContent } from "@/lib/event-parser";
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
    const events = parseGameEvents(response);
    const cleanResponse = cleanMessageContent(response);
    
    // Create updates object based on events
    const updates = {
      stats: { ...currentState.stats },
      inventory: [...currentState.inventory],
      eventLog: [...currentState.eventLog]
    };

    events.forEach(event => {
      switch (event.type) {
        case 'HEALTH':
          updates.stats.health = Math.max(0, Math.min(100, 
            (updates.stats.health || 100) + Number(event.value)
          ));
          updates.eventLog.push(event.display);
          break;
        case 'MANA':
          updates.stats.mana = Math.max(0, Math.min(100, 
            (updates.stats.mana || 100) + Number(event.value)
          ));
          updates.eventLog.push(event.display);
          break;
        case 'ITEM_FOUND':
          updates.inventory.push(event.value);
          updates.eventLog.push(event.display);
          break;
      }
    });

    return { cleanResponse, updates };
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
      // Récupérer les 2 dernières paires de messages (4 messages au total)
      const lastMessages = messages.slice(-4);
      const contextMessages = [...lastMessages, userMessage];
  
      // Récupérer le game state actuel en fonction du gameId
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
  
      const res = await apiRequest("POST", "/api/chat", {
        message: input,
        context: contextMessages.map((m) => ({
          role: m.role,
          content: m.content,
          timestamp: m.timestamp,
        })),
        gameState: {
          stats: gameStateData.stats,
          inventory: gameStateData.inventory,
          eventLog: gameStateData.eventLog,
        },
      });
  
      if (!res.ok) throw new Error("Failed to get AI response");
  
      const data = await res.json();
      const { cleanResponse, updates } = await handleResponse(data.response, gameStateData);
      
      const assistantMessage: Message = {
        role: "assistant",
        content: cleanResponse,
        timestamp: new Date().toISOString(),
      };

      if (gameId) {
        await updateGameState(gameId, updates);
      }
  
      const updatedMessages = [...messages, userMessage, assistantMessage];
      setMessages((prev) => [...prev, assistantMessage]);
  
      if (autoSave) {
        await handleSaveConversation(updatedMessages, true);
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
  
  // Update parseAndUpdateGameState to handle gameId
  const parseAndUpdateGameState = async (
    content: string,
    currentState: any,
    gameId?: string | null
  ) => {
    const eventRegex = /<event>(.*?):(.*?)<\/event>/g;
    let match;
    const updates: any = {
      stats: { ...currentState.stats },
      inventory: [...currentState.inventory],
      eventLog: [...currentState.eventLog],
    };

    let hasUpdates = false;
  
    while ((match = eventRegex.exec(content)) !== null) {
      hasUpdates = true;
      const [_, type, detail] = match;
      switch (type) {
        case "DAMAGE":
          updates.stats.health = Math.max(
            (updates.stats.health || 100) - Number(detail),
            0
          );
          updates.eventLog.push(`Dégâts subis: ${detail}`);
          break;
        case "HEAL":
          updates.stats.health = Math.min(
            (updates.stats.health || 100) + Number(detail),
            100
          );
          updates.eventLog.push(`Soins reçus: ${detail}`);
          break;
        case "ITEM_FOUND":
          updates.inventory.push(detail);
          updates.eventLog.push(`Item trouvé: ${detail}`);
          break;
      }
    }
  
    if (hasUpdates && gameId) {
      await updateGameState(gameId, updates);
    }
  
    return updates;
  };

  const handleSaveConversation = async (
    messagesToSave = messages,
    isAutoSave = false
  ) => {
    if (messagesToSave.length === 0) return;
  
    try {
      const endpoint = "/api/game/save";
      const { stats, inventory, eventLog } = gameState;
      
      const payload = {
        conversationId: currentGameId,
        conversation: {
          messages: messagesToSave,
          timestamp: new Date().toISOString(),
        },
        gameState: {
          stats,
          inventory,
          eventLog,
        }
      };
  
      const res = await apiRequest("POST", endpoint, payload);
  
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message || "Failed to save conversation");
      }
  
      const savedGame = await res.json();
      if (!currentGameId && savedGame.id) {
        setCurrentGameId(savedGame.id);
        // Mettre à jour l'URL avec le nouveau gameId
        const newUrl = new URL(window.location.href);
        newUrl.searchParams.set('gameId', String(savedGame.id));
        window.history.pushState({}, '', newUrl.toString());
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
                    message.content.split('\n').map((text, i) => (
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
