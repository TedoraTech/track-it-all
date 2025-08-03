const mongoose = require('mongoose');
const { connectDB } = require('../config/database');

// Import all models
const User = require('./User');
const Post = require('./Post');
const PostReply = require('./PostReply');
const PostVote = require('./PostVote');
const Bookmark = require('./Bookmark');
const Chat = require('./Chat');
const ChatMember = require('./ChatMember');
const Message = require('./Message');
const VisaCase = require('./VisaCase');
const University = require('./University');
const Tag = require('./Tag');
const FileUpload = require('./FileUpload');

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
