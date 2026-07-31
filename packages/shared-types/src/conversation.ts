export type MessageRole = "user" | "assistant";

export interface Correction {
  original: string;
  corrected: string;
  explanation: string;
}

export interface ConversationSession {
  id: string;
  userId: string;
  title: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface ConversationMessage {
  id: string;
  conversationId: string;
  role: MessageRole;
  content: string;
  corrections: Correction[];
  culturalNotes: string | null;
  createdAt: string;
}
