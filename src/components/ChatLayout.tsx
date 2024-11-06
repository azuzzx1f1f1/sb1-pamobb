import React from 'react';
import { MessageList } from './MessageList';
import { ChatInput } from './ChatInput';
import { Sidebar } from './Sidebar';
import { useChatStore } from '../store/useChatStore';

export const ChatLayout = () => {
  const activeChat = useChatStore((state) => state.activeChat);

  return (
    <div className="h-screen flex bg-gray-50 dark:bg-gray-900">
      <Sidebar />
      <div className="flex-1 flex flex-col">
        {activeChat ? (
          <>
            <MessageList />
            <ChatInput />
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <p className="text-gray-500 dark:text-gray-400">
              Select a chat to start messaging
            </p>
          </div>
        )}
      </div>
    </div>
  );
};