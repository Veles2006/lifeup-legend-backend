import mongoose from 'mongoose';
import Inventory from '../models/Inventory.js';

export const addItemInventory = async (req, res) => {
    try {
        const userId = req.user._id;
        const { itemId, amount = 1 } = req.body;

        await Inventory.updateOne(
            { userId, itemId },
            {
                $inc: { quantity: amount },

                $setOnInsert: { userId, itemId },
            },
            { upsert: true }
        );

        res.status(201).json({ message: 'Item added to inventory' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

export const getInventory = async (req, res) => {
    try {
        const inventory = await Inventory.find({
            userId: req.user._id,
        }).populate('itemId', 'name rank category description icon');

        res.status(200).json(inventory);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

export const useItem = async (req, res) => {
    try {
        const { itemId } = req.body;
        const userId = req.user._id;

        if (!itemId) {
            return res.status(400).json({ message: 'itemId is required' });
        }

        if (!mongoose.Types.ObjectId.isValid(itemId)) {
            return res.status(400).json({ message: 'Invalid itemId' });
        }

        const item = await Inventory.findOneAndUpdate(
            {
                userId,
                itemId,
                quantity: { $gt: 0 },
            },
            {
                $inc: { quantity: -1 },
            },
            { new: true }
        );

        if (!item) {
            return res.status(400).json({ message: 'Không đủ item' });
        }

        res.status(200).json({
            message: 'Used item successfully!',
            quantity: item.quantity,
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};
