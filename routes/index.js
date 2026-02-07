import express from 'express';
import userRoutes from './userRoutes.js';
import playerRoutes from './playerRoutes.js';
import taskRoutes from './taskRoutes.js';
import itemRoutes from './itemRoutes.js';
import dictionaryRoutes from './dictionaryRoutes.js';
import authRoutes from './authRoutes.js';
import blockRoutes from './blockRoutes.js';
import inventoryRoutes from './inventoryRoutes.js';
import userPreferenceRoutes from './userPreferenceRoutes.js';
import userScheduleRoutes from './userScheduleRoutes.js';
import goalRoutes from './goalRotes.js';


const router = express.Router();

router.use('/auth', authRoutes);
router.use('/users', userRoutes);
router.use('/player', playerRoutes);
router.use('/tasks', taskRoutes);
router.use('/items', itemRoutes);
router.use('/dict', dictionaryRoutes);
router.use('/blocks', blockRoutes);
router.use('/inventory', inventoryRoutes);
router.use('/user-preference', userPreferenceRoutes);
router.use('/user-schedule', userScheduleRoutes);
router.use('/goals', goalRoutes);

export default router;
