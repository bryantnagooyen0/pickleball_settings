import express from 'express';

import {
  createPlayer,
  deletePlayer,
  getPlayers,
  getPlayer,
  updatePlayer,
  incrementViewCount,
} from '../controllers/player.controller.js';
import { authMiddleware, adminMiddleware } from '../middleware/auth.js';
import { validatePlayer } from '../middleware/validation.js';

const router = express.Router();

router.get('/', getPlayers);

router.get('/:id', getPlayer);

router.post('/', authMiddleware, adminMiddleware, validatePlayer, createPlayer);

router.put('/:id', authMiddleware, adminMiddleware, validatePlayer, updatePlayer);

router.delete('/:id', authMiddleware, adminMiddleware, deletePlayer);

router.post('/:id/view', incrementViewCount);

export default router;
