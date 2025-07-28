const express = require('express');
const router = express.Router();
const { Op } = require('sequelize');
const { Chat, User, ChatMember, Message, FileUpload } = require('../models');
const { authenticateToken } = require('../middleware/auth');
const { 
  validateCreateChat, 
  validateSendMessage, 
  validateUUID, 
  validatePagination,
  validateSearch 
} = require('../middleware/validation');
const { chatLimiter } = require('../middleware/rateLimiter');
const uploadConfigs = require('../middleware/upload');
const logger = require('../config/logger');

/**
 * @route   GET /api/chats
 * @desc    Get user's joined chats
 * @access  Private
 */
router.get('/', authenticateToken, validatePagination, async (req, res) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    const offset = (page - 1) * limit;

    const userChats = await ChatMember.findAndCountAll({
      where: { 
        userId: req.user.id,
        isActive: true,
      },
      include: [
        {
          model: Chat,
          as: 'chat',
          include: [
            {
              model: User,
              as: 'creator',
              attributes: ['id', 'displayName', 'avatar'],
            },
            {
              model: Message,
              as: 'messages',
              limit: 1,
              order: [['createdAt', 'DESC']],
              include: [
                {
                  model: User,
                  as: 'sender',
                  attributes: ['displayName'],
                },
              ],
            },
          ],
        },
      ],
      order: [['lastReadAt', 'DESC']],
      limit: parseInt(limit),
      offset: offset,
    });

    const formattedChats = userChats.rows.map(membership => {
      const chat = membership.chat.toJSON();
      chat.membership = {
        role: membership.role,
        joinedAt: membership.joinedAt,
        lastReadAt: membership.lastReadAt,
        isMuted: membership.isMuted,
      };
      chat.lastMessage = chat.messages[0] || null;
      delete chat.messages;
      
      // Calculate unread count (simplified)
      chat.unreadCount = 0; // TODO: Implement proper unread count logic
      
      return chat;
    });

    res.json({
      success: true,
      data: {
        chats: formattedChats,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(userChats.count / limit),
          totalItems: userChats.count,
          itemsPerPage: parseInt(limit),
        },
      },
    });
  } catch (error) {
    logger.error('Get user chats error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch chats',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
});

/**
 * @route   GET /api/chats/discover
 * @desc    Discover available chats to join
 * @access  Private
 */
router.get('/discover', authenticateToken, validatePagination, validateSearch, async (req, res) => {
  try {
    const {
      page = 1,
      limit = 20,
      category,
      university,
      semester,
      year,
      q: searchQuery,
    } = req.query;

    const offset = (page - 1) * limit;
    const whereClause = { 
      isActive: true,
      isPrivate: false,
    };

    // Apply filters
    if (category) whereClause.category = category;
    if (university) whereClause.university = university;
    if (semester) whereClause.semester = semester;
    if (year) whereClause.year = year;

    // Search functionality
    if (searchQuery) {
      whereClause[Op.or] = [
        { name: { [Op.iLike]: `%${searchQuery}%` } },
        { description: { [Op.iLike]: `%${searchQuery}%` } },
      ];
    }

    // Get user's joined chat IDs to exclude them
    const userChatMemberships = await ChatMember.findAll({
      where: { userId: req.user.id, isActive: true },
      attributes: ['chatId'],
    });
    const userChatIds = userChatMemberships.map(m => m.chatId);

    if (userChatIds.length > 0) {
      whereClause.id = { [Op.notIn]: userChatIds };
    }

    const { count, rows: chats } = await Chat.findAndCountAll({
      where: whereClause,
      include: [
        {
          model: User,
          as: 'creator',
          attributes: ['id', 'displayName', 'avatar'],
        },
      ],
      order: [['memberCount', 'DESC'], ['createdAt', 'DESC']],
      limit: parseInt(limit),
      offset: offset,
    });

    res.json({
      success: true,
      data: {
        chats,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(count / limit),
          totalItems: count,
          itemsPerPage: parseInt(limit),
        },
      },
    });
  } catch (error) {
    logger.error('Discover chats error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to discover chats',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
});

/**
 * @route   POST /api/chats
 * @desc    Create a new chat
 * @access  Private
 */
router.post('/', authenticateToken, validateCreateChat, async (req, res) => {
  try {
    const {
      name,
      description,
      category,
      university,
      semester,
      year,
      isPrivate = false,
      memberLimit = 500,
    } = req.body;

    // Create the chat
    const chat = await Chat.create({
      name,
      description,
      category,
      university,
      semester,
      year,
      isPrivate,
      memberLimit,
      memberCount: 1,
      createdBy: req.user.id,
    });

    // Add creator as admin member
    await ChatMember.create({
      chatId: chat.id,
      userId: req.user.id,
      role: 'admin',
    });

    // Fetch complete chat with associations
    const createdChat = await Chat.findByPk(chat.id, {
      include: [
        {
          model: User,
          as: 'creator',
          attributes: ['id', 'displayName', 'avatar'],
        },
      ],
    });

    logger.info(`New chat created: ${name} by ${req.user.email}`);

    res.status(201).json({
      success: true,
      message: 'Chat created successfully',
      data: { chat: createdChat },
    });
  } catch (error) {
    logger.error('Create chat error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create chat',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
});

/**
 * @route   GET /api/chats/:id
 * @desc    Get chat details
 * @access  Private (Members only)
 */
router.get('/:id', authenticateToken, validateUUID('id'), async (req, res) => {
  try {
    // Check if user is a member of the chat
    const membership = await ChatMember.findOne({
      where: { 
        chatId: req.params.id,
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

    const chat = await Chat.findByPk(req.params.id, {
      include: [
        {
          model: User,
          as: 'creator',
          attributes: ['id', 'displayName', 'avatar'],
        },
        {
          model: ChatMember,
          as: 'memberships',
          where: { isActive: true },
          include: [
            {
              model: User,
              as: 'user',
              attributes: ['id', 'displayName', 'avatar', 'university'],
            },
          ],
        },
      ],
    });

    if (!chat) {
      return res.status(404).json({
        success: false,
        message: 'Chat not found',
      });
    }

    const chatData = chat.toJSON();
    chatData.userMembership = {
      role: membership.role,
      joinedAt: membership.joinedAt,
      lastReadAt: membership.lastReadAt,
      isMuted: membership.isMuted,
    };

    res.json({
      success: true,
      data: { chat: chatData },
    });
  } catch (error) {
    logger.error('Get chat error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch chat',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
});

/**
 * @route   POST /api/chats/:id/join
 * @desc    Join a chat
 * @access  Private
 */
router.post('/:id/join', authenticateToken, validateUUID('id'), async (req, res) => {
  try {
    const chat = await Chat.findOne({
      where: { id: req.params.id, isActive: true },
    });

    if (!chat) {
      return res.status(404).json({
        success: false,
        message: 'Chat not found',
      });
    }

    // Check if chat is private
    if (chat.isPrivate) {
      return res.status(403).json({
        success: false,
        message: 'Cannot join private chat without invitation',
      });
    }

    // Check if chat is full
    if (chat.memberCount >= chat.memberLimit) {
      return res.status(400).json({
        success: false,
        message: 'Chat is full',
      });
    }

    // Check if already a member
    const existingMembership = await ChatMember.findOne({
      where: { chatId: chat.id, userId: req.user.id },
    });

    if (existingMembership) {
      if (existingMembership.isActive) {
        return res.status(400).json({
          success: false,
          message: 'Already a member of this chat',
        });
      } else {
        // Reactivate membership
        await existingMembership.update({ isActive: true, joinedAt: new Date() });
      }
    } else {
      // Create new membership
      await ChatMember.create({
        chatId: chat.id,
        userId: req.user.id,
        role: 'member',
      });
    }

    // Increment member count
    await chat.increment('memberCount');

    // Send system message about new member
    await Message.create({
      content: `${req.user.displayName} joined the chat`,
      messageType: 'system',
      chatId: chat.id,
      userId: req.user.id,
    });

    logger.info(`User ${req.user.email} joined chat ${chat.name}`);

    res.json({
      success: true,
      message: 'Successfully joined the chat',
    });
  } catch (error) {
    logger.error('Join chat error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to join chat',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
});

/**
 * @route   POST /api/chats/:id/leave
 * @desc    Leave a chat
 * @access  Private
 */
router.post('/:id/leave', authenticateToken, validateUUID('id'), async (req, res) => {
  try {
    const membership = await ChatMember.findOne({
      where: { 
        chatId: req.params.id,
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
      return res.status(404).json({
        success: false,
        message: 'Not a member of this chat',
      });
    }

    const chat = membership.chat;

    // Check if user is the only admin
    if (membership.role === 'admin') {
      const adminCount = await ChatMember.count({
        where: { 
          chatId: chat.id,
          role: 'admin',
          isActive: true,
        },
      });

      if (adminCount === 1) {
        return res.status(400).json({
          success: false,
          message: 'Cannot leave chat as the only admin. Transfer admin rights first.',
        });
      }
    }

    // Deactivate membership
    await membership.update({ isActive: false });

    // Decrement member count
    await chat.decrement('memberCount');

    // Send system message about member leaving
    await Message.create({
      content: `${req.user.displayName} left the chat`,
      messageType: 'system',
      chatId: chat.id,
      userId: req.user.id,
    });

    logger.info(`User ${req.user.email} left chat ${chat.name}`);

    res.json({
      success: true,
      message: 'Successfully left the chat',
    });
  } catch (error) {
    logger.error('Leave chat error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to leave chat',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
});

module.exports = router;
