module.exports = (sequelize, DataTypes) => {
  const FileUpload = sequelize.define('FileUpload', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    originalName: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    fileName: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    filePath: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    fileUrl: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    mimeType: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    fileSize: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    uploadStatus: {
      type: DataTypes.ENUM('uploading', 'completed', 'failed'),
      defaultValue: 'uploading',
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
      references: {
        model: 'posts',
        key: 'id',
      },
    },
    replyId: {
      type: DataTypes.UUID,
      references: {
        model: 'post_replies',
        key: 'id',
      },
    },
    messageId: {
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
    tableName: 'file_uploads',
    indexes: [
      {
        fields: ['user_id'],
      },
      {
        fields: ['post_id'],
      },
      {
        fields: ['reply_id'],
      },
      {
        fields: ['message_id'],
      },
      {
        fields: ['upload_status'],
      },
    ],
  });

  FileUpload.associate = (models) => {
    FileUpload.belongsTo(models.User, {
      foreignKey: 'userId',
      as: 'uploader',
    });
    
    FileUpload.belongsTo(models.Post, {
      foreignKey: 'postId',
      as: 'post',
    });
    
    FileUpload.belongsTo(models.PostReply, {
      foreignKey: 'replyId',
      as: 'reply',
    });
    
    FileUpload.belongsTo(models.Message, {
      foreignKey: 'messageId',
      as: 'message',
    });
  };

  return FileUpload;
};
