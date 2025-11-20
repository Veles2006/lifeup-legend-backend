import express from 'express';
import playerRoutes from './playerRoutes.js';
import taskRoutes from './taskRoutes.js';
import itemRoutes from './itemRoutes.js';

const router = express.Router();

router.use('/players', playerRoutes);
router.use('/tasks', taskRoutes);
router.use('/items', itemRoutes);

export default router;
