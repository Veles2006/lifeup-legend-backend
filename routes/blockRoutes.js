import express from 'express';
import { getAllBlockeds, createBlock } from '../controllers/blockController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/', protect, getAllBlockeds);
router.post('/', protect, createBlock);

export default router;
