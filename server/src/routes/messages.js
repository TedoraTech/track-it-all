const express = require('express');
const router = express.Router({ mergeParams: true });
const { Message, User, Chat, ChatMember, FileUpload } = require('../models');
const { authenticateToken } = require('../middleware/auth');
const { validateSendMessage, validateUUID, validatePagination } = require('../middleware/validation');
const { chatLimiter } = require('../middleware/rateLimiter');
const uploadConfigs = require('../middleware/upload');
const logger = require('../config/logger');

router.get('/', authenticateToken, validatePagination, async (req, res) => {
  try {
    const { page = 1, limit = 50, before } = req.query;
    const offset = (page - 1) * limit;

    // Check if user is a member of the chat
    const membership = await ChatMember.findOne({
      where: { 
        chatId: req.params.chatId,
        userId: req.user.id,
        isActive: true,
      },
    });

    if (!membership) {
      return res.status(403).json({
        success: false,
        message: 'Not a member of this chat',
      });
    }

    const whereClause = { 
      chatId: req.params.chatId,
      isDeleted: false,
    };

    // For pagination with "before" cursor
    if (before) {
      const beforeMessage = await Message.findByPk(before);
      if (beforeMessage) {
        whereClause.createdAt = { 
          [require('sequelize').Op.lt]: beforeMessage.createdAt 
        };
      }
    }

    const { count, rows: messages } = await Message.findAndCountAll({
      where: whereClause,
      include: [
        {
          model: User,
          as: 'sender',
          attributes: ['id', 'displayName', 'avatar', 'university'],
        },
        {
          model: Message,
          as: 'replyToMessage',
          attributes: ['id', 'content', 'messageType'],
          include: [
            {
              model: User,
              as: 'sender',
              attributes: ['displayName'],
            },
          ],
        },
        {
          model: FileUpload,
          as: 'attachments',
          attributes: ['id', 'originalName', 'fileName', 'fileUrl', 'mimeType', 'fileSize'],
        },
      ],
      order: [['createdAt', before ? 'DESC' : 'ASC']],
      limit: parseInt(limit),
      offset: before ? 0 : offset, // Don't use offset with cursor pagination
    });

    // Update user's last read timestamp
    await membership.update({ lastReadAt: new Date() });

    res.json({
      success: true,
      data: {
        messages,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(count / limit),
          totalItems: count,
          itemsPerPage: parseInt(limit),
          hasMore: messages.length === parseInt(limit),
          oldestMessageId: messages.length > 0 ? messages[0].id : null,
          newestMessageId: messages.length > 0 ? messages[messages.length - 1].id : null,
        },
      },
    });
  } catch (error) {
    logger.error('Get messages error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch messages',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
});

/**
 * @route   POST /api/chats/:chatId/messages
 * @desc    Send a message to a chat
 * @access  Private (Members only)
 */
router.post('/', 
  authenticateToken, 
  chatLimiter,
  uploadConfigs.messageAttachments,
  validateSendMessage, 
  async (req, res) => {
    try {
      const { content, messageType = 'text', replyToId } = req.body;

      // Check if user is a member of the chat
      const membership = await ChatMember.findOne({
        where: { 
          chatId: req.params.chatId,
          userId: req.user.id,
          isActive: true,
        },
        include: [
          {
            model: Chat,
            as: 'chat',
          },
        ],
      });

      if (!membership) {
        return res.status(403).json({
          success: false,
          message: 'Not a member of this chat',
        });
      }

      const chat = membership.chat;

      // Check if chat is active
      if (!chat.isActive) {
        return res.status(400).json({
          success: false,
          message: 'Chat is not active',
        });
      }

      // If replying to a message, verify it exists
      if (replyToId) {
        const replyToMessage = await Message.findOne({
          where: { id: replyToId, chatId: req.params.chatId },
        });

        if (!replyToMessage) {
          return res.status(400).json({
            success: false,
            message: 'Reply message not found',
          });
        }
      }

      // Create the message
      const message = await Message.create({
        content,
        messageType,
        chatId: req.params.chatId,
        userId: req.user.id,
        replyToId: replyToId || null,
      });

      // Handle file uploads
      if (req.files && req.files.length > 0) {
        const fileUploads = req.files.map(file => ({
          originalName: file.originalname,
          fileName: file.filename,
          filePath: file.path,
          fileUrl: `/uploads/messages/${file.filename}`,
          mimeType: file.mimetype,
          fileSize: file.size,
          uploadStatus: 'completed',
          userId: req.user.id,
          messageId: message.id,
        }));

        await FileUpload.bulkCreate(fileUploads);
      }

      // Update chat's last message timestamp
      await chat.update({ lastMessageAt: new Date() });

      // Fetch the complete message with associations
      const createdMessage = await Message.findByPk(message.id, {
        include: [
          {
            model: User,
            as: 'sender',
            attributes: ['id', 'displayName', 'avatar', 'university'],
          },
          {
            model: Message,
            as: 'replyToMessage',
            attributes: ['id', 'content', 'messageType'],
            include: [
              {
                model: User,
                as: 'sender',
                attributes: ['displayName'],
              },
            ],
          },
          {
            model: FileUpload,
            as: 'attachments',
            attributes: ['id', 'originalName', 'fileName', 'fileUrl', 'mimeType', 'fileSize'],
          },
        ],
      });

      // TODO: Emit to socket.io for real-time updates
      // io.to(`chat-${req.params.chatId}`).emit('new-message', createdMessage);

      logger.info(`Message sent by ${req.user.email} in chat ${req.params.chatId}`);

      res.status(201).json({
        success: true,
        message: 'Message sent successfully',
        data: { message: createdMessage },
      });
    } catch (error) {
      logger.error('Send message error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to send message',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined,
      });
    }
  }
);

router.put('/:messageId', 
  authenticateToken, 
  validateUUID('messageId'),
  async (req, res) => {
    try {
      const { content } = req.body;

      if (!content || content.trim().length === 0) {
        return res.status(400).json({
          success: false,
          message: 'Content is required',
        });
      }

      const message = await Message.findOne({
        where: { 
          id: req.params.messageId, 
          chatId: req.params.chatId,
          isDeleted: false,
        },
      });

      if (!message) {
        return res.status(404).json({
          success: false,
          message: 'Message not found',
        });
      }

      // Check if user is the sender
      if (message.userId !== req.user.id) {
        return res.status(403).json({
          success: false,
          message: 'Not authorized to edit this message',
        });
      }

      // Check if message is too old to edit (15 minutes)
      const messageAge = Date.now() - new Date(message.createdAt).getTime();
      const editTimeLimit = 15 * 60 * 1000; // 15 minutes in milliseconds

      if (messageAge > editTimeLimit) {
        return res.status(400).json({
          success: false,
          message: 'Message is too old to edit',
        });
      }

      await message.update({ 
        content,
        isEdited: true,
        editedAt: new Date(),
      });

      // Fetch updated message with associations
      const updatedMessage = await Message.findByPk(message.id, {
        include: [
          {
            model: User,
            as: 'sender',
            attributes: ['id', 'displayName', 'avatar'],
          },
        ],
      });

      // TODO: Emit to socket.io for real-time updates
      // io.to(`chat-${req.params.chatId}`).emit('message-edited', updatedMessage);

      logger.info(`Message edited: ${message.id} by ${req.user.email}`);

      res.json({
        success: true,
        message: 'Message updated successfully',
        data: { message: updatedMessage },
      });
    } catch (error) {
      logger.error('Edit message error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to edit message',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined,
      });
    }
  }
);

router.delete('/:messageId', 
  authenticateToken, 
  validateUUID('messageId'),
  async (req, res) => {
    try {
      const message = await Message.findOne({
        where: { 
          id: req.params.messageId, 
          chatId: req.params.chatId,
          isDeleted: false,
        },
      });

      if (!message) {
        return res.status(404).json({
          success: false,
          message: 'Message not found',
        });
      }

      // Check if user is the sender or chat admin
      let canDelete = message.userId === req.user.id;
      
      if (!canDelete) {
        const membership = await ChatMember.findOne({
          where: { 
            chatId: req.params.chatId,
            userId: req.user.id,
            isActive: true,
          },
        });
        
        canDelete = membership && ['admin', 'moderator'].includes(membership.role);
      }

      if (!canDelete) {
        return res.status(403).json({
          success: false,
          message: 'Not authorized to delete this message',
        });
      }

      await message.update({ isDeleted: true });

      // TODO: Emit to socket.io for real-time updates
      // io.to(`chat-${req.params.chatId}`).emit('message-deleted', { messageId: message.id });

      logger.info(`Message deleted: ${message.id} by ${req.user.email}`);

      res.json({
        success: true,
        message: 'Message deleted successfully',
      });
    } catch (error) {
      logger.error('Delete message error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to delete message',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined,
      });
    }
  }
);

router.post('/mark-read', authenticateToken, async (req, res) => {
  try {
    // Check if user is a member of the chat
    const membership = await ChatMember.findOne({
      where: { 
        chatId: req.params.chatId,
        userId: req.user.id,
        isActive: true,
      },
    });

    if (!membership) {
      return res.status(403).json({
        success: false,
        message: 'Not a member of this chat',
      });
    }

    // Update last read timestamp
    await membership.update({ lastReadAt: new Date() });

    res.json({
      success: true,
      message: 'Messages marked as read',
    });
  } catch (error) {
    logger.error('Mark messages read error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to mark messages as read',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
});

module.exports = router;
