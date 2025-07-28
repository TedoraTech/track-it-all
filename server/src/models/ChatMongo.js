const mongoose = require('mongoose');

const chatSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Chat name is required'],
    trim: true,
    maxlength: [100, 'Chat name cannot be longer than 100 characters']
  },
  description: {
    type: String,
    trim: true,
    maxlength: [500, 'Description cannot be longer than 500 characters']
  },
  category: {
    type: String,
    required: [true, 'Category is required'],
    enum: [
      'Study Groups',
      'Career & Networking',
      'Academic',
      'Social',
      'Support Groups',
      'University Specific',
      'General'
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
  avatar: {
    type: String,
    default: null
  },
  isPrivate: {
    type: Boolean,
    default: false
  },
  requiresApproval: {
    type: Boolean,
    default: false
  },
  maxMembers: {
    type: Number,
    min: [2, 'Chat must have at least 2 members'],
    max: [1000, 'Chat cannot have more than 1000 members']
  },
  memberCount: {
    type: Number,
    default: 0
  },
  tags: [{
    type: String,
    trim: true
  }],
  rules: [{
    type: String,
    trim: true
  }],
  settings: {
    allowFileUploads: { type: Boolean, default: true },
    allowPolls: { type: Boolean, default: true },
    moderationEnabled: { type: Boolean, default: false },
    autoDeleteMessages: { type: Boolean, default: false },
    autoDeleteDays: { type: Number, default: 30 }
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Creator is required']
  },
  isActive: {
    type: Boolean,
    default: true
  },
  lastMessageAt: {
    type: Date,
    default: Date.now
  },
  lastMessage: {
    content: String,
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    sentAt: Date
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes for better query performance
chatSchema.index({ category: 1 });
chatSchema.index({ university: 1 });
chatSchema.index({ createdBy: 1 });
chatSchema.index({ isActive: 1 });
chatSchema.index({ lastMessageAt: -1 });
chatSchema.index({ isPrivate: 1 });
chatSchema.index({ tags: 1 });

// Text index for search functionality
chatSchema.index({ 
  name: 'text', 
  description: 'text', 
  tags: 'text' 
});

// Virtual to populate members
chatSchema.virtual('members', {
  ref: 'ChatMember',
  localField: '_id',
  foreignField: 'chat'
});

module.exports = mongoose.model('Chat', chatSchema);
