module.exports = (sequelize, DataTypes) => {
  const Bookmark = sequelize.define('Bookmark', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    userId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'users',
        key: 'id',
      },
    },
    postId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'posts',
        key: 'id',
      },
    },
  }, {
    tableName: 'bookmarks',
    indexes: [
      {
        fields: ['user_id', 'post_id'],
        unique: true,
      },
      {
        fields: ['post_id'],
      },
    ],
  });

  Bookmark.associate = (models) => {
    Bookmark.belongsTo(models.User, {
      foreignKey: 'userId',
      as: 'user',
    });
    
    Bookmark.belongsTo(models.Post, {
      foreignKey: 'postId',
      as: 'post',
    });
  };

  return Bookmark;
};
