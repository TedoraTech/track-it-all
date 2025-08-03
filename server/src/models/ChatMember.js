const mongoose = require('mongoose');

const chatMemberSchema = new mongoose.Schema({
  chat: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Chat',
    required: [true, 'Chat is required']
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'User is required']
  },
  role: {
    type: String,
    enum: ['owner', 'admin', 'moderator', 'member'],
    default: 'member'
  },
  joinedAt: {
    type: Date,
    default: Date.now
  },
  lastReadAt: {
    type: Date,
    default: Date.now
  },
  lastReadMessage: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Message'
  },
  isMuted: {
    type: Boolean,
    default: false
  },
  mutedUntil: {
    type: Date
  },
  isActive: {
    type: Boolean,
    default: true
  },
  permissions: {
    canSendMessages: { type: Boolean, default: true },
    canUploadFiles: { type: Boolean, default: true },
    canCreatePolls: { type: Boolean, default: true },
    canMentionEveryone: { type: Boolean, default: false },
    canDeleteOwnMessages: { type: Boolean, default: true },
    canEditOwnMessages: { type: Boolean, default: true }
  },
  nickname: {
    type: String,
    trim: true,
    maxlength: [50, 'Nickname cannot be longer than 50 characters']
  }
}, {
  timestamps: true
});

// Compound index to ensure unique user per chat
chatMemberSchema.index({ chat: 1, user: 1 }, { unique: true });

// Additional indexes
chatMemberSchema.index({ user: 1 });
chatMemberSchema.index({ role: 1 });
chatMemberSchema.index({ isActive: 1 });
chatMemberSchema.index({ joinedAt: -1 });

// Virtual for unread message count
chatMemberSchema.virtual('unreadCount').get(function() {
  // This would be calculated dynamically in the application logic
  return 0;
});

module.exports = mongoose.model('ChatMember', chatMemberSchema);
