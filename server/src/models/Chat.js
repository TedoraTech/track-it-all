module.exports = (sequelize, DataTypes) => {
  const Chat = sequelize.define('Chat', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        len: [2, 100],
      },
    },
    description: {
      type: DataTypes.TEXT,
      validate: {
        len: [0, 500],
      },
    },
    avatar: {
      type: DataTypes.STRING,
    },
    category: {
      type: DataTypes.ENUM('Academic', 'Visa', 'Housing', 'Jobs', 'Social', 'Sports', 'Tech', 'Research'),
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
    isActive: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    },
    isPrivate: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    memberLimit: {
      type: DataTypes.INTEGER,
      defaultValue: 500,
    },
    memberCount: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
    lastMessageAt: {
      type: DataTypes.DATE,
    },
    createdBy: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'users',
        key: 'id',
      },
    },
    settings: {
      type: DataTypes.JSONB,
      defaultValue: {
        allowFileUploads: true,
        allowExternalLinks: true,
        moderationEnabled: false,
        announceNewMembers: true,
      },
    },
  }, {
    tableName: 'chats',
    indexes: [
      {
        fields: ['category'],
      },
      {
        fields: ['university'],
      },
      {
        fields: ['created_by'],
      },
      {
        fields: ['is_active'],
      },
      {
        fields: ['is_private'],
      },
      {
        fields: ['last_message_at'],
      },
    ],
  });

  Chat.associate = (models) => {
    Chat.belongsTo(models.User, {
      foreignKey: 'createdBy',
      as: 'creator',
    });
    
    Chat.hasMany(models.ChatMember, {
      foreignKey: 'chatId',
      as: 'memberships',
    });
    
    Chat.hasMany(models.Message, {
      foreignKey: 'chatId',
      as: 'messages',
    });
    
    Chat.belongsToMany(models.User, {
      through: models.ChatMember,
      foreignKey: 'chatId',
      otherKey: 'userId',
      as: 'members',
    });
  };

  return Chat;
};
