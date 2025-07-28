module.exports = (sequelize, DataTypes) => {
  const Message = sequelize.define('Message', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    content: {
      type: DataTypes.TEXT,
      allowNull: false,
      validate: {
        len: [1, 2000],
      },
    },
    messageType: {
      type: DataTypes.ENUM('text', 'image', 'file', 'system', 'announcement'),
      defaultValue: 'text',
    },
    isEdited: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    editedAt: {
      type: DataTypes.DATE,
    },
    isDeleted: {
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
    replyToId: {
      type: DataTypes.UUID,
      references: {
        model: 'messages',
        key: 'id',
      },
    },
    metadata: {
      type: DataTypes.JSONB,
      defaultValue: {},
    },
  }, {
    tableName: 'messages',
    indexes: [
      {
        fields: ['chat_id'],
      },
      {
        fields: ['user_id'],
      },
      {
        fields: ['created_at'],
      },
      {
        fields: ['reply_to_id'],
      },
    ],
  });

  Message.associate = (models) => {
    Message.belongsTo(models.Chat, {
      foreignKey: 'chatId',
      as: 'chat',
    });
    
    Message.belongsTo(models.User, {
      foreignKey: 'userId',
      as: 'sender',
    });
    
    Message.belongsTo(models.Message, {
      foreignKey: 'replyToId',
      as: 'replyToMessage',
    });
    
    Message.hasMany(models.Message, {
      foreignKey: 'replyToId',
      as: 'replies',
    });
    
    Message.hasMany(models.FileUpload, {
      foreignKey: 'messageId',
      as: 'attachments',
    });
  };

  return Message;
};
