module.exports = (sequelize, DataTypes) => {
  const University = sequelize.define('University', {
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
        len: [2, 100],
      },
    },
    shortName: {
      type: DataTypes.STRING,
      validate: {
        len: [1, 20],
      },
    },
    country: {
      type: DataTypes.STRING,
      defaultValue: 'United States',
      validate: {
        len: [2, 50],
      },
    },
    state: {
      type: DataTypes.STRING,
      validate: {
        len: [2, 50],
      },
    },
    city: {
      type: DataTypes.STRING,
      validate: {
        len: [2, 50],
      },
    },
    website: {
      type: DataTypes.STRING,
      validate: {
        isUrl: true,
      },
    },
    logoUrl: {
      type: DataTypes.STRING,
      validate: {
        isUrl: true,
      },
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    },
    studentCount: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
    metadata: {
      type: DataTypes.JSONB,
      defaultValue: {},
    },
  }, {
    tableName: 'universities',
    indexes: [
      {
        fields: ['name'],
        unique: true,
      },
      {
        fields: ['country'],
      },
      {
        fields: ['state'],
      },
      {
        fields: ['is_active'],
      },
    ],
  });

  University.associate = (models) => {
    // Universities can have many students (users)
    University.hasMany(models.User, {
      foreignKey: 'university',
      sourceKey: 'name',
      as: 'students',
    });
  };

  return University;
};
