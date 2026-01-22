import express from 'express';
import {
    getAllBlockeds,
    createBlock,
    deleteOneBlock,
    deleteManyBlock,
} from '../controllers/blockController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/', protect, getAllBlockeds);
router.post('/', protect, createBlock);
router.delete('/:blockId', protect, deleteOneBlock);
router.delete('/', protect, deleteManyBlock);

export default router;
