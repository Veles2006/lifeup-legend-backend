import express from 'express';
import {
    getInventory,
    addItemsInventory,
    useItem,
} from '../controllers/inventoryController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/', protect, getInventory);
router.post('/', protect, addItemsInventory);
router.post('/use', protect, useItem);

export default router;
