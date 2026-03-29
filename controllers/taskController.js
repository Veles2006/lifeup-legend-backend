import mongoose from 'mongoose';
import Inventory from '../models/Inventory.js';
import Player from '../models/Player.js';
import Task from '../models/Task.js';

// export const getTasks = async (req, res) => {
//     try {
//         const allTasks = await Task.find({});
//         res.json(allTasks);
//     } catch (err) {
//         res.status(500).json({ error: err.message });
//     }
// };

export const createTask = async (req, res) => {
    try {
        const userId = req.user._id;
        const {
            name,
            type,
            source,
            description,
            requirement,
            reward,
            penalty,
            deadline,
            date,
            progress,
            difficulty,
        } = req.body;

        if (!name || !name.trim()) {
            return res.status(400).json({ error: 'Name is required' });
        }

        const task = new Task({
            userId,
            name: name.trim(),
            type,
            source,
            description,
            requirement,
            difficulty,
            reward,
            penalty,
            deadline,
            date,
            progress,
        });

        await task.save();
        return res.status(201).json({
            id: task._id,
            name,
            description,
            difficulty,
            reward,
            penalty,
            deadline,
            date,
            progress,
        });
    } catch (err) {
        return res.status(500).json({ error: err.message });
    }
};

export const getTasksById = async (req, res) => {
    try {
        const userId = req.user._id;

        const allTasks = await Task.find({ userId }).populate({
            path: 'reward.items.itemId',
            select: '_id name tier rank category description icon',
        });

        return res.json(allTasks);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

const updatePlayerProgress = async (
    { userId, exp, gold, diamond, gem },
    { session },
) => {
    const safe = (n) => Math.max(0, Number(n) || 0);

    const inc = {
        exp: safe(exp),
        gold: safe(gold),
        diamond: safe(diamond),
        gem: safe(gem),
    };

    const player = await Player.findOneAndUpdate(
        { userId },
        {
            $inc: inc,
            $setOnInsert: { userId, level: 1 },
        },
        { upsert: true, new: true, session },
    );
    return player;
};

const addItemsInventory = async ({ userId, items }, { session }) => {
    const ops = items
        .filter((i) => i.itemId)
        .map(({ itemId, amount = 1 }) => ({
            updateOne: {
                filter: { userId, itemId },
                update: {
                    $inc: { quantity: Math.max(0, Number(amount) || 0) },
                    $setOnInsert: { userId, itemId },
                },
                upsert: true,
            },
        }));

    if (ops.length > 0) {
        return await Inventory.bulkWrite(ops, { session });
    }
};

export const updateTaskStatus = async (req, res) => {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
        const userId = req.user._id;
        const {
            status,
            exp = 0,
            gold = 0,
            diamond = 0,
            gem = 0,
            items,
        } = req.body;

        if (
            ![
                'pending',
                'in_progress',
                'completed',
                'failed',
                'expired',
            ].includes(status)
        ) {
            await session.abortTransaction();
            session.endSession();
            return res.status(400).json({ error: 'Trạng thái không hợp lệ' });
        }

        const updatedTask = await Task.findByIdAndUpdate(
            { _id: req.params.id, status: { $ne: 'completed' } },
            { status },
            { new: true, session },
        ).populate({
            path: 'reward.items.itemId',
            select: 'name tier rank category description icon',
        });

        if (!updatedTask) {
            await session.abortTransaction();
            session.endSession();
            return res.status(404).json({
                error: 'Không tìm thấy nhiệm vụ hoặc nhiệm vụ đã được hoàn thành trước đó',
            });
        }

        if (status === 'completed') {
            if (!userId) {
                await session.abortTransaction();
                session.endSession();
                return res.status(400).json({ error: 'userId is required' });
            }
            const player = await updatePlayerProgress(
                {
                    userId,
                    exp,
                    gold,
                    diamond,
                    gem,
                },
                { session },
            );

            const inventoryItems = Array.isArray(items) ? items : items?.items;

            if (Array.isArray(inventoryItems) && inventoryItems.length !== 0) {
                await addItemsInventory(
                    { userId, items: inventoryItems },
                    { session },
                );
            }
        }

        await session.commitTransaction();
        session.endSession();

        return res.json(updatedTask);
    } catch (err) {
        await session.abortTransaction();
        session.endSession();
        return res.status(500).json({ error: err.message });
    }
};

export const deleteTask = async (req, res) => {
    try {
        const deleted = await Task.findByIdAndDelete(req.params.id);

        if (!deleted) {
            return res.status(404).json({ error: 'Không tìm thấy nhiệm vụ' });
        }

        return res.json({ message: '🗑️ Đã xóa nhiệm vụ thành công', deleted });
    } catch (err) {
        return res.status(500).json({ error: err.message });
    }
};
