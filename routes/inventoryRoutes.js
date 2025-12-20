import express from 'express';
import {
    getInventory,
    addItemInventory,
    useItem,
} from '../controllers/inventoryController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/', protect, getInventory);
router.post('/', protect, addItemInventory);
router.post('/use', protect, useItem);

export default router;
