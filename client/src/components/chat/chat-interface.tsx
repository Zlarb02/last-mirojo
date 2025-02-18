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

interface ChatInterfaceProps {
  initialConversation?: SavedConversation;
}


export function ChatInterface({ initialConversation }: ChatInterfaceProps) {
  const { t } = useTranslation();
  const { toast } = useToast();
  const [messages, setMessages] = useState<Message[]>(() => 
    initialConversation?.messages || []
  );
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [autoSave, setAutoSave] = useState(false);
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (initialConversation?.messages) {
      setMessages(initialConversation.messages);
    }
  }, [initialConversation?.timestamp]); // Dépend du timestamp pour détecter les changements

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
      // Envoyer tous les messages comme contexte
      const res = await apiRequest("POST", "/api/chat", {
        message: input,
        context: messages.map((m) => ({
          role: m.role,
          content: m.content,
          timestamp: m.timestamp
        })),
      });

      if (!res.ok) throw new Error('Failed to get AI response');

      const data = await res.json();
      const assistantMessage: Message = {
        role: "assistant",
        content: data.response,
        timestamp: new Date().toISOString(),
      };
      
      const updatedMessages = [...messages, userMessage, assistantMessage];
      setMessages((prev) => [...prev, assistantMessage]);
      
      // Only auto-save if enabled
      if (autoSave) {
        await handleSaveConversation(updatedMessages);
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

  const handleSaveConversation = async (messagesToSave = messages) => {
    if (messagesToSave.length === 0) return;

    try {
      const res = await apiRequest("POST", "/api/chat/save", {
        conversationId: initialConversation?.id, // Ajouter l'ID pour mise à jour
        conversation: {
          messages: messagesToSave,
          timestamp: new Date().toISOString(),
        }
      });
      
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message || 'Failed to save conversation');
      }

      toast({
        title: t("success"),
        description: t("game.chat.saved"),
      });
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
            title={autoSave ? t("game.chat.autoSaveOn") : t("game.chat.autoSaveOff")}
          >
            <PowerIcon className={`h-4 w-4 ${autoSave ? "text-green-500" : "text-gray-500"}`} />
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
                  {message.content}
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