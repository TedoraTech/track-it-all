const { Server } = require('socket.io');
const jwt = require('jsonwebtoken');
const { User, Chat, ChatMember, Message } = require('../models');
const logger = require('../config/logger');

class SocketService {
  constructor() {
    this.io = null;
    this.connectedUsers = new Map(); // userId -> socket.id
    this.userSockets = new Map(); // socket.id -> userId
  }

  initialize(server) {
    this.io = new Server(server, {
      cors: {
        origin: process.env.CLIENT_URL || "http://localhost:3000",
        methods: ["GET", "POST"],
        credentials: true
      },
      pingTimeout: 60000,
      pingInterval: 25000,
    });

    this.setupMiddleware();
    this.setupEventHandlers();
    
    logger.info('Socket.io server initialized');
  }

  setupMiddleware() {
    // Authentication middleware
    this.io.use(async (socket, next) => {
      try {
        const token = socket.handshake.auth.token || socket.handshake.headers.authorization?.replace('Bearer ', '');
        
        if (!token) {
          return next(new Error('Authentication token required'));
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await User.findByPk(decoded.userId, {
          attributes: ['id', 'firstName', 'lastName', 'email', 'avatar', 'university', 'status']
        });

        if (!user) {
          return next(new Error('User not found'));
        }

        socket.userId = user.id;
        socket.user = user;
        next();
      } catch (error) {
        logger.error('Socket authentication error:', error);
        next(new Error('Invalid authentication token'));
      }
    });
  }

  setupEventHandlers() {
    this.io.on('connection', (socket) => {
      this.handleConnection(socket);
    });
  }

  handleConnection(socket) {
    const userId = socket.userId;
    const user = socket.user;

    logger.info(`User ${user.firstName} ${user.lastName} connected with socket ${socket.id}`);

    // Store user connection
    this.connectedUsers.set(userId, socket.id);
    this.userSockets.set(socket.id, userId);

    // Join user to their chat rooms
    this.joinUserChats(socket);

    // Update user status to online
    this.updateUserStatus(userId, 'online');

    // Socket event handlers
    socket.on('join-chat', (data) => this.handleJoinChat(socket, data));
    socket.on('leave-chat', (data) => this.handleLeaveChat(socket, data));
    socket.on('send-message', (data) => this.handleSendMessage(socket, data));
    socket.on('edit-message', (data) => this.handleEditMessage(socket, data));
    socket.on('delete-message', (data) => this.handleDeleteMessage(socket, data));
    socket.on('typing-start', (data) => this.handleTypingStart(socket, data));
    socket.on('typing-stop', (data) => this.handleTypingStop(socket, data));
    socket.on('mark-messages-read', (data) => this.handleMarkMessagesRead(socket, data));
    socket.on('user-status-change', (data) => this.handleUserStatusChange(socket, data));

    socket.on('disconnect', () => this.handleDisconnection(socket));
  }

  async joinUserChats(socket) {
    try {
      const userChats = await ChatMember.findAll({
        where: { userId: socket.userId },
        include: [{ model: Chat, attributes: ['id', 'name'] }]
      });

      for (const chatMember of userChats) {
        const roomName = `chat-${chatMember.Chat.id}`;
        socket.join(roomName);
        logger.debug(`User ${socket.userId} joined room ${roomName}`);
      }
    } catch (error) {
      logger.error('Error joining user chats:', error);
    }
  }

  async handleJoinChat(socket, data) {
    try {
      const { chatId } = data;
      
      // Verify user is a member of the chat
      const membership = await ChatMember.findOne({
        where: { userId: socket.userId, chatId }
      });

      if (!membership) {
        socket.emit('error', { message: 'Not authorized to join this chat' });
        return;
      }

      const roomName = `chat-${chatId}`;
      socket.join(roomName);

      // Notify other members that user has joined
      socket.to(roomName).emit('user-joined-chat', {
        userId: socket.userId,
        user: socket.user,
        chatId,
        timestamp: new Date()
      });

      socket.emit('chat-joined', { chatId, roomName });
      logger.debug(`User ${socket.userId} joined chat room ${roomName}`);
    } catch (error) {
      logger.error('Error handling join chat:', error);
      socket.emit('error', { message: 'Failed to join chat' });
    }
  }

  async handleLeaveChat(socket, data) {
    try {
      const { chatId } = data;
      const roomName = `chat-${chatId}`;
      
      socket.leave(roomName);

      // Notify other members that user has left
      socket.to(roomName).emit('user-left-chat', {
        userId: socket.userId,
        user: socket.user,
        chatId,
        timestamp: new Date()
      });

      socket.emit('chat-left', { chatId, roomName });
      logger.debug(`User ${socket.userId} left chat room ${roomName}`);
    } catch (error) {
      logger.error('Error handling leave chat:', error);
    }
  }

  async handleSendMessage(socket, data) {
    try {
      const { chatId, content, attachments = [], replyToId = null } = data;

      // Verify user is a member of the chat
      const membership = await ChatMember.findOne({
        where: { userId: socket.userId, chatId }
      });

      if (!membership) {
        socket.emit('error', { message: 'Not authorized to send messages to this chat' });
        return;
      }

      // Create the message (this would normally be done through the API)
      const message = await Message.create({
        chatId,
        senderId: socket.userId,
        content,
        attachments: JSON.stringify(attachments),
        replyToId,
        type: 'text'
      });

      // Load the complete message with sender info
      const completeMessage = await Message.findByPk(message.id, {
        include: [
          {
            model: User,
            as: 'sender',
            attributes: ['id', 'firstName', 'lastName', 'avatar']
          },
          {
            model: Message,
            as: 'replyTo',
            include: [{
              model: User,
              as: 'sender',
              attributes: ['id', 'firstName', 'lastName']
            }]
          }
        ]
      });

      const roomName = `chat-${chatId}`;
      
      // Emit to all users in the chat room
      this.io.to(roomName).emit('new-message', {
        message: completeMessage,
        chatId,
        timestamp: new Date()
      });

      // Send push notifications to offline users
      await this.sendMessageNotifications(chatId, message, socket.userId);

      logger.debug(`Message sent in chat ${chatId} by user ${socket.userId}`);
    } catch (error) {
      logger.error('Error handling send message:', error);
      socket.emit('error', { message: 'Failed to send message' });
    }
  }

  async handleEditMessage(socket, data) {
    try {
      const { messageId, newContent } = data;

      const message = await Message.findByPk(messageId);
      
      if (!message) {
        socket.emit('error', { message: 'Message not found' });
        return;
      }

      if (message.senderId !== socket.userId) {
        socket.emit('error', { message: 'Not authorized to edit this message' });
        return;
      }

      // Update message
      await message.update({
        content: newContent,
        isEdited: true,
        editedAt: new Date()
      });

      const roomName = `chat-${message.chatId}`;
      
      // Emit to all users in the chat room
      this.io.to(roomName).emit('message-edited', {
        messageId,
        newContent,
        editedAt: message.editedAt,
        chatId: message.chatId
      });

      logger.debug(`Message ${messageId} edited by user ${socket.userId}`);
    } catch (error) {
      logger.error('Error handling edit message:', error);
      socket.emit('error', { message: 'Failed to edit message' });
    }
  }

  async handleDeleteMessage(socket, data) {
    try {
      const { messageId } = data;

      const message = await Message.findByPk(messageId);
      
      if (!message) {
        socket.emit('error', { message: 'Message not found' });
        return;
      }

      if (message.senderId !== socket.userId) {
        socket.emit('error', { message: 'Not authorized to delete this message' });
        return;
      }

      // Soft delete the message
      await message.update({
        content: '[Message deleted]',
        isDeleted: true,
        deletedAt: new Date()
      });

      const roomName = `chat-${message.chatId}`;
      
      // Emit to all users in the chat room
      this.io.to(roomName).emit('message-deleted', {
        messageId,
        chatId: message.chatId,
        deletedAt: message.deletedAt
      });

      logger.debug(`Message ${messageId} deleted by user ${socket.userId}`);
    } catch (error) {
      logger.error('Error handling delete message:', error);
      socket.emit('error', { message: 'Failed to delete message' });
    }
  }

  handleTypingStart(socket, data) {
    const { chatId } = data;
    const roomName = `chat-${chatId}`;
    
    socket.to(roomName).emit('user-typing-start', {
      userId: socket.userId,
      user: socket.user,
      chatId
    });
  }

  handleTypingStop(socket, data) {
    const { chatId } = data;
    const roomName = `chat-${chatId}`;
    
    socket.to(roomName).emit('user-typing-stop', {
      userId: socket.userId,
      user: socket.user,
      chatId
    });
  }

  async handleMarkMessagesRead(socket, data) {
    try {
      const { chatId, messageIds } = data;

      // Update messages as read (this would normally be done through the API)
      // For now, just emit the event
      const roomName = `chat-${chatId}`;
      
      socket.to(roomName).emit('messages-read', {
        userId: socket.userId,
        chatId,
        messageIds,
        readAt: new Date()
      });

      logger.debug(`Messages marked as read in chat ${chatId} by user ${socket.userId}`);
    } catch (error) {
      logger.error('Error handling mark messages read:', error);
    }
  }

  async handleUserStatusChange(socket, data) {
    try {
      const { status } = data;
      const validStatuses = ['online', 'away', 'busy', 'offline'];
      
      if (!validStatuses.includes(status)) {
        socket.emit('error', { message: 'Invalid status' });
        return;
      }

      await this.updateUserStatus(socket.userId, status);

      // Broadcast status change to all connected users
      socket.broadcast.emit('user-status-changed', {
        userId: socket.userId,
        status,
        timestamp: new Date()
      });

      logger.debug(`User ${socket.userId} status changed to ${status}`);
    } catch (error) {
      logger.error('Error handling user status change:', error);
    }
  }

  async handleDisconnection(socket) {
    const userId = socket.userId;
    
    if (userId) {
      // Remove user from connected users
      this.connectedUsers.delete(userId);
      this.userSockets.delete(socket.id);

      // Update user status to offline after a delay
      setTimeout(async () => {
        // Check if user has reconnected
        if (!this.connectedUsers.has(userId)) {
          await this.updateUserStatus(userId, 'offline');
          
          // Broadcast status change
          socket.broadcast.emit('user-status-changed', {
            userId,
            status: 'offline',
            timestamp: new Date()
          });
        }
      }, 30000); // 30 seconds delay

      logger.info(`User ${userId} disconnected from socket ${socket.id}`);
    }
  }

  async updateUserStatus(userId, status) {
    try {
      await User.update(
        { 
          status,
          lastSeen: new Date()
        },
        { where: { id: userId } }
      );
    } catch (error) {
      logger.error('Error updating user status:', error);
    }
  }

  async sendMessageNotifications(chatId, message, senderId) {
    try {
      // Get all chat members except the sender
      const chatMembers = await ChatMember.findAll({
        where: { 
          chatId,
          userId: { [require('sequelize').Op.ne]: senderId }
        },
        include: [{ model: User, attributes: ['id', 'email', 'firstName', 'lastName'] }]
      });

      // Filter out online users (they already received the real-time message)
      const offlineUsers = chatMembers.filter(member => 
        !this.connectedUsers.has(member.userId)
      );

      // Here you would implement push notifications or email notifications
      // For now, just log the notification intent
      if (offlineUsers.length > 0) {
        logger.info(`Would send notifications to ${offlineUsers.length} offline users for message in chat ${chatId}`);
      }
    } catch (error) {
      logger.error('Error sending message notifications:', error);
    }
  }

  // Public methods for external use
  sendToUser(userId, event, data) {
    const socketId = this.connectedUsers.get(userId);
    if (socketId) {
      this.io.to(socketId).emit(event, data);
      return true;
    }
    return false;
  }

  sendToChat(chatId, event, data) {
    const roomName = `chat-${chatId}`;
    this.io.to(roomName).emit(event, data);
  }

  broadcastToAll(event, data) {
    this.io.emit(event, data);
  }

  getConnectedUsersCount() {
    return this.connectedUsers.size;
  }

  isUserOnline(userId) {
    return this.connectedUsers.has(userId);
  }

  getOnlineUsers() {
    return Array.from(this.connectedUsers.keys());
  }
}

module.exports = new SocketService();
