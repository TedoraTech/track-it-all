const bcrypt = require('bcryptjs');

module.exports = (sequelize, DataTypes) => {
  const User = sequelize.define('User', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      validate: {
        isEmail: true,
      },
      set(value) {
        this.setDataValue('email', value.toLowerCase());
      },
    },
    password: {
      type: DataTypes.STRING,
      allowNull: true, // Allow null for OAuth users
      validate: {
        len: [6, 100],
      },
    },
    displayName: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        len: [2, 50],
      },
    },
    firstName: {
      type: DataTypes.STRING,
      validate: {
        len: [1, 30],
      },
    },
    lastName: {
      type: DataTypes.STRING,
      validate: {
        len: [1, 30],
      },
    },
    avatar: {
      type: DataTypes.STRING,
      validate: {
        isUrl: true,
      },
    },
    bio: {
      type: DataTypes.TEXT,
      validate: {
        len: [0, 500],
      },
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
    visaStatus: {
      type: DataTypes.ENUM('F-1', 'H-1B', 'OPT', 'STEM-OPT', 'CPT', 'J-1', 'L-1', 'O-1', 'Other'),
    },
    phoneNumber: {
      type: DataTypes.STRING,
      validate: {
        is: /^[+]?[1-9]\\d{1,14}$/,
      },
    },
    isEmailVerified: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    },
    role: {
      type: DataTypes.ENUM('user', 'moderator', 'admin'),
      defaultValue: 'user',
    },
    reputation: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
    lastLoginAt: {
      type: DataTypes.DATE,
    },
    emailVerificationToken: {
      type: DataTypes.STRING,
    },
    emailVerificationExpires: {
      type: DataTypes.DATE,
    },
    passwordResetToken: {
      type: DataTypes.STRING,
    },
    passwordResetExpires: {
      type: DataTypes.DATE,
    },
    refreshToken: {
      type: DataTypes.TEXT,
    },
    googleId: {
      type: DataTypes.STRING,
      unique: true,
    },
    preferences: {
      type: DataTypes.JSONB,
      defaultValue: {
        emailNotifications: true,
        pushNotifications: true,
        theme: 'light',
        language: 'en',
      },
    },
  }, {
    tableName: 'users',
    indexes: [
      {
        fields: ['email'],
        unique: true,
      },
      {
        fields: ['university'],
      },
      {
        fields: ['visa_status'],
      },
      {
        fields: ['google_id'],
        unique: true,
        where: {
          google_id: {
            [sequelize.Sequelize.Op.ne]: null,
          },
        },
      },
    ],
    hooks: {
      beforeCreate: async (user) => {
        if (user.password) {
          user.password = await bcrypt.hash(user.password, 12);
        }
      },
      beforeUpdate: async (user) => {
        if (user.changed('password') && user.password) {
          user.password = await bcrypt.hash(user.password, 12);
        }
      },
    },
  });

  User.prototype.validatePassword = async function(password) {
    if (!this.password) return false;
    return await bcrypt.compare(password, this.password);
  };

  User.prototype.toJSON = function() {
    const values = { ...this.get() };
    delete values.password;
    delete values.refreshToken;
    delete values.emailVerificationToken;
    delete values.passwordResetToken;
    return values;
  };

  User.associate = (models) => {
    User.hasMany(models.Post, {
      foreignKey: 'userId',
      as: 'posts',
    });
    
    User.hasMany(models.PostReply, {
      foreignKey: 'userId',
      as: 'replies',
    });
    
    User.hasMany(models.PostVote, {
      foreignKey: 'userId',
      as: 'postVotes',
    });
    
    User.hasMany(models.ReplyVote, {
      foreignKey: 'userId',
      as: 'replyVotes',
    });
    
    User.hasMany(models.ChatMember, {
      foreignKey: 'userId',
      as: 'chatMemberships',
    });
    
    User.hasMany(models.Message, {
      foreignKey: 'userId',
      as: 'messages',
    });
    
    User.hasMany(models.VisaCase, {
      foreignKey: 'userId',
      as: 'visaCases',
    });
    
    User.hasMany(models.Bookmark, {
      foreignKey: 'userId',
      as: 'bookmarks',
    });
    
    User.belongsToMany(models.Chat, {
      through: models.ChatMember,
      foreignKey: 'userId',
      otherKey: 'chatId',
      as: 'chats',
    });
  };

  return User;
};
