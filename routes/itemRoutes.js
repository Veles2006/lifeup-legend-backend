import express from 'express';
import {
    getAllItems,
    getItemById,
    createItem,
    updateItem,
    deleteItem,
} from '../controllers/itemController.js';
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get('/', protect, getAllItems);
router.get('/:id', protect, getItemById);
router.post('/', protect, createItem);
router.put('/:id', protect, updateItem);
router.delete('/:id', protect, deleteItem);

export default router;
