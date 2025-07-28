const { Sequelize } = require('sequelize');
const config = require('../config/database')[process.env.NODE_ENV || 'development'];
const logger = require('../config/logger');

// Initialize Sequelize
const sequelize = new Sequelize(
  config.database,
  config.username,
  config.password,
  {
    ...config,
    logging: config.logging === false ? false : (msg) => logger.debug(msg),
  }
);

// Import models
const User = require('./User')(sequelize, Sequelize.DataTypes);
const Post = require('./Post')(sequelize, Sequelize.DataTypes);
const PostReply = require('./PostReply')(sequelize, Sequelize.DataTypes);
const PostVote = require('./PostVote')(sequelize, Sequelize.DataTypes);
const ReplyVote = require('./ReplyVote')(sequelize, Sequelize.DataTypes);
const Chat = require('./Chat')(sequelize, Sequelize.DataTypes);
const ChatMember = require('./ChatMember')(sequelize, Sequelize.DataTypes);
const Message = require('./Message')(sequelize, Sequelize.DataTypes);
const VisaCase = require('./VisaCase')(sequelize, Sequelize.DataTypes);
const VisaStatusUpdate = require('./VisaStatusUpdate')(sequelize, Sequelize.DataTypes);
const FileUpload = require('./FileUpload')(sequelize, Sequelize.DataTypes);
const Tag = require('./Tag')(sequelize, Sequelize.DataTypes);
const PostTag = require('./PostTag')(sequelize, Sequelize.DataTypes);
const Bookmark = require('./Bookmark')(sequelize, Sequelize.DataTypes);
const University = require('./University')(sequelize, Sequelize.DataTypes);

// Create models object
const models = {
  User,
  Post,
  PostReply,
  PostVote,
  ReplyVote,
  Chat,
  ChatMember,
  Message,
  VisaCase,
  VisaStatusUpdate,
  FileUpload,
  Tag,
  PostTag,
  Bookmark,
  University,
  sequelize,
  Sequelize,
};

// Define associations
Object.keys(models).forEach((modelName) => {
  if (models[modelName].associate) {
    models[modelName].associate(models);
  }
});

module.exports = models;
