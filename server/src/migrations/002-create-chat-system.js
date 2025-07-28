const { DataTypes } = require('sequelize');

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Create Chats table
    await queryInterface.createTable('Chats', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: DataTypes.INTEGER,
      },
      name: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      description: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      category: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      university: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      semester: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      year: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      avatar: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      isPrivate: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
      },
      requiresApproval: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
      },
      maxMembers: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      memberCount: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
      },
      tags: {
        type: DataTypes.JSON,
        allowNull: true,
      },
      rules: {
        type: DataTypes.JSON,
        allowNull: true,
      },
      settings: {
        type: DataTypes.JSON,
        allowNull: true,
      },
      createdBy: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: 'Users',
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      isActive: {
        type: DataTypes.BOOLEAN,
        defaultValue: true,
      },
      lastMessageAt: {
        type: DataTypes.DATE,
        allowNull: true,
      },
      createdAt: {
        allowNull: false,
        type: DataTypes.DATE,
      },
      updatedAt: {
        allowNull: false,
        type: DataTypes.DATE,
      },
    });

    // Create ChatMembers table
    await queryInterface.createTable('ChatMembers', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: DataTypes.INTEGER,
      },
      chatId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: 'Chats',
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      userId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: 'Users',
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      role: {
        type: DataTypes.ENUM('owner', 'admin', 'moderator', 'member'),
        defaultValue: 'member',
      },
      joinedAt: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
      },
      lastReadAt: {
        type: DataTypes.DATE,
        allowNull: true,
      },
      lastReadMessageId: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      isMuted: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
      },
      mutedUntil: {
        type: DataTypes.DATE,
        allowNull: true,
      },
      isActive: {
        type: DataTypes.BOOLEAN,
        defaultValue: true,
      },
      permissions: {
        type: DataTypes.JSON,
        allowNull: true,
      },
      createdAt: {
        allowNull: false,
        type: DataTypes.DATE,
      },
      updatedAt: {
        allowNull: false,
        type: DataTypes.DATE,
      },
    });

    // Create Messages table
    await queryInterface.createTable('Messages', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: DataTypes.INTEGER,
      },
      chatId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: 'Chats',
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      senderId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: 'Users',
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      content: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      type: {
        type: DataTypes.ENUM('text', 'image', 'file', 'system', 'poll'),
        defaultValue: 'text',
      },
      attachments: {
        type: DataTypes.JSON,
        allowNull: true,
      },
      replyToId: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: {
          model: 'Messages',
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL',
      },
      isEdited: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
      },
      editedAt: {
        type: DataTypes.DATE,
        allowNull: true,
      },
      isDeleted: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
      },
      deletedAt: {
        type: DataTypes.DATE,
        allowNull: true,
      },
      reactions: {
        type: DataTypes.JSON,
        allowNull: true,
      },
      mentions: {
        type: DataTypes.JSON,
        allowNull: true,
      },
      metadata: {
        type: DataTypes.JSON,
        allowNull: true,
      },
      createdAt: {
        allowNull: false,
        type: DataTypes.DATE,
      },
      updatedAt: {
        allowNull: false,
        type: DataTypes.DATE,
      },
    });

    // Add indexes for chat system
    await queryInterface.addIndex('Chats', ['category']);
    await queryInterface.addIndex('Chats', ['university']);
    await queryInterface.addIndex('Chats', ['createdBy']);
    await queryInterface.addIndex('Chats', ['isActive']);
    await queryInterface.addIndex('Chats', ['lastMessageAt']);
    
    await queryInterface.addIndex('ChatMembers', ['chatId']);
    await queryInterface.addIndex('ChatMembers', ['userId']);
    await queryInterface.addIndex('ChatMembers', ['role']);
    await queryInterface.addIndex('ChatMembers', ['isActive']);
    
    await queryInterface.addIndex('Messages', ['chatId']);
    await queryInterface.addIndex('Messages', ['senderId']);
    await queryInterface.addIndex('Messages', ['replyToId']);
    await queryInterface.addIndex('Messages', ['type']);
    await queryInterface.addIndex('Messages', ['isDeleted']);
    await queryInterface.addIndex('Messages', ['createdAt']);

    // Add unique constraints
    await queryInterface.addConstraint('ChatMembers', {
      fields: ['chatId', 'userId'],
      type: 'unique',
      name: 'unique_chat_member'
    });

    // Add foreign key for lastReadMessageId
    await queryInterface.addConstraint('ChatMembers', {
      fields: ['lastReadMessageId'],
      type: 'foreign key',
      name: 'fk_chat_members_last_read_message',
      references: {
        table: 'Messages',
        field: 'id',
      },
      onDelete: 'SET NULL',
      onUpdate: 'CASCADE',
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('Messages');
    await queryInterface.dropTable('ChatMembers');
    await queryInterface.dropTable('Chats');
  }
};
