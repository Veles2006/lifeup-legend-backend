import UserPreference from '../models/UserPreference.js';

/**
 * Tạo UserPreference mặc định cho user (dùng để test)
 */
export async function createUserPreference(req, res) {
    try {
        const { userId } = req.body;

        if (!userId) {
            return res.status(400).json({ message: 'Missing userId' });
        }

        const existing = await UserPreference.findOne({ userId });
        if (existing) {
            return res.status(400).json({
                message: 'UserPreference already exists',
                data: existing,
            });
        }

        const pref = await UserPreference.create({
            userId,
            goals: ['Lập trình'],
            availableTime: 30,
            // extraItemsCount dùng default trong schema
        });

        res.json(pref);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Create UserPreference failed' });
    }
}
