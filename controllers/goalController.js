import mongoose from 'mongoose';
import Goal from '../models/Goal.js';

export const addGoal = async (req, res) => {
    try {
        const userId = req.user._id;
        const { goalData } = req.body;

        const goal = new Goal({
            userId,
            ...goalData,
        });

        await goal.save();

        return res.status(201).json(goal);
    } catch (err) {
        return res.status(500).json({ error: err.message });
    }
};
