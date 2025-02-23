import { useState, useEffect, useRef } from "react";
import { useTranslation } from "react-i18next";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Save, Send, Loader2, Plus } from "lucide-react";
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

export function ChatInterface({ initialConversation }: ChatInterfaceProps) {
  const queryClient = useQueryClient();
  const { t } = useTranslation();
  const { toast } = useToast();
  const { gameState, updateGameState, setGameState } = useGameState();
  const { games } = useGames();
  const [messages, setMessages] = useState<Message[]>(
    () => initialConversation?.messages || []
  );
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const searchParams = new URLSearchParams(window.location.search);
  const urlGameId = searchParams.get("gameId");
  const [currentGameId, setCurrentGameId] = useState<string | undefined>(
    urlGameId || undefined
  );
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const [gameName, setGameName] = useState("");
  const [isSettingUpGame, setIsSettingUpGame] = useState(
    !urlGameId && !initialConversation
  );
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [currentName, setCurrentName] = useState<string>("");
  const [conversation, setConversation] = useState<SavedConversation | null>(
    initialConversation || null
  );
  console.log(urlGameId);

  // Mettre à jour currentGameId quand gameId change
  useEffect(() => {
    if (urlGameId) {
      setCurrentGameId(urlGameId);
      setIsSettingUpGame(false);
      loadGameConversation(urlGameId);
    }
  }, [urlGameId]);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (initialConversation?.messages) {
      setMessages(initialConversation.messages);
    }
  }, [initialConversation?.timestamp]); // Dépend du timestamp pour détecter les changements

  // Ajouter un useEffect pour récupérer le nom de la partie
  useEffect(() => {
    if (urlGameId && games.length > 0) {
      const game = games.find((g) => g.id === urlGameId);
      if (game?.name) {
        setCurrentName(game.name);
      }
    }
  }, [urlGameId, games]);

  const loadGameConversation = async (gameId: string) => {
    try {
      const res = await apiRequest("GET", `/api/game/${gameId}`);
      const gameData = await res.json();

      if (gameData?.conversation) {
        setConversation(gameData.conversation);
        setMessages(gameData.conversation.messages);
      }

      const stateRes = await apiRequest("GET", `/api/game-state/${gameId}`);
      const gameStateData = await stateRes.json();

      if (gameStateData) {
        const updatedGameState = {
          stats: Array.isArray(gameStateData.stats) ? gameStateData.stats : [],
          inventory: Array.isArray(gameStateData.inventory)
            ? gameStateData.inventory
            : [],
          eventLog: Array.isArray(gameStateData.eventLog)
            ? gameStateData.eventLog
            : [],
          characterName: gameStateData.characterName || "",
          characterDescription: gameStateData.characterDescription || "",
          mainQuest: gameStateData.mainQuest || {
            title: "",
            description: "",
            status: "Not started" as const,
          },
          sideQuests: Array.isArray(gameStateData.sideQuests)
            ? gameStateData.sideQuests
            : [],
        };
        setGameState(updatedGameState);
      }
    } catch (error) {
      console.error("Failed to load game conversation:", error);
      toast({
        title: t("error"),
        description: t("game.loadFailed"),
        variant: "destructive",
      });
    }
  };

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

    // Extract character information
    const nameMatch = content.match(/<name>(.*?)<\/name>/);
    const descriptionMatch = content.match(/<description>(.*?)<\/description>/);

    // Extract quest information
    const questMatch = content.match(/<mainQuest>([\s\S]*?)<\/mainQuest>/);
    const questTitleMatch =
      questMatch && questMatch[1].match(/<title>(.*?)<\/title>/);
    const questDescriptionMatch =
      questMatch && questMatch[1].match(/<description>(.*?)<\/description>/);
    const questStatusMatch =
      questMatch && questMatch[1].match(/<status>(.*?)<\/status>/);

    // Create updates while preserving existing state
    const updates = {
      ...currentState,
      stats: Array.isArray(currentState.stats) ? [...currentState.stats] : [],
      inventory: Array.isArray(currentState.inventory)
        ? [...currentState.inventory]
        : [],
      eventLog: Array.isArray(currentState.eventLog)
        ? [...currentState.eventLog]
        : [],
      characterName: nameMatch?.[1] || currentState.characterName || "",
      characterDescription:
        descriptionMatch?.[1] || currentState.characterDescription || "",
      mainQuest: {
        ...currentState.mainQuest,
        title: questTitleMatch?.[1] || currentState.mainQuest?.title || "",
        description:
          questDescriptionMatch?.[1] ||
          currentState.mainQuest?.description ||
          "",
        status: (questStatusMatch?.[1] ||
          currentState.mainQuest?.status ||
          "active") as "active" | "completed",
      },
    };

    // Only update stats if we have stats array
    if (Array.isArray(updates.stats)) {
      // Update stats only if new values are provided
      if (healthMatch) {
        const healthStat = updates.stats.find(
          (s: { name: string }) => s.name === "Santé"
        );
        if (healthStat) {
          healthStat.value = parseInt(healthMatch[1]);
        }
      }
      if (manaMatch) {
        const manaStat = updates.stats.find(
          (s: { name: string }) => s.name === "Mana"
        );
        if (manaStat) {
          manaStat.value = parseInt(manaMatch[1]);
        }
      }
      if (levelMatch) {
        const levelStat = updates.stats.find(
          (s: { name: string }) => s.name === "Niveau"
        );
        if (levelStat) {
          levelStat.value = parseInt(levelMatch[1]);
        }
      }
    }

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
        stats: gameState.stats || [],
        inventory: gameState.inventory || [],
        eventLog: gameState.eventLog || [],
        characterName: gameState.characterName || "",
        characterDescription: gameState.characterDescription || "",
        mainQuest: gameState.mainQuest || {
          title: "",
          description: "",
          status: "Not started" as const,
        },
        sideQuests: gameState.sideQuests || [],
        savedAt: new Date().toISOString(),
      };

      const response = await apiRequest("POST", "/api/chat", {
        message: input,
        context: contextMessages,
        gameState: currentGameState,
        gameId,
      });
      const data = await response.json();
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
            ...updates,
            characterName: gameState.characterName,
            characterDescription: gameState.characterDescription,
            mainQuest: gameState.mainQuest,
            sideQuests: gameState.sideQuests,
          });

          if (!success) {
            console.warn("Game state update was not successful");
            toast({
              title: t("warning"),
              description: t("game.chat.stateUpdateFailed"),
            });
          }
        } catch (error) {
          console.warn("Failed to update game state:", error);
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
        const saveRes = await handleSaveConversation(
          [...messages, userMessage, assistantMessage],
          true
        );
        const savedGame = await saveRes.json();
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
        description:
          error instanceof Error ? error.message : t("game.chat.failed"),
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
        conversation: {
          messages: messagesToSave,
          timestamp: new Date().toISOString(),
        },
        gameState: {
          stats: gameState.stats || [],
          inventory: Array.isArray(gameState.inventory)
            ? gameState.inventory
            : [],
          eventLog: Array.isArray(gameState.eventLog) ? gameState.eventLog : [],
          characterName: gameState.characterName || "",
          characterDescription: gameState.characterDescription || "",
          mainQuest: gameState.mainQuest || null,
          sideQuests: Array.isArray(gameState.sideQuests)
            ? gameState.sideQuests
            : null,
          savedAt: new Date().toISOString(),
        },
        name: currentName || gameName,
        description: "", // vous pouvez ajouter une description si nécessaire
      };

      // Si nous avons un gameId, mettons à jour la partie existante
      if (currentGameId) {
        const response = await apiRequest(
          "POST",
          `/api/game/${currentGameId}`,
          payload
        );
        queryClient.invalidateQueries({ queryKey: ["games"] });

        if (!isAutoSave) {
          toast({
            title: t("success"),
            description: t("game.chat.saved"),
          });
        }
        return response;
      }

      // Sinon, créons une nouvelle partie
      const res = await apiRequest("POST", endpoint, payload);
      const savedGame = await res.json();

      if (savedGame?.id) {
        setCurrentGameId(savedGame.id);
        const newUrl = new URL(window.location.href);
        newUrl.searchParams.set("gameId", savedGame.id);
        window.history.pushState({}, "", newUrl.toString());
      }

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

  const handleSaveNewGame = async () => {
    if (messages.length === 0) return;

    try {
      // Créer une nouvelle partie avec les messages existants
      const endpoint = "/api/game/save";
      const payload = {
        conversation: {
          messages: messages,
          timestamp: new Date().toISOString(),
        },
        gameState: {
          stats: gameState.stats || [],
          inventory: Array.isArray(gameState.inventory)
            ? gameState.inventory
            : [],
          eventLog: Array.isArray(gameState.eventLog) ? gameState.eventLog : [],
          characterName: gameState.characterName || "",
          characterDescription: gameState.characterDescription || "",
          mainQuest: gameState.mainQuest || null,
          sideQuests: Array.isArray(gameState.sideQuests)
            ? gameState.sideQuests
            : null,
          savedAt: new Date().toISOString(),
        },
        name: `${currentName || gameName} (Copy)`,
        description: "",
      };

      const res = await apiRequest("POST", endpoint, payload);
      const savedGame = await res.json();

      if (savedGame?.id) {
        // Rediriger vers la nouvelle partie
        const newUrl = new URL(window.location.href);
        newUrl.searchParams.set("gameId", savedGame.id);
        window.location.href = newUrl.toString(); // Utiliser window.location.href pour forcer un rechargement
      }

      queryClient.invalidateQueries({ queryKey: ["games"] });

      toast({
        title: t("success"),
        description: t("game.chat.savedNew"),
      });
    } catch (error) {
      console.error("Failed to save new game:", error);
      toast({
        title: t("error"),
        description: t("game.chat.saveNewFailed"),
        variant: "destructive",
      });
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
        description:
          error instanceof Error ? error.message : t("game.createFailed"),
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
          <form
            onSubmit={handleGameNameSubmit}
            className="w-full max-w-sm space-y-4"
          >
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

          <AlertDialog
            open={showConfirmDialog}
            onOpenChange={setShowConfirmDialog}
          >
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
        <CardTitle>{currentName || gameName || t("game.adventure")}</CardTitle>
        <div className="flex gap-2 relative z-10">
          <Button
            onClick={handleSaveNewGame}
            type="button"
            disabled={messages.length === 0 || isLoading}
            className="relative bg-primary text-primary-foreground hover:bg-primary/90 active:scale-95 transition-all"
            title={t("game.chat.saveNew")}
          >
            <Plus className="h-4 w-4 ml-1" />
            <Save className="h-4 w-4 mr-1" />
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
