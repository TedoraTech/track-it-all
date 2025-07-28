const mongoose = require('mongoose');

const postVoteSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'User is required']
  },
  post: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Post',
    required: function() {
      return !this.reply; // Required if reply is not set
    }
  },
  reply: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'PostReply',
    required: function() {
      return !this.post; // Required if post is not set
    }
  },
  voteType: {
    type: String,
    enum: ['upvote', 'downvote'],
    required: [true, 'Vote type is required']
  }
}, {
  timestamps: true
});

// Compound indexes to ensure unique votes
postVoteSchema.index({ user: 1, post: 1 }, { 
  unique: true, 
  partialFilterExpression: { post: { $exists: true } }
});

postVoteSchema.index({ user: 1, reply: 1 }, { 
  unique: true, 
  partialFilterExpression: { reply: { $exists: true } }
});

// Additional indexes
postVoteSchema.index({ voteType: 1 });
postVoteSchema.index({ createdAt: -1 });

// Pre-save middleware to update vote counts
postVoteSchema.pre('save', async function(next) {
  if (this.isNew) {
    try {
      const Model = this.post ? mongoose.model('Post') : mongoose.model('PostReply');
      const targetId = this.post || this.reply;
      const field = this.voteType === 'upvote' ? 'upvotes' : 'downvotes';
      
      await Model.findByIdAndUpdate(targetId, { $inc: { [field]: 1 } });
    } catch (error) {
      return next(error);
    }
  }
  next();
});

// Post-remove middleware to update vote counts
postVoteSchema.post('deleteOne', { document: true }, async function() {
  try {
    const Model = this.post ? mongoose.model('Post') : mongoose.model('PostReply');
    const targetId = this.post || this.reply;
    const field = this.voteType === 'upvote' ? 'upvotes' : 'downvotes';
    
    await Model.findByIdAndUpdate(targetId, { $inc: { [field]: -1 } });
  } catch (error) {
    console.error('Error updating vote count:', error);
  }
});

module.exports = mongoose.model('PostVote', postVoteSchema);
