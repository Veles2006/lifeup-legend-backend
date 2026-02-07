import express from 'express';
import { addGoal } from '../controllers/goalController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/', protect, addGoal);

export default router;
