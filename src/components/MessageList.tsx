import React from 'react';
import { format } from 'date-fns';
import { useChatStore } from '../store/useChatStore';
import { useAuthStore } from '../store/useAuthStore';
import { SmileIcon, CheckCircle } from 'lucide-react';

export const MessageList = () => {
  const activeChat = useChatStore((state) => state.activeChat);
  const currentUser = useAuthStore((state) => state.user);

  if (!activeChat || !currentUser) return null;

  return (
    <div className="flex-1 overflow-y-auto p-4 space-y-4">
      {activeChat.messages.map((message) => {
        const isOwnMessage = message.senderId === currentUser.id;

        return (
          <div
            key={message.id}
            className={`flex ${isOwnMessage ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[70%] rounded-lg p-3 ${
                isOwnMessage
                  ? 'bg-indigo-600 text-white'
                  : 'bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white'
              }`}
            >
              {!isOwnMessage && (
                <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">
                  {activeChat.participants.find((p) => p.id === message.senderId)?.username}
                </p>
              )}
              <p className="break-words">{message.content}</p>
              <div className="flex items-center justify-between mt-2 space-x-2">
                <span className="text-xs opacity-70">
                  {format(new Date(message.timestamp), 'HH:mm')}
                </span>
                <div className="flex items-center space-x-2">
                  {message.reactions.length > 0 && (
                    <div className="flex -space-x-1">
                      {message.reactions.map((reaction, index) => (
                        <span
                          key={index}
                          className="inline-block bg-gray-100 dark:bg-gray-700 rounded-full px-2 py-1 text-xs"
                        >
                          {reaction.emoji}
                        </span>
                      ))}
                    </div>
                  )}
                  <button
                    className="opacity-70 hover:opacity-100 transition-opacity"
                    onClick={() => {/* Add reaction handler */}}
                  >
                    <SmileIcon className="w-4 h-4" />
                  </button>
                  {isOwnMessage && message.readBy.length > 0 && (
                    <CheckCircle className="w-4 h-4 text-green-500" />
                  )}
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};