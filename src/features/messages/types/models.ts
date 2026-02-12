export interface MessageUser {
  id: string;
  name: string | null;
  image: string | null;
}

export interface MessageItem {
  id: string;
  content: string;
  createdAt: string;
  sender: MessageUser;
}

export interface ConversationParticipant {
  userId: string;
  user: MessageUser;
}

export interface Conversation {
  id: string;
  createdAt: string;
  participants: ConversationParticipant[];
  messages: MessageItem[];
}
