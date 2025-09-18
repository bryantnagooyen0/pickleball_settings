import express from 'express';
import {
  getComments,
  createComment,
  updateComment,
  deleteComment,
  getUserComments,
  getAllComments,
  adminDeleteComment,
  voteComment,
} from '../controllers/comment.controller.js';
import { authMiddleware } from '../middleware/auth.js';

const router = express.Router();

// Get comments by the authenticated user (protected route) - MUST come before parameterized route
router.get('/user/my-comments', authMiddleware, getUserComments);

// Get all comments for admin users (protected route) - MUST come before parameterized route
router.get('/admin/all', authMiddleware, getAllComments);

// Get comments for a specific target (public route)
router.get('/:targetType/:targetId', getComments);

// Create a new comment (protected route)
router.post('/', authMiddleware, createComment);

// Update a comment (protected route)
router.put('/:id', authMiddleware, updateComment);

// Delete a comment (protected route)
router.delete('/:id', authMiddleware, deleteComment);

// Admin delete comment (hard delete) - protected route
router.delete('/admin/:id', authMiddleware, adminDeleteComment);

// Vote on a comment (protected route)
router.post('/:id/vote', authMiddleware, voteComment);

export default router;
