export interface Message {
  role: "user" | "assistant";
  content: string;
  timestamp: string;
}

export interface SavedConversation {
  id: number
  messages: Message[];
  timestamp: string;
}