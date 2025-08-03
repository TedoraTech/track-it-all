const express = require('express');
const router = express.Router({ mergeParams: true });
const { PostReply, User, Post, ReplyVote, FileUpload } = require('../models');
const { authenticateToken, optionalAuth } = require('../middleware/auth');
const { validateCreateReply, validateUUID, validatePagination } = require('../middleware/validation');
const uploadConfigs = require('../middleware/upload');
const logger = require('../config/logger');

router.get('/', validatePagination, optionalAuth, async (req, res) => {
  try {
    const { page = 1, limit = 50, sortBy = 'created_at', sortOrder = 'ASC' } = req.query;
    const offset = (page - 1) * limit;

    const post = await Post.findOne({
      where: { id: req.params.postId, status: 'active' },
    });

    if (!post) {
      return res.status(404).json({
        success: false,
        message: 'Post not found',
      });
    }

    const { count, rows: replies } = await PostReply.findAndCountAll({
      where: { 
        postId: req.params.postId,
        isHidden: false,
      },
      include: [
        {
          model: User,
          as: 'author',
          attributes: ['id', 'displayName', 'avatar', 'university', 'reputation'],
        },
        {
          model: PostReply,
          as: 'parentReply',
          attributes: ['id', 'content'],
          include: [
            {
              model: User,
              as: 'author',
              attributes: ['displayName'],
            },
          ],
        },
        {
          model: PostReply,
          as: 'childReplies',
          attributes: ['id'],
        },
        {
          model: FileUpload,
          as: 'attachments',
          attributes: ['id', 'originalName', 'fileName', 'fileUrl', 'mimeType', 'fileSize'],
        },
        ...(req.user ? [{
          model: ReplyVote,
          as: 'votes',
          where: { userId: req.user.id },
          required: false,
          attributes: ['voteType'],
        }] : []),
      ],
      order: [
        [sortBy, sortOrder.toUpperCase()],
        ['isAccepted', 'DESC'], // Show accepted answers first
      ],
      limit: parseInt(limit),
      offset: offset,
    });

    const formattedReplies = replies.map(reply => {
      const replyData = reply.toJSON();
      replyData.childReplyCount = replyData.childReplies.length;
      delete replyData.childReplies;

      if (req.user) {
        replyData.userVote = replyData.votes?.[0]?.voteType || null;
        delete replyData.votes;
      }

      return replyData;
    });

    res.json({
      success: true,
      data: {
        replies: formattedReplies,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(count / limit),
          totalItems: count,
          itemsPerPage: parseInt(limit),
        },
      },
    });
  } catch (error) {
    logger.error('Get replies error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch replies',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
});

router.post('/', 
  authenticateToken, 
  uploadConfigs.postAttachments,
  validateCreateReply, 
  async (req, res) => {
    try {
      const { content, parentReplyId } = req.body;

      const post = await Post.findOne({
        where: { id: req.params.postId, status: 'active' },
      });

      if (!post) {
        return res.status(404).json({
          success: false,
          message: 'Post not found',
        });
      }

      // If replying to another reply, verify it exists
      if (parentReplyId) {
        const parentReply = await PostReply.findOne({
          where: { id: parentReplyId, postId: req.params.postId },
        });

        if (!parentReply) {
          return res.status(400).json({
            success: false,
            message: 'Parent reply not found',
          });
        }
      }

      // Create the reply
      const reply = await PostReply.create({
        content,
        postId: req.params.postId,
        userId: req.user.id,
        parentReplyId: parentReplyId || null,
      });

      // Handle file uploads
      if (req.files && req.files.length > 0) {
        const fileUploads = req.files.map(file => ({
          originalName: file.originalname,
          fileName: file.filename,
          filePath: file.path,
          fileUrl: `/uploads/posts/${file.filename}`,
          mimeType: file.mimetype,
          fileSize: file.size,
          uploadStatus: 'completed',
          userId: req.user.id,
          replyId: reply.id,
        }));

        await FileUpload.bulkCreate(fileUploads);
      }

      // Fetch the complete reply with associations
      const createdReply = await PostReply.findByPk(reply.id, {
        include: [
          {
            model: User,
            as: 'author',
            attributes: ['id', 'displayName', 'avatar', 'university', 'reputation'],
          },
          {
            model: PostReply,
            as: 'parentReply',
            attributes: ['id', 'content'],
            include: [
              {
                model: User,
                as: 'author',
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

      logger.info(`New reply created by ${req.user.email} on post ${req.params.postId}`);

      res.status(201).json({
        success: true,
        message: 'Reply created successfully',
        data: { reply: createdReply },
      });
    } catch (error) {
      logger.error('Create reply error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to create reply',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined,
      });
    }
  }
);

router.put('/:replyId', 
  authenticateToken, 
  validateUUID('replyId'),
  async (req, res) => {
    try {
      const { content } = req.body;

      if (!content || content.trim().length === 0) {
        return res.status(400).json({
          success: false,
          message: 'Content is required',
        });
      }

      const reply = await PostReply.findOne({
        where: { 
          id: req.params.replyId, 
          postId: req.params.postId,
          isHidden: false,
        },
      });

      if (!reply) {
        return res.status(404).json({
          success: false,
          message: 'Reply not found',
        });
      }

      // Check if user is the author or has admin privileges
      if (reply.userId !== req.user.id && req.user.role !== 'admin') {
        return res.status(403).json({
          success: false,
          message: 'Not authorized to update this reply',
        });
      }

      await reply.update({ content });

      // Fetch updated reply with associations
      const updatedReply = await PostReply.findByPk(reply.id, {
        include: [
          {
            model: User,
            as: 'author',
            attributes: ['id', 'displayName', 'avatar', 'university'],
          },
        ],
      });

      logger.info(`Reply updated: ${reply.id} by ${req.user.email}`);

      res.json({
        success: true,
        message: 'Reply updated successfully',
        data: { reply: updatedReply },
      });
    } catch (error) {
      logger.error('Update reply error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to update reply',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined,
      });
    }
  }
);

router.delete('/:replyId', 
  authenticateToken, 
  validateUUID('replyId'),
  async (req, res) => {
    try {
      const reply = await PostReply.findOne({
        where: { 
          id: req.params.replyId, 
          postId: req.params.postId,
          isHidden: false,
        },
      });

      if (!reply) {
        return res.status(404).json({
          success: false,
          message: 'Reply not found',
        });
      }

      // Check if user is the author or has admin privileges
      if (reply.userId !== req.user.id && req.user.role !== 'admin') {
        return res.status(403).json({
          success: false,
          message: 'Not authorized to delete this reply',
        });
      }

      await reply.update({ isHidden: true });

      logger.info(`Reply deleted: ${reply.id} by ${req.user.email}`);

      res.json({
        success: true,
        message: 'Reply deleted successfully',
      });
    } catch (error) {
      logger.error('Delete reply error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to delete reply',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined,
      });
    }
  }
);

router.post('/:replyId/vote', 
  authenticateToken, 
  validateUUID('replyId'),
  async (req, res) => {
    try {
      const { voteType } = req.body;

      if (!['upvote', 'downvote'].includes(voteType)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid vote type. Must be "upvote" or "downvote"',
        });
      }

      const reply = await PostReply.findOne({
        where: { 
          id: req.params.replyId, 
          postId: req.params.postId,
          isHidden: false,
        },
      });

      if (!reply) {
        return res.status(404).json({
          success: false,
          message: 'Reply not found',
        });
      }

      // Check if user already voted
      const existingVote = await ReplyVote.findOne({
        where: { replyId: reply.id, userId: req.user.id },
      });

      if (existingVote) {
        if (existingVote.voteType === voteType) {
          // Remove vote if same type
          await existingVote.destroy();
          await reply.decrement(voteType === 'upvote' ? 'upvotes' : 'downvotes');
          
          res.json({
            success: true,
            message: 'Vote removed',
            data: { action: 'removed', voteType },
          });
        } else {
          // Change vote type
          await existingVote.update({ voteType });
          await reply.decrement(existingVote.voteType === 'upvote' ? 'upvotes' : 'downvotes');
          await reply.increment(voteType === 'upvote' ? 'upvotes' : 'downvotes');
          
          res.json({
            success: true,
            message: 'Vote updated',
            data: { action: 'updated', voteType },
          });
        }
      } else {
        // Create new vote
        await ReplyVote.create({
          replyId: reply.id,
          userId: req.user.id,
          voteType,
        });
        await reply.increment(voteType === 'upvote' ? 'upvotes' : 'downvotes');
        
        res.json({
          success: true,
          message: 'Vote added',
          data: { action: 'added', voteType },
        });
      }
    } catch (error) {
      logger.error('Vote reply error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to vote on reply',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined,
      });
    }
  }
);

router.post('/:replyId/accept', 
  authenticateToken, 
  validateUUID('replyId'),
  async (req, res) => {
    try {
      const post = await Post.findOne({
        where: { id: req.params.postId, status: 'active' },
      });

      if (!post) {
        return res.status(404).json({
          success: false,
          message: 'Post not found',
        });
      }

      // Only post author can accept answers
      if (post.userId !== req.user.id) {
        return res.status(403).json({
          success: false,
          message: 'Only the post author can accept answers',
        });
      }

      const reply = await PostReply.findOne({
        where: { 
          id: req.params.replyId, 
          postId: req.params.postId,
          isHidden: false,
        },
      });

      if (!reply) {
        return res.status(404).json({
          success: false,
          message: 'Reply not found',
        });
      }

      // Unaccept all other replies for this post
      await PostReply.update(
        { isAccepted: false },
        { where: { postId: req.params.postId } }
      );

      // Accept this reply
      await reply.update({ isAccepted: true });

      logger.info(`Reply accepted: ${reply.id} by ${req.user.email}`);

      res.json({
        success: true,
        message: 'Reply marked as accepted answer',
        data: { accepted: true },
      });
    } catch (error) {
      logger.error('Accept reply error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to accept reply',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined,
      });
    }
  }
);

module.exports = router;
