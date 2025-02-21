export interface Message {
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
}

export interface SavedGame {
  id: string;
  messages: Message[];
  timestamp: string;
}

// Si vous aviez des imports de SavedConversation, remplacez-les par SavedGame
