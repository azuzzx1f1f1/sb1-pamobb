export interface User {
  id: string;
  username: string;
  isOnline: boolean;
  lastSeen?: Date;
  friends: string[];
  pendingRequests: string[];
}

export interface Message {
  id: string;
  senderId: string;
  content: string;
  timestamp: Date;
  type: 'text' | 'image' | 'gif';
  reactions: MessageReaction[];
  readBy: string[];
}

export interface MessageReaction {
  userId: string;
  emoji: string;
}

export interface Chat {
  id: string;
  participants: User[];
  messages: Message[];
  lastMessage?: Message;
}