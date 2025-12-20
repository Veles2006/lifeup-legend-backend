import express from 'express';
import playerRoutes from './playerRoutes.js';
import taskRoutes from './taskRoutes.js';
import itemRoutes from './itemRoutes.js';
import dictionaryRoutes from './dictionaryRoutes.js';
import authRoutes from './authRoutes.js';
import blockRoutes from './blockRoutes.js';
import inventoryRoutes from './inventoryRoutes.js';

const router = express.Router();

router.use('/auth', authRoutes);
router.use('/players', playerRoutes);
router.use('/tasks', taskRoutes);
router.use('/items', itemRoutes);
router.use('/dict', dictionaryRoutes);
router.use('/blocks', blockRoutes);
router.use('/inventory', inventoryRoutes);

export default router;
