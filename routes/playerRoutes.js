import express from 'express';
import {
    getPlayer,
    updatePlayerProgress,
    deletePlayer,
} from '../controllers/playerController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/', protect, getPlayer);
router.post('/', protect, updatePlayerProgress);
router.delete('/', protect, deletePlayer);

export default router;
