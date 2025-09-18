import Comment from '../models/comment.model.js';
import User from '../models/users_model.mjs';
import mongoose from 'mongoose';

// Get comments for a specific target (player or paddle) with threading
export const getComments = async (req, res) => {
  const { targetType, targetId } = req.params;

  if (!['player', 'paddle'].includes(targetType)) {
    return res.status(400).json({
      success: false,
      message: 'Invalid target type. Must be "player" or "paddle"',
    });
  }

  if (!mongoose.Types.ObjectId.isValid(targetId)) {
    return res.status(400).json({
      success: false,
      message: 'Invalid target ID',
    });
  }

  try {
    // Get all comments for this target
    const allComments = await Comment.find({
      targetType,
      targetId,
      isActive: true,
    })
      .populate('author', 'username role')
      .populate('parentComment', 'content author authorName')
      .sort({ createdAt: 1 }); // Sort by creation time for proper threading

    // Organize comments into a tree structure
    const commentMap = new Map();
    const rootComments = [];

    // First pass: create a map of all comments
    allComments.forEach(comment => {
      commentMap.set(comment._id.toString(), { ...comment.toObject(), replies: [] });
    });

    // Second pass: build the tree structure
    allComments.forEach(comment => {
      const commentObj = commentMap.get(comment._id.toString());
      
      if (comment.parentComment) {
        const parent = commentMap.get(comment.parentComment._id.toString());
        if (parent) {
          parent.replies.push(commentObj);
        }
      } else {
        rootComments.push(commentObj);
      }
    });

    res.status(200).json({ success: true, data: rootComments });
  } catch (error) {
    console.error('Error fetching comments:', error.message);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

// Create a new comment
export const createComment = async (req, res) => {
  const { content, targetType, targetId, parentCommentId } = req.body;
  const userId = req.user.id;
  const userName = req.user.username;

  if (!content || !targetType || !targetId) {
    return res.status(400).json({
      success: false,
      message: 'Content, target type, and target ID are required',
    });
  }

  if (!['player', 'paddle'].includes(targetType)) {
    return res.status(400).json({
      success: false,
      message: 'Invalid target type. Must be "player" or "paddle"',
    });
  }

  if (!mongoose.Types.ObjectId.isValid(targetId)) {
    return res.status(400).json({
      success: false,
      message: 'Invalid target ID',
    });
  }

  if (content.trim().length === 0) {
    return res.status(400).json({
      success: false,
      message: 'Comment content cannot be empty',
    });
  }

  if (content.length > 1000) {
    return res.status(400).json({
      success: false,
      message: 'Comment content cannot exceed 1000 characters',
    });
  }

  try {
    let parentComment = null;
    let depth = 0;

    // If this is a reply, validate the parent comment
    if (parentCommentId) {
      if (!mongoose.Types.ObjectId.isValid(parentCommentId)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid parent comment ID',
        });
      }

      parentComment = await Comment.findById(parentCommentId);
      if (!parentComment || !parentComment.isActive) {
        return res.status(404).json({
          success: false,
          message: 'Parent comment not found',
        });
      }

      // Ensure parent comment belongs to the same target
      if (parentComment.targetType !== targetType || parentComment.targetId.toString() !== targetId) {
        return res.status(400).json({
          success: false,
          message: 'Parent comment does not belong to the same target',
        });
      }

      // Calculate depth (max 3 levels deep)
      depth = parentComment.depth + 1;
      if (depth > 3) {
        return res.status(400).json({
          success: false,
          message: 'Maximum reply depth exceeded',
        });
      }
    }

    const newComment = new Comment({
      content: content.trim(),
      author: userId,
      authorName: userName,
      targetType,
      targetId,
      parentComment: parentCommentId || null,
      depth,
    });

    await newComment.save();
    await newComment.populate('author', 'username role');
    if (parentCommentId) {
      await newComment.populate('parentComment', 'content author authorName');
    }

    res.status(201).json({
      success: true,
      data: newComment,
      message: 'Comment created successfully',
    });
  } catch (error) {
    console.error('Error creating comment:', error.message);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

// Update a comment (only by the author)
export const updateComment = async (req, res) => {
  const { id } = req.params;
  const { content } = req.body;
  const userId = req.user.id;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({
      success: false,
      message: 'Invalid comment ID',
    });
  }

  if (!content || content.trim().length === 0) {
    return res.status(400).json({
      success: false,
      message: 'Comment content cannot be empty',
    });
  }

  if (content.length > 1000) {
    return res.status(400).json({
      success: false,
      message: 'Comment content cannot exceed 1000 characters',
    });
  }

  try {
    const comment = await Comment.findById(id);

    if (!comment) {
      return res.status(404).json({
        success: false,
        message: 'Comment not found',
      });
    }

    if (comment.author.toString() !== userId) {
      return res.status(403).json({
        success: false,
        message: 'You can only edit your own comments',
      });
    }

    if (!comment.isActive) {
      return res.status(400).json({
        success: false,
        message: 'Cannot edit deleted comment',
      });
    }

    comment.content = content.trim();
    await comment.save();
    await comment.populate('author', 'username role');

    res.status(200).json({
      success: true,
      data: comment,
      message: 'Comment updated successfully',
    });
  } catch (error) {
    console.error('Error updating comment:', error.message);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

// Get comments by a specific user
export const getUserComments = async (req, res) => {
  const userId = req.user.id;

  try {
    const comments = await Comment.find({
      author: userId,
      isActive: true,
    })
      .populate('author', 'username role')
      .sort({ createdAt: -1 });

    res.status(200).json({ success: true, data: comments });
  } catch (error) {
    console.error('Error fetching user comments:', error.message);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

// Delete a comment (soft delete - only by the author)
export const deleteComment = async (req, res) => {
  const { id } = req.params;
  const userId = req.user.id;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({
      success: false,
      message: 'Invalid comment ID',
    });
  }

  try {
    const comment = await Comment.findById(id);

    if (!comment) {
      return res.status(404).json({
        success: false,
        message: 'Comment not found',
      });
    }

    if (comment.author.toString() !== userId) {
      return res.status(403).json({
        success: false,
        message: 'You can only delete your own comments',
      });
    }

    if (!comment.isActive) {
      return res.status(400).json({
        success: false,
        message: 'Comment already deleted',
      });
    }

    comment.isActive = false;
    await comment.save();

    res.status(200).json({
      success: true,
      message: 'Comment deleted successfully',
    });
  } catch (error) {
    console.error('Error deleting comment:', error.message);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

// Get all comments for admin users
export const getAllComments = async (req, res) => {
  const userRole = req.user.role;

  if (userRole !== 'admin') {
    return res.status(403).json({
      success: false,
      message: 'Access denied. Admin role required.',
    });
  }

  try {
    const comments = await Comment.find({ isActive: true })
      .populate('author', 'username role')
      .sort({ createdAt: -1 })
      .limit(50); // Limit to 50 most recent comments

    res.status(200).json({ success: true, data: comments });
  } catch (error) {
    console.error('Error fetching all comments:', error.message);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

// Admin delete comment (hard delete)
export const adminDeleteComment = async (req, res) => {
  const { id } = req.params;
  const userRole = req.user.role;

  if (userRole !== 'admin') {
    return res.status(403).json({
      success: false,
      message: 'Access denied. Admin role required.',
    });
  }

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({
      success: false,
      message: 'Invalid comment ID',
    });
  }

  try {
    const comment = await Comment.findByIdAndDelete(id);

    if (!comment) {
      return res.status(404).json({
        success: false,
        message: 'Comment not found',
      });
    }

    res.status(200).json({
      success: true,
      message: 'Comment deleted successfully',
    });
  } catch (error) {
    console.error('Error deleting comment:', error.message);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};