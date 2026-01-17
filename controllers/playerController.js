import Player from '../models/Player.js';

export const getPlayer = async (req, res) => {
    try {
        const userId = req.user._id;

        const player = await Player.findOne({ userId });

        res.status(200).json(player);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

export const updatePlayerProgress = async (req, res) => {
    try {
        const userId = req.user._id;

        const { exp = 0, gold = 0, diamond = 0, gem = 0 } = req.body;

        if (exp < 0 || gold < 0 || diamond < 0 || gem < 0) {
            return res.status(400).json({ err: 'Invalid reward values' });
        }

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
            { upsert: true, new: true },
        );
        res.status(200).json(player);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

export const deletePlayer = async (req, res) => {
    try {
        const userId = req.user._id;

        await Player.findOneAndDelete({ userId });

        if (!deleted) {
            return res.status(404).json({ message: 'Player not found' });
        }

        res.status(200).json({ message: 'Player deleted successfully' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};
