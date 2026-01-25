import mongoose from 'mongoose';
import Inventory from '../models/Inventory.js';

export const addItemsInventory = async (req, res) => {
    try {
        const userId = req.user._id;
        const { items } = req.body;

        if (!Array.isArray(items) || items.length === 0) {
            return res.status(400).json({ error: 'Items is required' });
        }

        const ops = items
            .filter((i) => i.itemId)
            .map(({ itemId, amount = 1 }) => ({
                updateOne: {
                    filter: { userId, itemId },
                    update: {
                        $inc: { quantity: Math.max(1, amount) },
                        $setOnInsert: { userId, itemId },
                    },
                    upsert: true,
                },
            }));

        await Inventory.bulkWrite(ops);

        return res.status(201).json({
            message: 'Item added to inventory',
            count: items.length,
        });
    } catch (err) {
        return res.status(500).json({ error: err.message });
    }
};

export const getInventory = async (req, res) => {
    try {
        const inventory = await Inventory.find({
            userId: req.user._id,
        }).populate(
            'itemId',
            'name tier rank category description keyInfo icon',
        );

        return res.status(200).json(inventory);
    } catch (err) {
        return res.status(500).json({ error: err.message });
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
            { new: true },
        );

        if (!item) {
            return res.status(400).json({ message: 'Không đủ item' });
        }

        return res.status(200).json({
            message: 'Used item successfully!',
            quantity: item.quantity,
        });
    } catch (err) {
        return res.status(500).json({ error: err.message });
    }
};
