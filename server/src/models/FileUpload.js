const mongoose = require('mongoose');
const path = require('path');

const fileUploadSchema = new mongoose.Schema({
  fileName: {
    type: String,
    required: true
  },
  originalName: {
    type: String,
    required: true
  },
  filePath: {
    type: String,
    required: true
  },
  url: {
    type: String,
    required: true
  },
  size: {
    type: Number,
    required: true,
    max: [10485760, 'File size cannot exceed 10MB'] // 10MB limit
  },
  mimeType: {
    type: String,
    required: true,
    validate: {
      validator: function(v) {
        // Allow common file types
        const allowedTypes = [
          'image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp',
          'application/pdf', 'text/plain', 'application/msword',
          'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
        ];
        return allowedTypes.includes(v);
      },
      message: 'File type not supported'
    }
  },
  uploadedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  entityType: {
    type: String,
    enum: ['post', 'message', 'avatar', 'general'],
    required: true
  },
  entityId: {
    type: mongoose.Schema.Types.ObjectId
  },
  isPublic: {
    type: Boolean,
    default: true
  },
  storage: {
    type: String,
    enum: ['local', 's3'],
    default: 'local'
  },
  metadata: {
    width: Number,
    height: Number,
    duration: Number, // for videos/audio
    thumbnail: String
  },
  downloadCount: {
    type: Number,
    default: 0
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, { 
  timestamps: true 
});

// Indexes for better query performance
fileUploadSchema.index({ uploadedBy: 1 }); // Index for finding files by uploader
fileUploadSchema.index({ entityType: 1, entityId: 1 }); // Compound index for finding files by entity
fileUploadSchema.index({ mimeType: 1 }); // Index for filtering by file type
fileUploadSchema.index({ createdAt: -1 }); // Index for sorting by upload date
fileUploadSchema.index({ isActive: 1, isPublic: 1 }); // Compound index for active public files

// Virtual for file extension
fileUploadSchema.virtual('extension').get(function() {
  return path.extname(this.originalName).toLowerCase();
});

// Virtual for file size in human readable format
fileUploadSchema.virtual('humanReadableSize').get(function() {
  const bytes = this.size;
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
});

// Virtual for checking if file is an image
fileUploadSchema.virtual('isImage').get(function() {
  return this.mimeType.startsWith('image/');
});

// Method to increment download count
fileUploadSchema.methods.incrementDownload = function() {
  this.downloadCount += 1;
  return this.save();
};

// Method to soft delete file
fileUploadSchema.methods.softDelete = function() {
  this.isActive = false;
  return this.save();
};

// Static method to find files by entity
fileUploadSchema.statics.findByEntity = function(entityType, entityId) {
  return this.find({ 
    entityType, 
    entityId, 
    isActive: true 
  }).sort({ createdAt: -1 });
};

// Static method to find public files
fileUploadSchema.statics.findPublic = function(limit = 20) {
  return this.find({ 
    isPublic: true, 
    isActive: true 
  })
  .populate('uploadedBy', 'firstName lastName avatar')
  .sort({ createdAt: -1 })
  .limit(limit);
};

module.exports = mongoose.model('FileUpload', fileUploadSchema);
