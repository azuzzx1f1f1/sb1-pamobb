import User from '../models/User.js';
import Chat from '../models/Chat.js';
import Message from '../models/Message.js';

export const socketHandlers = (io, socket) => {
  const updateUserStatus = async (userId, isOnline) => {
    await User.findByIdAndUpdate(userId, {
      isOnline,
      lastSeen: isOnline ? undefined : new Date(),
    });
    io.emit('userStatus', { userId, isOnline });
  };

  socket.on('join', async ({ username }) => {
    try {
      let user = await User.findOne({ username });
      if (!user) {
        user = await User.create({ 
          username, 
          isOnline: true,
          friends: [],
          pendingRequests: []
        });
      } else {
        user.isOnline = true;
        await user.save();
      }
      
      socket.userId = user._id;
      socket.username = username;
      socket.join(user._id.toString());
      
      const chats = await Chat.find({ participants: user._id })
        .populate('participants')
        .populate('lastMessage');
      
      socket.emit('initialize', { user, chats });
      io.emit('userStatus', { userId: user._id, isOnline: true });
    } catch (error) {
      socket.emit('error', error.message);
    }
  });

  socket.on('sendMessage', async ({ chatId, content, type = 'text' }) => {
    try {
      const message = await Message.create({
        chatId,
        senderId: socket.userId,
        content,
        type,
      });

      await Chat.findByIdAndUpdate(chatId, { lastMessage: message._id });
      
      const populatedMessage = await Message.findById(message._id)
        .populate('senderId');

      io.to(chatId).emit('newMessage', populatedMessage);
    } catch (error) {
      socket.emit('error', error.message);
    }
  });

  socket.on('sendFriendRequest', async ({ username }) => {
    try {
      const targetUser = await User.findOne({ username });
      if (!targetUser) {
        return socket.emit('error', 'User not found');
      }

      if (targetUser.pendingRequests.includes(socket.username)) {
        return socket.emit('error', 'Friend request already sent');
      }

      if (targetUser.friends.includes(socket.username)) {
        return socket.emit('error', 'Already friends');
      }

      targetUser.pendingRequests.push(socket.username);
      await targetUser.save();

      io.to(targetUser._id.toString()).emit('friendRequest', { from: socket.username });
    } catch (error) {
      socket.emit('error', error.message);
    }
  });

  socket.on('acceptFriendRequest', async ({ username }) => {
    try {
      const [currentUser, requestingUser] = await Promise.all([
        User.findById(socket.userId),
        User.findOne({ username })
      ]);

      if (!currentUser || !requestingUser) {
        return socket.emit('error', 'User not found');
      }

      // Remove from pending and add to friends for both users
      currentUser.pendingRequests = currentUser.pendingRequests.filter(u => u !== username);
      requestingUser.pendingRequests = requestingUser.pendingRequests.filter(u => u !== socket.username);
      
      currentUser.friends.push(username);
      requestingUser.friends.push(socket.username);

      // Create a new chat for the users
      const chat = await Chat.create({
        participants: [currentUser._id, requestingUser._id]
      });

      await Promise.all([
        currentUser.save(),
        requestingUser.save(),
        chat.populate('participants')
      ]);

      // Notify both users
      io.to(requestingUser._id.toString()).emit('friendRequestAccepted', { 
        username: socket.username,
        chat
      });
      socket.emit('newChat', { chat });
    } catch (error) {
      socket.emit('error', error.message);
    }
  });

  // ... rest of the handlers ...
};