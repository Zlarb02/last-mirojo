export interface Message {
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
}

export interface SavedConversation {
  id: string;
  messages: Message[];
  timestamp: string;
}
