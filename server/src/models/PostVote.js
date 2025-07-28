module.exports = (sequelize, DataTypes) => {
  const PostVote = sequelize.define('PostVote', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    voteType: {
      type: DataTypes.ENUM('upvote', 'downvote'),
      allowNull: false,
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
  }, {
    tableName: 'post_votes',
    indexes: [
      {
        fields: ['post_id', 'user_id'],
        unique: true,
      },
      {
        fields: ['user_id'],
      },
    ],
  });

  PostVote.associate = (models) => {
    PostVote.belongsTo(models.Post, {
      foreignKey: 'postId',
      as: 'post',
    });
    
    PostVote.belongsTo(models.User, {
      foreignKey: 'userId',
      as: 'user',
    });
  };

  return PostVote;
};
