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
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useQueryClient } from "@tanstack/react-query";
import { useGames } from "@/hooks/use-games";

interface ChatInterfaceProps {
  initialConversation?: SavedConversation;
  gameId?: string;
}

export function ChatInterface({ initialConversation, gameId }: ChatInterfaceProps) {
  const queryClient = useQueryClient();
  const { t } = useTranslation();
  const { toast } = useToast();
  const { gameState, updateGameState } = useGameState();
  const { games } = useGames();
  const [messages, setMessages] = useState<Message[]>(
    () => initialConversation?.messages || []
  );
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [currentGameId, setCurrentGameId] = useState<string | undefined>(gameId);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const [gameName, setGameName] = useState("");
  const [isSettingUpGame, setIsSettingUpGame] = useState(!gameId && !initialConversation);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [currentName, setCurrentName] = useState<string>("");

  // Mettre à jour currentGameId quand gameId change
  useEffect(() => {
    if (gameId) {
      setCurrentGameId(gameId);
      setIsSettingUpGame(false);
    }
  }, [gameId]);

  // Mettre à jour messages quand initialConversation change
  useEffect(() => {
    if (initialConversation?.messages) {
      setMessages(initialConversation.messages);
      setIsSettingUpGame(false);
    }
  }, [initialConversation]);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (initialConversation?.messages) {
      setMessages(initialConversation.messages);
    }
  }, [initialConversation?.timestamp]); // Dépend du timestamp pour détecter les changements

  // Ajouter un useEffect pour récupérer le nom de la partie
  useEffect(() => {
    if (gameId && games.length > 0) {
      const game = games.find(g => g.id === gameId);
      if (game?.name) {
        setCurrentName(game.name);
      }
    }
  }, [gameId, games]);

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
      const urlParams = new URLSearchParams(window.location.search);
      const gameId = urlParams.get("gameId");
      const lastMessages = messages.slice(-4);
      const contextMessages = [...lastMessages, userMessage];

      const currentGameState = {
        ...gameState,
        savedAt: new Date().toISOString()
      };

      const data = await apiRequest("POST", "/api/chat", {
        message: input,
        context: contextMessages,
        gameState: currentGameState,
        gameId
      });

      const { cleanResponse, updates } = await handleResponse(
        data.response,
        currentGameState
      );

      const assistantMessage: Message = {
        role: "assistant",
        content: cleanResponse,
        timestamp: new Date().toISOString(),
      };

      setMessages((prev) => [...prev, assistantMessage]);

      // Only update game state if we have updates and a gameId
      if (gameId && updates && Object.keys(updates).length > 0) {
        try {
          const success = await updateGameState(gameId, {
            stats: updates.stats,
            inventory: updates.inventory,
            eventLog: updates.eventLog
          });
          
          if (!success) {
            console.warn('Game state update was not successful');
            toast({
              title: t("warning"),
              description: t("game.chat.stateUpdateFailed"),
            });
          }
        } catch (error) {
          console.warn('Failed to update game state:', error);
        }
      }

      // Auto-save après l'échange de messages
      if (currentGameId) {
        // Si on a déjà un gameId, on met à jour la partie existante
        await handleSaveConversation(
          [...messages, userMessage, assistantMessage],
          true
        );
      } else if (!isSettingUpGame) {
        // Si on n'a pas de gameId et qu'on n'est pas en train de créer une partie,
        // créer une nouvelle partie
        const savedGame = await handleSaveConversation(
          [...messages, userMessage, assistantMessage],
          true
        );
        if (savedGame?.id) {
          setCurrentGameId(savedGame.id);
          const newUrl = new URL(window.location.href);
          newUrl.searchParams.set("gameId", savedGame.id);
          window.history.pushState({}, "", newUrl.toString());
        }
      }

    } catch (error) {
      console.error("Failed to get AI response:", error);
      toast({
        title: t("error"),
        description: error instanceof Error ? error.message : t("game.chat.failed"),
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
        id: currentGameId, // Ajouter l'ID existant pour la mise à jour
        name: currentName || gameName,
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

      console.log('Saving game with payload:', payload);

      const savedGame = await apiRequest("POST", endpoint, payload);

      // Ne mettre à jour l'URL et l'ID que si c'est une nouvelle partie
      if (savedGame?.id && !currentGameId) {
        setCurrentGameId(savedGame.id);
        const newUrl = new URL(window.location.href);
        newUrl.searchParams.set("gameId", savedGame.id);
        window.history.pushState({}, "", newUrl.toString());
      }
      
      // Toujours rafraîchir la liste des jeux après une sauvegarde
      queryClient.invalidateQueries({ queryKey: ["games"] });

      if (!isAutoSave) {
        toast({
          title: t("success"),
          description: t("game.chat.saved"),
        });
      }

      return savedGame;
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

  const handleNewGameSetup = async (confirmed: boolean) => {
    if (!confirmed) {
      setShowConfirmDialog(false);
      return;
    }

    try {
      // Ne pas créer de partie vide, attendre le premier message
      setCurrentName(gameName.trim());
      setIsSettingUpGame(false);
      setShowConfirmDialog(false);

      // Show success message
      toast({
        title: t("success"),
        description: t("game.created"),
      });
    } catch (error) {
      console.error("Failed to create new game:", error);
      toast({
        title: t("error"),
        description: error instanceof Error ? error.message : t("game.createFailed"),
        variant: "destructive",
      });
    }
  };

  const handleGameNameSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!gameName.trim()) {
      toast({
        title: t("error"),
        description: t("game.enterGameName"),
        variant: "destructive",
      });
      return;
    }
    setShowConfirmDialog(true);
  };

  if (isSettingUpGame) {
    return (
      <Card className="min-h-[300px] max-h-[600px] h-full flex flex-col">
        <CardHeader>
          <CardTitle>{t("game.newGame")}</CardTitle>
        </CardHeader>
        <CardContent className="flex-1 flex flex-col items-center justify-center">
          <form onSubmit={handleGameNameSubmit} className="w-full max-w-sm space-y-4">
            <Input
              value={gameName}
              onChange={(e) => setGameName(e.target.value)}
              placeholder={t("game.enterGameName")}
              className="text-center"
            />
            <Button type="submit" className="w-full">
              {t("game.start")}
            </Button>
          </form>

          <AlertDialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>{t("game.confirmTitle")}</AlertDialogTitle>
                <AlertDialogDescription>
                  {t("game.confirmNewGame", { name: gameName.trim() })}
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>{t("common.cancel")}</AlertDialogCancel>
                <AlertDialogAction onClick={() => handleNewGameSetup(true)}>
                  {t("common.confirm")}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="min-h-[300px] max-h-[600px] h-full flex flex-col">
      <CardHeader className="flex flex-row justify-between items-center">
        <CardTitle>
          {currentName || gameName || t("game.adventure")}
        </CardTitle>
        <div className="flex gap-2 relative z-10">
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
