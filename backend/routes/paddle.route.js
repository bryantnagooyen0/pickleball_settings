import express from 'express';
import {
  createPaddle,
  deletePaddle,
  getPaddles,
  getPaddle,
  updatePaddle,
  searchPaddles,
} from '../controllers/paddle.controller.js';
import { authMiddleware, adminMiddleware } from '../middleware/auth.js';

const router = express.Router();

router.get('/', getPaddles);
router.get('/search', searchPaddles);
router.get('/:id', getPaddle);
router.post('/', authMiddleware, adminMiddleware, createPaddle);
router.put('/:id', authMiddleware, adminMiddleware, updatePaddle);
router.delete('/:id', authMiddleware, adminMiddleware, deletePaddle);

export default router;
