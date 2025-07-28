module.exports = (sequelize, DataTypes) => {
  const VisaStatusUpdate = sequelize.define('VisaStatusUpdate', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    previousStatus: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    newStatus: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    updateDate: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
    notes: {
      type: DataTypes.TEXT,
    },
    isSystemGenerated: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    visaCaseId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'visa_cases',
        key: 'id',
      },
    },
    updatedBy: {
      type: DataTypes.UUID,
      references: {
        model: 'users',
        key: 'id',
      },
    },
  }, {
    tableName: 'visa_status_updates',
    indexes: [
      {
        fields: ['visa_case_id'],
      },
      {
        fields: ['update_date'],
      },
      {
        fields: ['updated_by'],
      },
    ],
  });

  VisaStatusUpdate.associate = (models) => {
    VisaStatusUpdate.belongsTo(models.VisaCase, {
      foreignKey: 'visaCaseId',
      as: 'visaCase',
    });
    
    VisaStatusUpdate.belongsTo(models.User, {
      foreignKey: 'updatedBy',
      as: 'updater',
    });
  };

  return VisaStatusUpdate;
};
