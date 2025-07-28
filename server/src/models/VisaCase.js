module.exports = (sequelize, DataTypes) => {
  const VisaCase = sequelize.define('VisaCase', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    caseNumber: {
      type: DataTypes.STRING,
      unique: true,
      validate: {
        len: [8, 50],
      },
    },
    visaType: {
      type: DataTypes.ENUM('F-1', 'H-1B', 'OPT', 'STEM-OPT', 'CPT', 'J-1', 'L-1', 'O-1', 'Other'),
      allowNull: false,
    },
    currentStatus: {
      type: DataTypes.ENUM(
        'Application Submitted',
        'RFE Received',
        'Biometrics Scheduled',
        'Biometrics Completed',
        'Interview Scheduled',
        'Interview Completed',
        'Case Transferred',
        'Decision Notice Sent',
        'Card Being Produced',
        'Card Mailed',
        'Case Approved',
        'Case Denied',
        'Administrative Processing',
        'Case Reopened'
      ),
      allowNull: false,
    },
    priority: {
      type: DataTypes.ENUM('standard', 'premium'),
      defaultValue: 'standard',
    },
    applicationDate: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    expectedDecisionDate: {
      type: DataTypes.DATE,
    },
    actualDecisionDate: {
      type: DataTypes.DATE,
    },
    processingCenter: {
      type: DataTypes.STRING,
      validate: {
        len: [0, 100],
      },
    },
    attorney: {
      type: DataTypes.STRING,
      validate: {
        len: [0, 100],
      },
    },
    employer: {
      type: DataTypes.STRING,
      validate: {
        len: [0, 100],
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
    isActive: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    },
    notes: {
      type: DataTypes.TEXT,
    },
    metadata: {
      type: DataTypes.JSONB,
      defaultValue: {},
    },
  }, {
    tableName: 'visa_cases',
    indexes: [
      {
        fields: ['case_number'],
        unique: true,
      },
      {
        fields: ['user_id'],
      },
      {
        fields: ['visa_type'],
      },
      {
        fields: ['current_status'],
      },
      {
        fields: ['application_date'],
      },
      {
        fields: ['processing_center'],
      },
    ],
  });

  VisaCase.associate = (models) => {
    VisaCase.belongsTo(models.User, {
      foreignKey: 'userId',
      as: 'user',
    });
    
    VisaCase.hasMany(models.VisaStatusUpdate, {
      foreignKey: 'visaCaseId',
      as: 'statusUpdates',
    });
  };

  return VisaCase;
};
