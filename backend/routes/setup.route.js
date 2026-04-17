import express from 'express';
import {
  getSetups,
  getRecentSetups,
  getPaddlesWithSetups,
  getSetup,
  createSetup,
  updateSetup,
  deleteSetup,
  toggleLike,
} from '../controllers/setup.controller.js';
import { authMiddleware } from '../middleware/auth.js';

const router = express.Router();

router.get('/', getSetups);
router.get('/recent', getRecentSetups);
router.get('/paddles-with-setups', getPaddlesWithSetups);
router.get('/:id', getSetup);
router.post('/', authMiddleware, createSetup);
router.put('/:id', authMiddleware, updateSetup);
router.delete('/:id', authMiddleware, deleteSetup);
router.post('/:id/like', authMiddleware, toggleLike);

export default router;
