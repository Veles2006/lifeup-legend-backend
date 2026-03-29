import express from 'express';
import {
    createTask,
    updateTaskStatus,
    deleteTask,
    getTasksById,
} from '../controllers/taskController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/', protect, getTasksById);
router.post('/', protect, createTask);
router.post('/:id/status', protect, updateTaskStatus);
router.delete('/:id', protect, deleteTask);

export default router;
