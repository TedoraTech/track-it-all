const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
  chat: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Chat',
    required: [true, 'Chat is required']
  },
  sender: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Sender is required']
  },
  content: {
    type: String,
    trim: true,
    maxlength: [5000, 'Message cannot be longer than 5000 characters']
  },
  type: {
    type: String,
    enum: ['text', 'image', 'file', 'system', 'poll'],
    default: 'text'
  },
  attachments: [{
    fileName: String,
    originalName: String,
    url: String,
    size: Number,
    mimeType: String,
    thumbnail: String // For images/videos
  }],
  replyTo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Message'
  },
  isEdited: {
    type: Boolean,
    default: false
  },
  editedAt: {
    type: Date
  },
  isDeleted: {
    type: Boolean,
    default: false
  },
  deletedAt: {
    type: Date
  },
  reactions: [{
    emoji: String,
    users: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }]
  }],
  mentions: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  poll: {
    question: String,
    options: [{
      text: String,
      votes: [{
        user: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'User'
        },
        votedAt: {
          type: Date,
          default: Date.now
        }
      }]
    }],
    allowMultiple: { type: Boolean, default: false },
    expiresAt: Date,
    isAnonymous: { type: Boolean, default: false }
  },
  metadata: {
    clientId: String, // For message deduplication
    editHistory: [{
      content: String,
      editedAt: Date
    }]
  },
  readBy: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    readAt: {
      type: Date,
      default: Date.now
    }
  }]
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes for better query performance
messageSchema.index({ chat: 1, createdAt: -1 });
messageSchema.index({ sender: 1 });
messageSchema.index({ replyTo: 1 });
messageSchema.index({ type: 1 });
messageSchema.index({ isDeleted: 1 });
messageSchema.index({ mentions: 1 });

// Text index for search functionality
messageSchema.index({ 
  content: 'text' 
});

// Virtual for total reactions count
messageSchema.virtual('totalReactions').get(function() {
  return this.reactions.reduce((total, reaction) => total + reaction.users.length, 0);
});

// Pre-save middleware to update editedAt when content is modified
messageSchema.pre('save', function(next) {
  if (this.isModified('content') && !this.isNew) {
    this.isEdited = true;
    this.editedAt = new Date();
    
    // Add to edit history
    if (!this.metadata.editHistory) {
      this.metadata.editHistory = [];
    }
    this.metadata.editHistory.push({
      content: this.content,
      editedAt: new Date()
    });
  }
  next();
});

// Method to add reaction
messageSchema.methods.addReaction = function(emoji, userId) {
  const existingReaction = this.reactions.find(r => r.emoji === emoji);
  
  if (existingReaction) {
    // Check if user already reacted with this emoji
    const userIndex = existingReaction.users.indexOf(userId);
    if (userIndex === -1) {
      existingReaction.users.push(userId);
    }
  } else {
    this.reactions.push({
      emoji,
      users: [userId]
    });
  }
  
  return this.save();
};

// Method to remove reaction
messageSchema.methods.removeReaction = function(emoji, userId) {
  const reactionIndex = this.reactions.findIndex(r => r.emoji === emoji);
  
  if (reactionIndex !== -1) {
    const userIndex = this.reactions[reactionIndex].users.indexOf(userId);
    if (userIndex !== -1) {
      this.reactions[reactionIndex].users.splice(userIndex, 1);
      
      // Remove reaction if no users left
      if (this.reactions[reactionIndex].users.length === 0) {
        this.reactions.splice(reactionIndex, 1);
      }
    }
  }
  
  return this.save();
};

// Method to mark as read by user
messageSchema.methods.markAsRead = function(userId) {
  const existingRead = this.readBy.find(r => r.user.toString() === userId.toString());
  
  if (!existingRead) {
    this.readBy.push({
      user: userId,
      readAt: new Date()
    });
    return this.save();
  }
  
  return Promise.resolve(this);
};

module.exports = mongoose.model('Message', messageSchema);
