import { create } from 'zustand';
import { Chat, Message } from '../types';

interface ChatState {
  chats: Chat[];
  activeChat: Chat | null;
  setActiveChat: (chat: Chat) => void;
  addMessage: (chatId: string, message: Message) => void;
  addReaction: (chatId: string, messageId: string, reaction: string, userId: string) => void;
}

export const useChatStore = create<ChatState>((set, get) => ({
  chats: [],
  activeChat: null,
  setActiveChat: (chat) => set({ activeChat: chat }),
  addMessage: (chatId, message) => {
    set((state) => ({
      chats: state.chats.map((chat) =>
        chat.id === chatId
          ? { ...chat, messages: [...chat.messages, message], lastMessage: message }
          : chat
      ),
    }));
  },
  addReaction: (chatId, messageId, emoji, userId) => {
    set((state) => ({
      chats: state.chats.map((chat) =>
        chat.id === chatId
          ? {
              ...chat,
              messages: chat.messages.map((msg) =>
                msg.id === messageId
                  ? {
                      ...msg,
                      reactions: [...msg.reactions, { userId, emoji }],
                    }
                  : msg
              ),
            }
          : chat
      ),
    }));
  },
}));