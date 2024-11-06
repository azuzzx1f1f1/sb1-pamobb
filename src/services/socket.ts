import { io, Socket } from 'socket.io-client';
import { useAuthStore } from '../store/useAuthStore';
import { useChatStore } from '../store/useChatStore';
import toast from 'react-hot-toast';

const SOCKET_URL = 'http://localhost:3000';

class SocketService {
  private socket: Socket | null = null;
  
  connect() {
    this.socket = io(SOCKET_URL);
    
    this.socket.on('connect', () => {
      console.log('Connected to server');
    });
    
    this.socket.on('error', (error) => {
      toast.error(error);
    });
    
    this.socket.on('initialize', ({ user, chats }) => {
      const chatStore = useChatStore.getState();
      chatStore.setChats(chats);
    });
    
    this.socket.on('newMessage', (message) => {
      const chatStore = useChatStore.getState();
      chatStore.addMessage(message.chatId, message);
    });
    
    this.socket.on('messageReaction', ({ messageId, reaction }) => {
      const chatStore = useChatStore.getState();
      chatStore.addReaction(messageId, reaction);
    });
    
    this.socket.on('userTyping', ({ userId, chatId }) => {
      const chatStore = useChatStore.getState();
      chatStore.setUserTyping(userId, chatId);
    });
    
    this.socket.on('userStoppedTyping', ({ userId, chatId }) => {
      const chatStore = useChatStore.getState();
      chatStore.clearUserTyping(userId, chatId);
    });
    
    this.socket.on('userStatus', ({ userId, isOnline }) => {
      const chatStore = useChatStore.getState();
      chatStore.updateUserStatus(userId, isOnline);
    });

    this.socket.on('friendRequest', ({ from }) => {
      toast.custom(
        (t) => ({
          className: `${
            t.visible ? 'animate-enter' : 'animate-leave'
          } max-w-md w-full bg-white dark:bg-gray-800 shadow-lg rounded-lg pointer-events-auto flex ring-1 ring-black ring-opacity-5`,
          children: (
            <>
              <div className="flex-1 w-0 p-4">
                <div className="flex items-start">
                  <div className="ml-3 flex-1">
                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                      Friend Request
                    </p>
                    <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                      {from} wants to be your friend
                    </p>
                  </div>
                </div>
              </div>
              <div className="flex border-l border-gray-200 dark:border-gray-700">
                <button
                  onClick={() => {
                    this.acceptFriendRequest(from);
                    toast.dismiss(t.id);
                  }}
                  className="w-full border border-transparent rounded-none rounded-r-lg p-4 flex items-center justify-center text-sm font-medium text-indigo-600 dark:text-indigo-400 hover:text-indigo-500 focus:outline-none"
                >
                  Accept
                </button>
              </div>
            </>
          ),
        }),
        { duration: 5000 }
      );
    });

    this.socket.on('friendRequestAccepted', ({ username }) => {
      toast.success(`${username} accepted your friend request!`);
    });
  }
  
  join(username: string) {
    this.socket?.emit('join', { username });
  }
  
  sendMessage(chatId: string, content: string, type: string = 'text') {
    this.socket?.emit('sendMessage', { chatId, content, type });
  }
  
  addReaction(messageId: string, emoji: string) {
    this.socket?.emit('addReaction', { messageId, emoji });
  }
  
  typing(chatId: string) {
    this.socket?.emit('typing', { chatId });
  }
  
  stopTyping(chatId: string) {
    this.socket?.emit('stopTyping', { chatId });
  }

  sendFriendRequest(username: string) {
    this.socket?.emit('sendFriendRequest', { username });
  }

  acceptFriendRequest(username: string) {
    this.socket?.emit('acceptFriendRequest', { username });
  }
  
  disconnect() {
    this.socket?.disconnect();
    this.socket = null;
  }
}

export const socketService = new SocketService();