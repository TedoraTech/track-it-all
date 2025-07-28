const mongoose = require('mongoose');

const bookmarkSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'User is required']
  },
  post: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Post',
    required: [true, 'Post is required']
  },
  tags: [{
    type: String,
    trim: true
  }],
  notes: {
    type: String,
    maxlength: [500, 'Notes cannot be longer than 500 characters']
  }
}, {
  timestamps: true
});

// Compound index to ensure unique bookmarks
bookmarkSchema.index({ user: 1, post: 1 }, { unique: true });

// Additional indexes
bookmarkSchema.index({ user: 1, createdAt: -1 });
bookmarkSchema.index({ tags: 1 });

module.exports = mongoose.model('Bookmark', bookmarkSchema);
