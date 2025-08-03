const mongoose = require('mongoose');

const postReplySchema = new mongoose.Schema({
  post: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Post',
    required: [true, 'Post is required']
  },
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Author is required']
  },
  content: {
    type: String,
    required: [true, 'Content is required'],
    trim: true,
    maxlength: [5000, 'Reply cannot be longer than 5000 characters']
  },
  parent: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'PostReply',
    default: null // null for top-level replies
  },
  attachments: [{
    fileName: String,
    originalName: String,
    url: String,
    size: Number,
    mimeType: String
  }],
  upvotes: {
    type: Number,
    default: 0
  },
  downvotes: {
    type: Number,
    default: 0
  },
  isAccepted: {
    type: Boolean,
    default: false
  },
  isAnonymous: {
    type: Boolean,
    default: false
  },
  depth: {
    type: Number,
    default: 0,
    max: [5, 'Reply depth cannot exceed 5 levels']
  },
  replyCount: {
    type: Number,
    default: 0
  },
  isEdited: {
    type: Boolean,
    default: false
  },
  editedAt: {
    type: Date
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual for total votes
postReplySchema.virtual('totalVotes').get(function() {
  return this.upvotes - this.downvotes;
});

// Indexes for better query performance
postReplySchema.index({ post: 1, createdAt: -1 });
postReplySchema.index({ author: 1 });
postReplySchema.index({ parent: 1 });
postReplySchema.index({ isAccepted: 1 });
postReplySchema.index({ depth: 1 });

// Text index for search functionality
postReplySchema.index({ 
  content: 'text' 
});

// Pre-save middleware to calculate depth and update parent reply count
postReplySchema.pre('save', async function(next) {
  if (this.isNew && this.parent) {
    try {
      // Find parent reply to calculate depth
      const parentReply = await this.constructor.findById(this.parent);
      if (parentReply) {
        this.depth = parentReply.depth + 1;
        
        // Update parent's reply count
        await this.constructor.findByIdAndUpdate(
          this.parent,
          { $inc: { replyCount: 1 } }
        );
      }
    } catch (error) {
      return next(error);
    }
  }
  
  // Set editedAt if content is modified
  if (this.isModified('content') && !this.isNew) {
    this.isEdited = true;
    this.editedAt = new Date();
  }
  
  next();
});

// Post-save middleware to update post reply count
postReplySchema.post('save', async function() {
  if (this.isNew) {
    try {
      await mongoose.model('Post').findByIdAndUpdate(
        this.post,
        { 
          $inc: { replyCount: 1 },
          $set: { lastActivityAt: new Date() }
        }
      );
    } catch (error) {
      console.error('Error updating post reply count:', error);
    }
  }
});

// Post-remove middleware to update counters
postReplySchema.post('deleteOne', { document: true }, async function() {
  try {
    // Update post reply count
    await mongoose.model('Post').findByIdAndUpdate(
      this.post,
      { $inc: { replyCount: -1 } }
    );
    
    // Update parent reply count if this was a nested reply
    if (this.parent) {
      await this.constructor.findByIdAndUpdate(
        this.parent,
        { $inc: { replyCount: -1 } }
      );
    }
    
    // Delete all child replies
    await this.constructor.deleteMany({ parent: this._id });
  } catch (error) {
    console.error('Error in post-remove middleware:', error);
  }
});

// Method to get reply thread
postReplySchema.methods.getThread = async function() {
  const replies = await this.constructor
    .find({ parent: this._id })
    .populate('author', 'firstName lastName avatar')
    .sort({ createdAt: 1 });
  
  // Recursively get nested replies
  for (let reply of replies) {
    reply.replies = await reply.getThread();
  }
  
  return replies;
};

// Static method to get replies tree for a post
postReplySchema.statics.getPostRepliesTree = async function(postId) {
  const topLevelReplies = await this
    .find({ post: postId, parent: null })
    .populate('author', 'firstName lastName avatar')
    .sort({ isAccepted: -1, createdAt: 1 });
  
  // Get nested replies for each top-level reply
  for (let reply of topLevelReplies) {
    reply.replies = await reply.getThread();
  }
  
  return topLevelReplies;
};

module.exports = mongoose.model('PostReply', postReplySchema);
