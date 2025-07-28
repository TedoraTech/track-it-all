const mongoose = require('mongoose');
const { connectDB } = require('../config/database');

// Import all models
const User = require('./UserMongo');
const Post = require('./PostMongo');
const PostReply = require('./PostReplyMongo');
const PostVote = require('./PostVoteMongo');
const Bookmark = require('./BookmarkMongo');
const Chat = require('./ChatMongo');
const ChatMember = require('./ChatMemberMongo');
const Message = require('./MessageMongo');
const VisaCase = require('./VisaCaseMongo');
const University = require('./UniversityMongo');

// Additional utility models
const Tag = mongoose.model('Tag', new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  color: {
    type: String,
    default: '#1976d2',
    match: [/^#[0-9A-F]{6}$/i, 'Please provide a valid hex color']
  },
  description: {
    type: String,
    maxlength: [200, 'Description cannot be longer than 200 characters']
  },
  category: {
    type: String,
    enum: ['academic', 'career', 'social', 'technical', 'general'],
    default: 'general'
  },
  usage_count: {
    type: Number,
    default: 0
  }
}, { timestamps: true }));

const FileUpload = mongoose.model('FileUpload', new mongoose.Schema({
  fileName: {
    type: String,
    required: true
  },
  originalName: {
    type: String,
    required: true
  },
  filePath: {
    type: String,
    required: true
  },
  url: {
    type: String,
    required: true
  },
  size: {
    type: Number,
    required: true
  },
  mimeType: {
    type: String,
    required: true
  },
  uploadedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  entityType: {
    type: String,
    enum: ['post', 'message', 'avatar', 'general'],
    required: true
  },
  entityId: {
    type: mongoose.Schema.Types.ObjectId
  },
  isPublic: {
    type: Boolean,
    default: true
  },
  storage: {
    type: String,
    enum: ['local', 's3'],
    default: 'local'
  },
  metadata: {
    width: Number,
    height: Number,
    duration: Number, // for videos/audio
    thumbnail: String
  }
}, { timestamps: true }));

// Add indexes
Tag.collection.createIndex({ name: 'text' });
FileUpload.collection.createIndex({ uploadedBy: 1 });
FileUpload.collection.createIndex({ entityType: 1, entityId: 1 });

// Export all models and database connection
module.exports = {
  connectDB,
  mongoose,
  User,
  Post,
  PostReply,
  PostVote,
  Bookmark,
  Chat,
  ChatMember,
  Message,
  VisaCase,
  University,
  Tag,
  FileUpload
};
