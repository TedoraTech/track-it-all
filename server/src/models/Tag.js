module.exports = (sequelize, DataTypes) => {
  const Tag = sequelize.define('Tag', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      validate: {
        len: [1, 50],
      },
      set(value) {
        this.setDataValue('name', value.toLowerCase());
      },
    },
    displayName: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        len: [1, 50],
      },
    },
    description: {
      type: DataTypes.TEXT,
    },
    color: {
      type: DataTypes.STRING,
      defaultValue: '#1976d2',
      validate: {
        is: /^#[0-9A-F]{6}$/i,
      },
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    },
    usageCount: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
  }, {
    tableName: 'tags',
    indexes: [
      {
        fields: ['name'],
        unique: true,
      },
      {
        fields: ['usage_count'],
      },
      {
        fields: ['is_active'],
      },
    ],
  });

  Tag.associate = (models) => {
    Tag.belongsToMany(models.Post, {
      through: models.PostTag,
      foreignKey: 'tagId',
      otherKey: 'postId',
      as: 'posts',
    });
  };

  return Tag;
};
