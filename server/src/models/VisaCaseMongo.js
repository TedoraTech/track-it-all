const mongoose = require('mongoose');

const visaCaseSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'User is required']
  },
  visaType: {
    type: String,
    required: [true, 'Visa type is required'],
    enum: [
      'F-1', 'J-1', 'H-1B', 'L-1', 'O-1', 'E-2', 'EB-1', 'EB-2', 'EB-3',
      'Tourist', 'Business', 'Student', 'Work', 'Family', 'Other'
    ]
  },
  country: {
    type: String,
    required: [true, 'Country is required'],
    trim: true
  },
  applicationDate: {
    type: Date,
    required: [true, 'Application date is required']
  },
  currentStatus: {
    type: String,
    enum: [
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
    ],
    default: 'not_started'
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high', 'urgent'],
    default: 'medium'
  },
  embassy: {
    type: String,
    trim: true
  },
  consulate: {
    type: String,
    trim: true
  },
  applicationNumber: {
    type: String,
    trim: true,
    unique: true,
    sparse: true // Allow multiple null values
  },
  expectedProcessingTime: {
    type: Number, // in days
    min: [1, 'Processing time must be at least 1 day']
  },
  actualProcessingTime: {
    type: Number, // in days
    min: [1, 'Processing time must be at least 1 day']
  },
  estimatedDecisionDate: {
    type: Date
  },
  actualDecisionDate: {
    type: Date
  },
  fees: {
    application: {
      amount: Number,
      currency: { type: String, default: 'USD' },
      paid: { type: Boolean, default: false },
      paidAt: Date
    },
    biometrics: {
      amount: Number,
      currency: { type: String, default: 'USD' },
      paid: { type: Boolean, default: false },
      paidAt: Date
    },
    other: [{
      description: String,
      amount: Number,
      currency: { type: String, default: 'USD' },
      paid: { type: Boolean, default: false },
      paidAt: Date
    }]
  },
  documents: [{
    name: String,
    type: {
      type: String,
      enum: [
        'passport', 'form', 'photo', 'financial_statement',
        'invitation_letter', 'employment_letter', 'educational_certificate',
        'medical_report', 'police_clearance', 'insurance',
        'travel_itinerary', 'other'
      ]
    },
    status: {
      type: String,
      enum: ['required', 'uploaded', 'verified', 'rejected', 'not_applicable'],
      default: 'required'
    },
    file: {
      fileName: String,
      originalName: String,
      url: String,
      size: Number,
      mimeType: String
    },
    uploadedAt: Date,
    verifiedAt: Date
  }],
  notes: {
    type: String,
    maxlength: [2000, 'Notes cannot be longer than 2000 characters']
  },
  isPublic: {
    type: Boolean,
    default: false
  },
  tags: [{
    type: String,
    trim: true
  }],
  timeline: [{
    status: String,
    description: String,
    date: { type: Date, default: Date.now },
    location: String,
    officer: String,
    notes: String
  }],
  appointments: [{
    type: {
      type: String,
      enum: ['biometrics', 'interview', 'document_submission', 'other']
    },
    scheduledDate: Date,
    location: String,
    status: {
      type: String,
      enum: ['scheduled', 'confirmed', 'completed', 'rescheduled', 'cancelled', 'no_show'],
      default: 'scheduled'
    },
    outcome: String,
    notes: String
  }],
  statistics: {
    daysInProgress: { type: Number, default: 0 },
    statusChanges: { type: Number, default: 0 },
    documentsSubmitted: { type: Number, default: 0 },
    appointmentsAttended: { type: Number, default: 0 }
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes for better query performance
visaCaseSchema.index({ user: 1 });
visaCaseSchema.index({ visaType: 1 });
visaCaseSchema.index({ country: 1 });
visaCaseSchema.index({ currentStatus: 1 });
visaCaseSchema.index({ applicationDate: -1 });
visaCaseSchema.index({ isPublic: 1 });
visaCaseSchema.index({ priority: 1 });

// Virtual for progress percentage
visaCaseSchema.virtual('progressPercentage').get(function() {
  const statusProgress = {
    'not_started': 0,
    'document_preparation': 15,
    'application_submitted': 30,
    'biometrics_scheduled': 45,
    'biometrics_completed': 60,
    'interview_scheduled': 75,
    'interview_completed': 85,
    'under_review': 90,
    'additional_documents_requested': 70,
    'approved': 100,
    'rejected': 100,
    'withdrawn': 0
  };
  
  return statusProgress[this.currentStatus] || 0;
});

// Virtual for days since application
visaCaseSchema.virtual('daysSinceApplication').get(function() {
  if (!this.applicationDate) return 0;
  const now = new Date();
  const diffTime = Math.abs(now - this.applicationDate);
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
});

// Method to add timeline entry
visaCaseSchema.methods.addTimelineEntry = function(entry) {
  this.timeline.push({
    ...entry,
    date: entry.date || new Date()
  });
  
  this.statistics.statusChanges += 1;
  return this.save();
};

// Method to update status
visaCaseSchema.methods.updateStatus = function(newStatus, description, location, officer) {
  const oldStatus = this.currentStatus;
  this.currentStatus = newStatus;
  
  this.addTimelineEntry({
    status: newStatus,
    description: description || `Status changed from ${oldStatus} to ${newStatus}`,
    location,
    officer
  });
  
  return this.save();
};

// Pre-save middleware to update statistics
visaCaseSchema.pre('save', function(next) {
  if (this.isNew || this.isModified('applicationDate')) {
    this.statistics.daysInProgress = this.daysSinceApplication;
  }
  
  if (this.isModified('documents')) {
    this.statistics.documentsSubmitted = this.documents.filter(doc => 
      doc.status === 'uploaded' || doc.status === 'verified'
    ).length;
  }
  
  if (this.isModified('appointments')) {
    this.statistics.appointmentsAttended = this.appointments.filter(apt => 
      apt.status === 'completed'
    ).length;
  }
  
  next();
});

module.exports = mongoose.model('VisaCase', visaCaseSchema);
