import express from 'express';

import {
  createPlayer,
  deletePlayer,
  getPlayers,
  getPlayer,
  updatePlayer,
} from '../controllers/player.controller.js';
import { authMiddleware, adminMiddleware } from '../middleware/auth.js';

const router = express.Router();

router.get('/', getPlayers);

router.get('/:id', getPlayer);

router.post('/', authMiddleware, adminMiddleware, createPlayer);

router.put('/:id', authMiddleware, adminMiddleware, updatePlayer);

router.delete('/:id', authMiddleware, adminMiddleware, deletePlayer);

router.get('/', (req, res) => {
  res.send('API is working');
});

export default router;
