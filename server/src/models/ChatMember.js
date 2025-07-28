module.exports = (sequelize, DataTypes) => {
  const ChatMember = sequelize.define('ChatMember', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    role: {
      type: DataTypes.ENUM('member', 'moderator', 'admin'),
      defaultValue: 'member',
    },
    joinedAt: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
    lastReadAt: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    },
    isMuted: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    chatId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'chats',
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
    tableName: 'chat_members',
    indexes: [
      {
        fields: ['chat_id', 'user_id'],
        unique: true,
      },
      {
        fields: ['user_id'],
      },
      {
        fields: ['chat_id'],
      },
    ],
  });

  ChatMember.associate = (models) => {
    ChatMember.belongsTo(models.Chat, {
      foreignKey: 'chatId',
      as: 'chat',
    });
    
    ChatMember.belongsTo(models.User, {
      foreignKey: 'userId',
      as: 'user',
    });
  };

  return ChatMember;
};
