const { DataTypes } = require('sequelize');

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Create VisaCases table
    await queryInterface.createTable('VisaCases', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: DataTypes.INTEGER,
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
      visaType: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      country: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      applicationDate: {
        type: DataTypes.DATE,
        allowNull: false,
      },
      currentStatus: {
        type: DataTypes.ENUM(
          'not_started',
          'document_preparation',
          'application_submitted',
          'biometrics_scheduled',
          'biometrics_completed',
          'interview_scheduled',
          'interview_completed',
          'under_review',
          'additional_documents_requested',
          'approved',
          'rejected',
          'withdrawn'
        ),
        defaultValue: 'not_started',
      },
      priority: {
        type: DataTypes.ENUM('low', 'medium', 'high', 'urgent'),
        defaultValue: 'medium',
      },
      embassy: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      consulate: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      applicationNumber: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      expectedProcessingTime: {
        type: DataTypes.INTEGER, // in days
        allowNull: true,
      },
      actualProcessingTime: {
        type: DataTypes.INTEGER, // in days
        allowNull: true,
      },
      estimatedDecisionDate: {
        type: DataTypes.DATE,
        allowNull: true,
      },
      actualDecisionDate: {
        type: DataTypes.DATE,
        allowNull: true,
      },
      fees: {
        type: DataTypes.JSON, // { amount: number, currency: string, description: string }
        allowNull: true,
      },
      documents: {
        type: DataTypes.JSON, // array of document objects
        allowNull: true,
      },
      notes: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      isPublic: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
      },
      tags: {
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

    // Create VisaStatusUpdates table
    await queryInterface.createTable('VisaStatusUpdates', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: DataTypes.INTEGER,
      },
      visaCaseId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: 'VisaCases',
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      previousStatus: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      newStatus: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      description: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      attachments: {
        type: DataTypes.JSON,
        allowNull: true,
      },
      location: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      officer: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      nextSteps: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      estimatedDuration: {
        type: DataTypes.INTEGER, // in days
        allowNull: true,
      },
      isSystemGenerated: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
      },
      isPublic: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
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

    // Create VisaDocuments table
    await queryInterface.createTable('VisaDocuments', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: DataTypes.INTEGER,
      },
      visaCaseId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: 'VisaCases',
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      name: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      type: {
        type: DataTypes.ENUM(
          'passport',
          'form',
          'photo',
          'financial_statement',
          'invitation_letter',
          'employment_letter',
          'educational_certificate',
          'medical_report',
          'police_clearance',
          'insurance',
          'travel_itinerary',
          'other'
        ),
        allowNull: false,
      },
      status: {
        type: DataTypes.ENUM('required', 'uploaded', 'verified', 'rejected', 'not_applicable'),
        defaultValue: 'required',
      },
      fileId: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: {
          model: 'FileUploads',
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL',
      },
      description: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      requirements: {
        type: DataTypes.JSON,
        allowNull: true,
      },
      rejectionReason: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      expiryDate: {
        type: DataTypes.DATE,
        allowNull: true,
      },
      isOptional: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
      },
      submittedAt: {
        type: DataTypes.DATE,
        allowNull: true,
      },
      verifiedAt: {
        type: DataTypes.DATE,
        allowNull: true,
      },
      verifiedBy: {
        type: DataTypes.STRING,
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

    // Create VisaAppointments table
    await queryInterface.createTable('VisaAppointments', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: DataTypes.INTEGER,
      },
      visaCaseId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: 'VisaCases',
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      type: {
        type: DataTypes.ENUM('biometrics', 'interview', 'document_submission', 'other'),
        allowNull: false,
      },
      scheduledDate: {
        type: DataTypes.DATE,
        allowNull: false,
      },
      location: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      address: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      status: {
        type: DataTypes.ENUM('scheduled', 'confirmed', 'completed', 'rescheduled', 'cancelled', 'no_show'),
        defaultValue: 'scheduled',
      },
      duration: {
        type: DataTypes.INTEGER, // in minutes
        allowNull: true,
      },
      officer: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      outcome: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      notes: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      reminderSent: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
      },
      reminderDate: {
        type: DataTypes.DATE,
        allowNull: true,
      },
      attendees: {
        type: DataTypes.JSON,
        allowNull: true,
      },
      requirements: {
        type: DataTypes.JSON,
        allowNull: true,
      },
      completedAt: {
        type: DataTypes.DATE,
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

    // Add indexes for visa analytics system
    await queryInterface.addIndex('VisaCases', ['userId']);
    await queryInterface.addIndex('VisaCases', ['visaType']);
    await queryInterface.addIndex('VisaCases', ['country']);
    await queryInterface.addIndex('VisaCases', ['currentStatus']);
    await queryInterface.addIndex('VisaCases', ['applicationDate']);
    await queryInterface.addIndex('VisaCases', ['isPublic']);
    
    await queryInterface.addIndex('VisaStatusUpdates', ['visaCaseId']);
    await queryInterface.addIndex('VisaStatusUpdates', ['newStatus']);
    await queryInterface.addIndex('VisaStatusUpdates', ['createdAt']);
    
    await queryInterface.addIndex('VisaDocuments', ['visaCaseId']);
    await queryInterface.addIndex('VisaDocuments', ['type']);
    await queryInterface.addIndex('VisaDocuments', ['status']);
    
    await queryInterface.addIndex('VisaAppointments', ['visaCaseId']);
    await queryInterface.addIndex('VisaAppointments', ['type']);
    await queryInterface.addIndex('VisaAppointments', ['scheduledDate']);
    await queryInterface.addIndex('VisaAppointments', ['status']);
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('VisaAppointments');
    await queryInterface.dropTable('VisaDocuments');
    await queryInterface.dropTable('VisaStatusUpdates');
    await queryInterface.dropTable('VisaCases');
  }
};
