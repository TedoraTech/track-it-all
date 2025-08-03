const express = require('express');
const router = express.Router();
const { Post, User, PostReply, PostVote, Tag, Bookmark, FileUpload } = require('../models');
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

    if (category) whereClause.category = category;
    if (university) whereClause.university = university;
    if (semester) whereClause.semester = semester;
    if (year) whereClause.year = year;
    if (featured === 'true') whereClause.isFeatured = true;

    if (searchQuery) {
      whereClause.$or = [
        { title: { $regex: searchQuery, $options: 'i' } },
        { content: { $regex: searchQuery, $options: 'i' } },
      ];
    }

    const totalCount = await Post.countDocuments(whereClause);
    const posts = await Post.find(whereClause)
      .populate('author', 'id displayName avatar university reputation')
      .populate('tags', 'id name displayName color')
      .populate('replies', 'id')
      .sort({ [sortBy]: sortOrder.toLowerCase() === 'desc' ? -1 : 1 })
      .limit(parseInt(limit))
      .skip(offset)
      .lean();

    const formattedPosts = posts.map(post => {
      const postData = { ...post };
      postData.replyCount = postData.replies?.length || 0;
      delete postData.replies;

      // Note: User vote and bookmark status would need to be fetched separately in MongoDB
      // This is a simplified version
      if (req.user) {
        // TODO: Implement user vote and bookmark status lookup
        postData.userVote = null;
        postData.isBookmarked = false;
      }

      return postData;
    });

    res.json({
      success: true,
      data: {
        posts: formattedPosts,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(totalCount / limit),
          totalItems: totalCount,
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

router.get('/:id', validateUUID('id'), optionalAuth, async (req, res) => {
  try {
    const post = await Post.findOne({ _id: req.params.id, status: 'active' })
      .populate('author', 'id displayName avatar university reputation')
      .populate('tags', 'id name displayName color')
      .populate('attachments', 'id originalName fileName fileUrl mimeType fileSize')
      .lean();

    if (!post) {
      return res.status(404).json({
        success: false,
        message: 'Post not found',
      });
    }

    // Increment views in MongoDB
    await Post.findByIdAndUpdate(req.params.id, { $inc: { views: 1 } });

    const postData = { ...post };
    if (req.user) {
      // TODO: Implement user vote and bookmark status lookup for MongoDB
      postData.userVote = null;
      postData.isBookmarked = false;
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

      const post = await Post.create({
        title,
        content,
        category,
        university,
        semester,
        year,
        author: req.user.id,
        status: 'active',
      });

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
          postId: post._id,
        }));

        await FileUpload.insertMany(fileUploads);
      }

      if (tags && tags.length > 0) {
        const tagInstances = await Promise.all(
          tags.map(async (tagName) => {
            let tag = await Tag.findOne({ name: tagName.toLowerCase() });
            if (!tag) {
              tag = await Tag.create({
                name: tagName.toLowerCase(),
                displayName: tagName,
                usageCount: 1,
              });
            } else {
              await Tag.findByIdAndUpdate(tag._id, { $inc: { usageCount: 1 } });
            }
            return tag._id;
          })
        );

        await Post.findByIdAndUpdate(post._id, { tags: tagInstances });
      }

      const createdPost = await Post.findById(post._id)
        .populate('author', 'id displayName avatar university')
        .populate('tags', 'id name displayName color')
        .populate('attachments', 'id originalName fileName fileUrl mimeType fileSize')
        .lean();

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

// DELETE route is documented above with PUT route
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

      const existingVote = await PostVote.findOne({
        where: { postId: post.id, userId: req.user.id },
      });

      if (existingVote) {
        if (existingVote.voteType === voteType) {
          await existingVote.destroy();
          await post.decrement(voteType === 'upvote' ? 'upvotes' : 'downvotes');
          
          res.json({
            success: true,
            message: 'Vote removed',
            data: { action: 'removed', voteType },
          });
        } else {
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
        await existingBookmark.destroy();
        await post.decrement('bookmarks');
        
        res.json({
          success: true,
          message: 'Bookmark removed',
          data: { bookmarked: false },
        });
      } else {
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
