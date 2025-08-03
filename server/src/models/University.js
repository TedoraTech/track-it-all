const mongoose = require('mongoose');

const universitySchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'University name is required'],
    unique: true,
    trim: true
  },
  code: {
    type: String,
    required: [true, 'University code is required'],
    unique: true,
    uppercase: true,
    trim: true
  },
  country: {
    type: String,
    required: [true, 'Country is required'],
    trim: true
  },
  state: {
    type: String,
    trim: true
  },
  city: {
    type: String,
    required: [true, 'City is required'],
    trim: true
  },
  website: {
    type: String,
    trim: true,
    match: [
      /^https?:\/\/.+/,
      'Please provide a valid website URL'
    ]
  },
  logo: {
    type: String,
    trim: true
  },
  description: {
    type: String,
    maxlength: [1000, 'Description cannot be longer than 1000 characters']
  },
  ranking: {
    world: Number,
    national: Number,
    subject: [{
      field: String,
      rank: Number,
      year: Number
    }]
  },
  statistics: {
    totalStudents: Number,
    internationalStudents: Number,
    facultyCount: Number,
    establishedYear: Number
  },
  isActive: {
    type: Boolean,
    default: true
  },
  timezone: {
    type: String,
    default: 'UTC'
  },
  contactInfo: {
    email: String,
    phone: String,
    address: String
  }
}, {
  timestamps: true
});

// Indexes for better query performance
universitySchema.index({ name: 'text' });
universitySchema.index({ country: 1 });
universitySchema.index({ isActive: 1 });
// Note: code index is automatically created due to unique: true

module.exports = mongoose.model('University', universitySchema);
