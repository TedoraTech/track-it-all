module.exports = (sequelize, DataTypes) => {
  const ReplyVote = sequelize.define('ReplyVote', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    voteType: {
      type: DataTypes.ENUM('upvote', 'downvote'),
      allowNull: false,
    },
    replyId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'post_replies',
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
  }, {
    tableName: 'reply_votes',
    indexes: [
      {
        fields: ['reply_id', 'user_id'],
        unique: true,
      },
      {
        fields: ['user_id'],
      },
    ],
  });

  ReplyVote.associate = (models) => {
    ReplyVote.belongsTo(models.PostReply, {
      foreignKey: 'replyId',
      as: 'reply',
    });
    
    ReplyVote.belongsTo(models.User, {
      foreignKey: 'userId',
      as: 'user',
    });
  };

  return ReplyVote;
};
