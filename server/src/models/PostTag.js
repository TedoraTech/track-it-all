module.exports = (sequelize, DataTypes) => {
  const PostTag = sequelize.define('PostTag', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    postId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'posts',
        key: 'id',
      },
    },
    tagId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'tags',
        key: 'id',
      },
    },
  }, {
    tableName: 'post_tags',
    indexes: [
      {
        fields: ['post_id', 'tag_id'],
        unique: true,
      },
      {
        fields: ['tag_id'],
      },
    ],
  });

  PostTag.associate = (models) => {
    PostTag.belongsTo(models.Post, {
      foreignKey: 'postId',
      as: 'post',
    });
    
    PostTag.belongsTo(models.Tag, {
      foreignKey: 'tagId',
      as: 'tag',
    });
  };

  return PostTag;
};
