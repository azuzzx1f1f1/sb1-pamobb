import React, { useState, useRef, useEffect } from 'react';
import { Send, Image, Smile } from 'lucide-react';
import { useChatStore } from '../store/useChatStore';
import { socketService } from '../services/socket';

export const ChatInput = () => {
  const [message, setMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const activeChat = useChatStore((state) => state.activeChat);
  const typingTimeoutRef = useRef<NodeJS.Timeout>();

  const handleTyping = () => {
    if (!isTyping) {
      setIsTyping(true);
      socketService.typing(activeChat!.id);
    }

    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    typingTimeoutRef.current = setTimeout(() => {
      setIsTyping(false);
      socketService.stopTyping(activeChat!.id);
    }, 1000);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim() || !activeChat) return;

    socketService.sendMessage(activeChat.id, message.trim());
    setMessage('');
  };

  useEffect(() => {
    return () => {
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
    };
  }, []);

  if (!activeChat) return null;

  return (
    <form
      onSubmit={handleSubmit}
      className="border-t dark:border-gray-700 bg-white dark:bg-gray-800 p-4"
    >
      <div className="flex items-center space-x-4">
        <button
          type="button"
          className="text-gray-500 hover:text-gray-600 dark:text-gray-400 dark:hover:text-gray-300"
        >
          <Image className="w-5 h-5" />
        </button>
        <button
          type="button"
          className="text-gray-500 hover:text-gray-600 dark:text-gray-400 dark:hover:text-gray-300"
        >
          <Smile className="w-5 h-5" />
        </button>
        <input
          type="text"
          value={message}
          onChange={(e) => {
            setMessage(e.target.value);
            handleTyping();
          }}
          placeholder="Type a message..."
          className="flex-1 rounded-lg border border-gray-300 dark:border-gray-600 p-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:bg-gray-700 dark:text-white"
        />
        <button
          type="submit"
          disabled={!message.trim()}
          className="bg-indigo-600 text-white rounded-lg p-2 hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          <Send className="w-5 h-5" />
        </button>
      </div>
    </form>
  );
};