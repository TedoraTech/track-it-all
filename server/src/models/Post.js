module.exports = (sequelize, DataTypes) => {
  const Post = sequelize.define('Post', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    title: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        len: [5, 200],
      },
    },
    content: {
      type: DataTypes.TEXT,
      allowNull: false,
      validate: {
        len: [10, 10000],
      },
    },
    category: {
      type: DataTypes.ENUM('Visa', 'Housing', 'Academic', 'Jobs', 'Social', 'General'),
      allowNull: false,
    },
    university: {
      type: DataTypes.STRING,
      validate: {
        len: [0, 100],
      },
    },
    semester: {
      type: DataTypes.ENUM('Fall', 'Spring', 'Summer'),
    },
    year: {
      type: DataTypes.STRING,
      validate: {
        is: /^\\d{4}$/,
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
    views: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
    bookmarks: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
    isHidden: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    isFeatured: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    isPinned: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    status: {
      type: DataTypes.ENUM('active', 'archived', 'deleted'),
      defaultValue: 'active',
    },
    userId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'users',
        key: 'id',
      },
    },
    metadata: {
      type: DataTypes.JSONB,
      defaultValue: {},
    },
  }, {
    tableName: 'posts',
    indexes: [
      {
        fields: ['category'],
      },
      {
        fields: ['university'],
      },
      {
        fields: ['user_id'],
      },
      {
        fields: ['created_at'],
      },
      {
        fields: ['upvotes'],
      },
      {
        fields: ['views'],
      },
      {
        fields: ['status'],
      },
      {
        fields: ['title'],
        type: 'gin',
        using: 'gin',
        operator: 'gin_trgm_ops',
      },
      {
        fields: ['content'],
        type: 'gin',
        using: 'gin',
        operator: 'gin_trgm_ops',
      },
    ],
  });

  Post.associate = (models) => {
    Post.belongsTo(models.User, {
      foreignKey: 'userId',
      as: 'author',
    });
    
    Post.hasMany(models.PostReply, {
      foreignKey: 'postId',
      as: 'replies',
    });
    
    Post.hasMany(models.PostVote, {
      foreignKey: 'postId',
      as: 'votes',
    });
    
    Post.hasMany(models.FileUpload, {
      foreignKey: 'postId',
      as: 'attachments',
    });
    
    Post.hasMany(models.Bookmark, {
      foreignKey: 'postId',
      as: 'userBookmarks',
    });
    
    Post.belongsToMany(models.Tag, {
      through: models.PostTag,
      foreignKey: 'postId',
      otherKey: 'tagId',
      as: 'tags',
    });
  };

  return Post;
};
