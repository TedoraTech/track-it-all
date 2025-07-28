const express = require('express');
const router = express.Router();
const { Op } = require('sequelize');
const { Post, User, PostReply, PostVote, Tag, PostTag, Bookmark, FileUpload } = require('../models');
const { authenticateToken, optionalAuth } = require('../middleware/auth');
const { postLimiter } = require('../middleware/rateLimiter');
const { 
  validateCreatePost, 
  validateUpdatePost, 
  validatePagination, 
  validateSearch,
  validateUUID 
} = require('../middleware/validation');
const uploadConfigs = require('../middleware/upload');
const logger = require('../config/logger');

/**
 * @route   GET /api/posts
 * @desc    Get all posts with filtering, searching, and pagination
 * @access  Public
 */
router.get('/', validatePagination, validateSearch, optionalAuth, async (req, res) => {
  try {
    const {
      page = 1,
      limit = 20,
      category,
      university,
      semester,
      year,
      q: searchQuery,
      sortBy = 'created_at',
      sortOrder = 'DESC',
      featured,
    } = req.query;

    const offset = (page - 1) * limit;
    const whereClause = { status: 'active' };

    // Apply filters
    if (category) whereClause.category = category;
    if (university) whereClause.university = university;
    if (semester) whereClause.semester = semester;
    if (year) whereClause.year = year;
    if (featured === 'true') whereClause.isFeatured = true;

    // Search functionality
    if (searchQuery) {
      whereClause[Op.or] = [
        { title: { [Op.iLike]: `%${searchQuery}%` } },
        { content: { [Op.iLike]: `%${searchQuery}%` } },
      ];
    }

    const { count, rows: posts } = await Post.findAndCountAll({
      where: whereClause,
      include: [
        {
          model: User,
          as: 'author',
          attributes: ['id', 'displayName', 'avatar', 'university', 'reputation'],
        },
        {
          model: Tag,
          as: 'tags',
          attributes: ['id', 'name', 'displayName', 'color'],
          through: { attributes: [] },
        },
        {
          model: PostReply,
          as: 'replies',
          attributes: ['id'],
        },
        ...(req.user ? [{
          model: PostVote,
          as: 'votes',
          where: { userId: req.user.id },
          required: false,
          attributes: ['voteType'],
        }, {
          model: Bookmark,
          as: 'userBookmarks',
          where: { userId: req.user.id },
          required: false,
          attributes: ['id'],
        }] : []),
      ],
      order: [[sortBy, sortOrder.toUpperCase()]],
      limit: parseInt(limit),
      offset: offset,
      distinct: true,
    });

    // Format response data
    const formattedPosts = posts.map(post => {
      const postData = post.toJSON();
      postData.replyCount = postData.replies.length;
      delete postData.replies;

      if (req.user) {
        postData.userVote = postData.votes?.[0]?.voteType || null;
        postData.isBookmarked = postData.userBookmarks?.length > 0;
        delete postData.votes;
        delete postData.userBookmarks;
      }

      return postData;
    });

    res.json({
      success: true,
      data: {
        posts: formattedPosts,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(count / limit),
          totalItems: count,
          itemsPerPage: parseInt(limit),
        },
      },
    });
  } catch (error) {
    logger.error('Get posts error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch posts',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
});

/**
 * @route   GET /api/posts/:id
 * @desc    Get a single post by ID
 * @access  Public
 */
router.get('/:id', validateUUID('id'), optionalAuth, async (req, res) => {
  try {
    const post = await Post.findOne({
      where: { id: req.params.id, status: 'active' },
      include: [
        {
          model: User,
          as: 'author',
          attributes: ['id', 'displayName', 'avatar', 'university', 'reputation'],
        },
        {
          model: Tag,
          as: 'tags',
          attributes: ['id', 'name', 'displayName', 'color'],
          through: { attributes: [] },
        },
        {
          model: FileUpload,
          as: 'attachments',
          attributes: ['id', 'originalName', 'fileName', 'fileUrl', 'mimeType', 'fileSize'],
        },
        ...(req.user ? [{
          model: PostVote,
          as: 'votes',
          where: { userId: req.user.id },
          required: false,
          attributes: ['voteType'],
        }, {
          model: Bookmark,
          as: 'userBookmarks',
          where: { userId: req.user.id },
          required: false,
          attributes: ['id'],
        }] : []),
      ],
    });

    if (!post) {
      return res.status(404).json({
        success: false,
        message: 'Post not found',
      });
    }

    // Increment view count
    await post.increment('views');

    const postData = post.toJSON();
    if (req.user) {
      postData.userVote = postData.votes?.[0]?.voteType || null;
      postData.isBookmarked = postData.userBookmarks?.length > 0;
      delete postData.votes;
      delete postData.userBookmarks;
    }

    res.json({
      success: true,
      data: { post: postData },
    });
  } catch (error) {
    logger.error('Get post error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch post',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
});

/**
 * @route   POST /api/posts
 * @desc    Create a new post
 * @access  Private
 */
router.post('/', 
  authenticateToken, 
  postLimiter, 
  uploadConfigs.postAttachments,
  validateCreatePost, 
  async (req, res) => {
    try {
      const {
        title,
        content,
        category,
        university,
        semester,
        year,
        tags = [],
      } = req.body;

      // Create the post
      const post = await Post.create({
        title,
        content,
        category,
        university,
        semester,
        year,
        userId: req.user.id,
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
          postId: post.id,
        }));

        await FileUpload.bulkCreate(fileUploads);
      }

      // Handle tags
      if (tags && tags.length > 0) {
        const tagInstances = await Promise.all(
          tags.map(async (tagName) => {
            const [tag] = await Tag.findOrCreate({
              where: { name: tagName.toLowerCase() },
              defaults: {
                name: tagName.toLowerCase(),
                displayName: tagName,
              },
            });
            await tag.increment('usageCount');
            return tag;
          })
        );

        await post.setTags(tagInstances);
      }

      // Fetch the complete post with associations
      const createdPost = await Post.findByPk(post.id, {
        include: [
          {
            model: User,
            as: 'author',
            attributes: ['id', 'displayName', 'avatar', 'university'],
          },
          {
            model: Tag,
            as: 'tags',
            attributes: ['id', 'name', 'displayName', 'color'],
            through: { attributes: [] },
          },
          {
            model: FileUpload,
            as: 'attachments',
            attributes: ['id', 'originalName', 'fileName', 'fileUrl', 'mimeType', 'fileSize'],
          },
        ],
      });

      logger.info(`New post created by ${req.user.email}: ${title}`);

      res.status(201).json({
        success: true,
        message: 'Post created successfully',
        data: { post: createdPost },
      });
    } catch (error) {
      logger.error('Create post error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to create post',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined,
      });
    }
  }
);

/**
 * @route   PUT /api/posts/:id
 * @desc    Update a post
 * @access  Private (Author only)
 */
router.put('/:id', 
  authenticateToken, 
  validateUUID('id'),
  validateUpdatePost, 
  async (req, res) => {
    try {
      const post = await Post.findOne({
        where: { id: req.params.id, status: 'active' },
        include: [
          {
            model: User,
            as: 'author',
            attributes: ['id', 'displayName', 'avatar'],
          },
        ],
      });

      if (!post) {
        return res.status(404).json({
          success: false,
          message: 'Post not found',
        });
      }

      // Check if user is the author or has admin privileges
      if (post.userId !== req.user.id && req.user.role !== 'admin') {
        return res.status(403).json({
          success: false,
          message: 'Not authorized to update this post',
        });
      }

      const { title, content, category, tags } = req.body;
      const updateData = {};

      if (title !== undefined) updateData.title = title;
      if (content !== undefined) updateData.content = content;
      if (category !== undefined) updateData.category = category;

      await post.update(updateData);

      // Handle tags update
      if (tags && Array.isArray(tags)) {
        const tagInstances = await Promise.all(
          tags.map(async (tagName) => {
            const [tag] = await Tag.findOrCreate({
              where: { name: tagName.toLowerCase() },
              defaults: {
                name: tagName.toLowerCase(),
                displayName: tagName,
              },
            });
            await tag.increment('usageCount');
            return tag;
          })
        );

        await post.setTags(tagInstances);
      }

      // Fetch updated post with associations
      const updatedPost = await Post.findByPk(post.id, {
        include: [
          {
            model: User,
            as: 'author',
            attributes: ['id', 'displayName', 'avatar', 'university'],
          },
          {
            model: Tag,
            as: 'tags',
            attributes: ['id', 'name', 'displayName', 'color'],
            through: { attributes: [] },
          },
        ],
      });

      logger.info(`Post updated: ${post.id} by ${req.user.email}`);

      res.json({
        success: true,
        message: 'Post updated successfully',
        data: { post: updatedPost },
      });
    } catch (error) {
      logger.error('Update post error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to update post',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined,
      });
    }
  }
);

/**
 * @route   DELETE /api/posts/:id
 * @desc    Delete a post (soft delete)
 * @access  Private (Author only)
 */
router.delete('/:id', 
  authenticateToken, 
  validateUUID('id'),
  async (req, res) => {
    try {
      const post = await Post.findOne({
        where: { id: req.params.id, status: 'active' },
      });

      if (!post) {
        return res.status(404).json({
          success: false,
          message: 'Post not found',
        });
      }

      // Check if user is the author or has admin privileges
      if (post.userId !== req.user.id && req.user.role !== 'admin') {
        return res.status(403).json({
          success: false,
          message: 'Not authorized to delete this post',
        });
      }

      await post.update({ status: 'deleted' });

      logger.info(`Post deleted: ${post.id} by ${req.user.email}`);

      res.json({
        success: true,
        message: 'Post deleted successfully',
      });
    } catch (error) {
      logger.error('Delete post error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to delete post',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined,
      });
    }
  }
);

/**
 * @route   POST /api/posts/:id/vote
 * @desc    Vote on a post (upvote/downvote)
 * @access  Private
 */
router.post('/:id/vote', 
  authenticateToken, 
  validateUUID('id'),
  async (req, res) => {
    try {
      const { voteType } = req.body;

      if (!['upvote', 'downvote'].includes(voteType)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid vote type. Must be "upvote" or "downvote"',
        });
      }

      const post = await Post.findOne({
        where: { id: req.params.id, status: 'active' },
      });

      if (!post) {
        return res.status(404).json({
          success: false,
          message: 'Post not found',
        });
      }

      // Check if user already voted
      const existingVote = await PostVote.findOne({
        where: { postId: post.id, userId: req.user.id },
      });

      if (existingVote) {
        if (existingVote.voteType === voteType) {
          // Remove vote if same type
          await existingVote.destroy();
          await post.decrement(voteType === 'upvote' ? 'upvotes' : 'downvotes');
          
          res.json({
            success: true,
            message: 'Vote removed',
            data: { action: 'removed', voteType },
          });
        } else {
          // Change vote type
          await existingVote.update({ voteType });
          await post.decrement(existingVote.voteType === 'upvote' ? 'upvotes' : 'downvotes');
          await post.increment(voteType === 'upvote' ? 'upvotes' : 'downvotes');
          
          res.json({
            success: true,
            message: 'Vote updated',
            data: { action: 'updated', voteType },
          });
        }
      } else {
        // Create new vote
        await PostVote.create({
          postId: post.id,
          userId: req.user.id,
          voteType,
        });
        await post.increment(voteType === 'upvote' ? 'upvotes' : 'downvotes');
        
        res.json({
          success: true,
          message: 'Vote added',
          data: { action: 'added', voteType },
        });
      }
    } catch (error) {
      logger.error('Vote post error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to vote on post',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined,
      });
    }
  }
);

/**
 * @route   POST /api/posts/:id/bookmark
 * @desc    Bookmark/unbookmark a post
 * @access  Private
 */
router.post('/:id/bookmark', 
  authenticateToken, 
  validateUUID('id'),
  async (req, res) => {
    try {
      const post = await Post.findOne({
        where: { id: req.params.id, status: 'active' },
      });

      if (!post) {
        return res.status(404).json({
          success: false,
          message: 'Post not found',
        });
      }

      const existingBookmark = await Bookmark.findOne({
        where: { postId: post.id, userId: req.user.id },
      });

      if (existingBookmark) {
        // Remove bookmark
        await existingBookmark.destroy();
        await post.decrement('bookmarks');
        
        res.json({
          success: true,
          message: 'Bookmark removed',
          data: { bookmarked: false },
        });
      } else {
        // Add bookmark
        await Bookmark.create({
          postId: post.id,
          userId: req.user.id,
        });
        await post.increment('bookmarks');
        
        res.json({
          success: true,
          message: 'Post bookmarked',
          data: { bookmarked: true },
        });
      }
    } catch (error) {
      logger.error('Bookmark post error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to bookmark post',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined,
      });
    }
  }
);

module.exports = router;
