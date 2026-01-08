import express from 'express';
import { createUserSchedule } from '../controllers/userScheduleController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();


router.post('/', protect, createUserSchedule);

export default router;
