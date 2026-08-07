import mongoose from 'mongoose';

const commentSchema = new mongoose.Schema(
  {
    content: {
      type: String,
      required: true,
      trim: true,
      maxlength: 1000,
    },
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    authorName: {
      type: String,
      required: true,
    },
    targetType: {
      type: String,
      required: true,
      enum: ['player', 'paddle'],
    },
    targetId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    parentComment: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Comment',
      default: null,
    },
    depth: {
      type: Number,
      default: 0,
    },
    upvotes: {
      type: Number,
      default: 0,
    },
    downvotes: {
      type: Number,
      default: 0,
    },
    votes: [{
      user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
      },
      voteType: {
        type: String,
        enum: ['upvote', 'downvote'],
        required: true,
      },
    }],
  },
  {
    timestamps: true,
  }
);

// Index for efficient queries
commentSchema.index({ targetType: 1, targetId: 1, createdAt: -1 });
commentSchema.index({ parentComment: 1, createdAt: 1 });
commentSchema.index({ 'votes.user': 1 });

const Comment = mongoose.model('Comment', commentSchema);

export default Comment;
