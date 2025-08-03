const mongoose = require('mongoose');

const tagSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true,
    maxlength: [50, 'Tag name cannot exceed 50 characters']
  },
  displayName: {
    type: String,
    required: true,
    trim: true,
    maxlength: [50, 'Display name cannot exceed 50 characters']
  },
  description: {
    type: String,
    maxlength: [200, 'Description cannot exceed 200 characters']
  },
  category: {
    type: String,
    enum: ['academic', 'visa', 'city', 'university', 'general', 'technology', 'career'],
    default: 'general'
  },
  color: {
    type: String,
    default: '#6B7280',
    match: [/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/, 'Please provide a valid hex color']
  },
  usage_count: {
    type: Number,
    default: 0,
    min: 0
  },
  isActive: {
    type: Boolean,
    default: true
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
}, { 
  timestamps: true 
});

// Indexes for better query performance
tagSchema.index({ name: 'text', displayName: 'text' }); // Text search index
tagSchema.index({ category: 1 }); // Index for filtering by category
tagSchema.index({ usage_count: -1 }); // Index for sorting by popularity
tagSchema.index({ isActive: 1, usage_count: -1 }); // Compound index for active tags by popularity
tagSchema.index({ createdAt: -1 }); // Index for sorting by creation date

// Virtual for popularity level based on usage count
tagSchema.virtual('popularityLevel').get(function() {
  if (this.usage_count >= 100) return 'high';
  if (this.usage_count >= 20) return 'medium';
  if (this.usage_count >= 5) return 'low';
  return 'new';
});

// Virtual for popularity percentage (relative to max usage)
tagSchema.virtual('popularityPercentage').get(function() {
  // This would need to be calculated against the max usage count in the collection
  // For now, we'll use a simple calculation
  const maxExpected = 1000;
  return Math.min((this.usage_count / maxExpected) * 100, 100);
});

// Method to increment usage count
tagSchema.methods.incrementUsage = function() {
  this.usage_count += 1;
  return this.save();
};

// Method to decrement usage count (when a post/item is deleted)
tagSchema.methods.decrementUsage = function() {
  if (this.usage_count > 0) {
    this.usage_count -= 1;
    return this.save();
  }
  return Promise.resolve(this);
};

// Static method to find popular tags
tagSchema.statics.findPopular = function(limit = 10) {
  return this.find({ isActive: true })
    .sort({ usage_count: -1 })
    .limit(limit);
};

// Static method to find tags by category
tagSchema.statics.findByCategory = function(category) {
  return this.find({ 
    category, 
    isActive: true 
  }).sort({ usage_count: -1 });
};

// Static method to search tags
tagSchema.statics.searchTags = function(searchTerm, limit = 20) {
  return this.find({
    $and: [
      { isActive: true },
      {
        $or: [
          { name: { $regex: searchTerm, $options: 'i' } },
          { displayName: { $regex: searchTerm, $options: 'i' } },
          { description: { $regex: searchTerm, $options: 'i' } }
        ]
      }
    ]
  })
  .sort({ usage_count: -1 })
  .limit(limit);
};

// Pre-save middleware to set displayName if not provided
tagSchema.pre('save', function(next) {
  if (!this.displayName) {
    // Convert lowercase name to display format (capitalize first letter)
    this.displayName = this.name.charAt(0).toUpperCase() + this.name.slice(1);
  }
  next();
});

module.exports = mongoose.model('Tag', tagSchema);