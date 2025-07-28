module.exports = (sequelize, DataTypes) => {
  const PostReply = sequelize.define('PostReply', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    content: {
      type: DataTypes.TEXT,
      allowNull: false,
      validate: {
        len: [1, 5000],
      },
    },
    upvotes: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
    downvotes: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
    isAccepted: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    isHidden: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    postId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'posts',
        key: 'id',
      },
    },
    userId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'users',
        key: 'id',
      },
    },
    parentReplyId: {
      type: DataTypes.UUID,
      references: {
        model: 'post_replies',
        key: 'id',
      },
    },
  }, {
    tableName: 'post_replies',
    indexes: [
      {
        fields: ['post_id'],
      },
      {
        fields: ['user_id'],
      },
      {
        fields: ['parent_reply_id'],
      },
      {
        fields: ['created_at'],
      },
      {
        fields: ['upvotes'],
      },
      {
        fields: ['is_accepted'],
      },
    ],
  });

  PostReply.associate = (models) => {
    PostReply.belongsTo(models.Post, {
      foreignKey: 'postId',
      as: 'post',
    });
    
    PostReply.belongsTo(models.User, {
      foreignKey: 'userId',
      as: 'author',
    });
    
    PostReply.belongsTo(models.PostReply, {
      foreignKey: 'parentReplyId',
      as: 'parentReply',
    });
    
    PostReply.hasMany(models.PostReply, {
      foreignKey: 'parentReplyId',
      as: 'childReplies',
    });
    
    PostReply.hasMany(models.ReplyVote, {
      foreignKey: 'replyId',
      as: 'votes',
    });
    
    PostReply.hasMany(models.FileUpload, {
      foreignKey: 'replyId',
      as: 'attachments',
    });
  };

  return PostReply;
};
