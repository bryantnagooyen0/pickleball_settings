import express from 'express';
import {
  createPaddle,
  deletePaddle,
  getPaddles,
  getPaddle,
  updatePaddle,
  searchPaddles,
} from '../controllers/paddle.controller.js';

const router = express.Router();

router.get('/', getPaddles);
router.get('/search', searchPaddles);
router.get('/:id', getPaddle);
router.post('/', createPaddle);
router.put('/:id', updatePaddle);
router.delete('/:id', deletePaddle);

export default router;
