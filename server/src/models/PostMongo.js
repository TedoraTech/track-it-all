const mongoose = require('mongoose');

const postSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Title is required'],
    trim: true,
    maxlength: [200, 'Title cannot be longer than 200 characters']
  },
  content: {
    type: String,
    required: [true, 'Content is required'],
    trim: true
  },
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Author is required']
  },
  category: {
    type: String,
    required: [true, 'Category is required'],
    enum: [
      'Study Groups',
      'Study Resources', 
      'Career Advice',
      'Research',
      'Student Life',
      'Housing',
      'Visa & Immigration',
      'General Discussion',
      'Q&A',
      'Events'
    ]
  },
  university: {
    type: String,
    trim: true
  },
  semester: {
    type: String,
    enum: ['Spring', 'Summer', 'Fall', 'Winter']
  },
  year: {
    type: Number,
    min: [2020, 'Year must be 2020 or later'],
    max: [2030, 'Year must be 2030 or earlier']
  },
  tags: [{
    type: String,
    trim: true
  }],
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
  viewCount: {
    type: Number,
    default: 0
  },
  replyCount: {
    type: Number,
    default: 0
  },
  isAnonymous: {
    type: Boolean,
    default: false
  },
  isPinned: {
    type: Boolean,
    default: false
  },
  isLocked: {
    type: Boolean,
    default: false
  },
  hasAcceptedAnswer: {
    type: Boolean,
    default: false
  },
  lastActivityAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual for total votes
postSchema.virtual('totalVotes').get(function() {
  return this.upvotes - this.downvotes;
});

// Indexes for better query performance
postSchema.index({ author: 1 });
postSchema.index({ category: 1 });
postSchema.index({ university: 1 });
postSchema.index({ tags: 1 });
postSchema.index({ lastActivityAt: -1 });
postSchema.index({ createdAt: -1 });
postSchema.index({ isPinned: 1, lastActivityAt: -1 });

// Text index for search functionality
postSchema.index({ 
  title: 'text', 
  content: 'text', 
  tags: 'text' 
});

// Pre-save middleware to update lastActivityAt
postSchema.pre('save', function(next) {
  if (this.isNew || this.isModified('content')) {
    this.lastActivityAt = new Date();
  }
  next();
});

module.exports = mongoose.model('Post', postSchema);
