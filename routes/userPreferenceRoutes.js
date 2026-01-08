import express from 'express';
import { createUserPreference } from '../controllers/userPreferenceController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();


router.post('/', protect, createUserPreference);

export default router;
