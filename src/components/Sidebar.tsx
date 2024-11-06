import React, { useState } from 'react';
import { useAuthStore } from '../store/useAuthStore';
import { useChatStore } from '../store/useChatStore';
import { LogOut, Moon, Sun, UserPlus, Search, X } from 'lucide-react';
import { format } from 'date-fns';
import { socketService } from '../services/socket';
import toast from 'react-hot-toast';

export const Sidebar = () => {
  const user = useAuthStore((state) => state.user);
  const logout = useAuthStore((state) => state.logout);
  const { chats, activeChat, setActiveChat } = useChatStore();
  const [isDark, setIsDark] = useState(() => 
    document.documentElement.classList.contains('dark')
  );
  const [showAddFriend, setShowAddFriend] = useState(false);
  const [username, setUsername] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  const toggleTheme = () => {
    setIsDark(!isDark);
    document.documentElement.classList.toggle('dark');
  };

  const handleAddFriend = (e: React.FormEvent) => {
    e.preventDefault();
    if (username.trim() && username !== user?.username) {
      socketService.sendFriendRequest(username);
      setUsername('');
      setShowAddFriend(false);
      toast.success('Friend request sent!');
    }
  };

  const filteredChats = chats.filter((chat) => {
    const otherParticipant = chat.participants.find((p) => p.id !== user?.id);
    return otherParticipant?.username.toLowerCase().includes(searchQuery.toLowerCase());
  });

  return (
    <div className="w-80 border-r dark:border-gray-700 bg-white dark:bg-gray-800 flex flex-col">
      <div className="p-4 border-b dark:border-gray-700 flex items-center justify-between">
        <div>
          <h2 className="font-semibold text-gray-900 dark:text-white">
            {user?.username}
          </h2>
          <p className="text-sm text-gray-500 dark:text-gray-400">Online</p>
        </div>
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setShowAddFriend(true)}
            className="p-2 text-gray-500 hover:text-gray-600 dark:text-gray-400 dark:hover:text-gray-300"
            title="Add Friend"
          >
            <UserPlus className="w-5 h-5" />
          </button>
          <button
            onClick={toggleTheme}
            className="p-2 text-gray-500 hover:text-gray-600 dark:text-gray-400 dark:hover:text-gray-300"
          >
            {isDark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
          </button>
          <button
            onClick={logout}
            className="p-2 text-gray-500 hover:text-gray-600 dark:text-gray-400 dark:hover:text-gray-300"
          >
            <LogOut className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Add Friend Modal */}
      {showAddFriend && (
        <div className="p-4 border-b dark:border-gray-700">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-gray-900 dark:text-white">Add Friend</h3>
            <button
              onClick={() => setShowAddFriend(false)}
              className="text-gray-500 hover:text-gray-600 dark:text-gray-400"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
          <form onSubmit={handleAddFriend} className="flex space-x-2">
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Enter username"
              className="flex-1 rounded-lg border border-gray-300 dark:border-gray-600 p-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:bg-gray-700 dark:text-white"
            />
            <button
              type="submit"
              className="bg-indigo-600 text-white rounded-lg px-3 py-2 text-sm hover:bg-indigo-700 transition-colors"
            >
              Send
            </button>
          </form>
        </div>
      )}

      {/* Search Chats */}
      <div className="p-4 border-b dark:border-gray-700">
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search chats"
            className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:bg-gray-700 dark:text-white"
          />
        </div>
      </div>

      {/* Chat List */}
      <div className="flex-1 overflow-y-auto">
        {filteredChats.map((chat) => {
          const otherParticipant = chat.participants.find(
            (p) => p.id !== user?.id
          );
          const isActive = activeChat?.id === chat.id;

          return (
            <button
              key={chat.id}
              onClick={() => setActiveChat(chat)}
              className={`w-full p-4 border-b dark:border-gray-700 flex items-center space-x-3 hover:bg-gray-50 dark:hover:bg-gray-700 ${
                isActive ? 'bg-gray-50 dark:bg-gray-700' : ''
              }`}
            >
              <div className="relative">
                <div className="w-10 h-10 rounded-full bg-indigo-100 dark:bg-indigo-900 flex items-center justify-center">
                  <span className="text-indigo-600 dark:text-indigo-400 font-medium">
                    {otherParticipant?.username.charAt(0).toUpperCase()}
                  </span>
                </div>
                {otherParticipant?.isOnline && (
                  <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white dark:border-gray-800"></div>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                    {otherParticipant?.username}
                  </p>
                  {chat.lastMessage && (
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {format(new Date(chat.lastMessage.timestamp), 'HH:mm')}
                    </p>
                  )}
                </div>
                {chat.lastMessage && (
                  <p className="text-sm text-gray-500 dark:text-gray-400 truncate">
                    {chat.lastMessage.content}
                  </p>
                )}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};