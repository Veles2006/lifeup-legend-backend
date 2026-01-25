import UserSchedule from '../models/UserSchedule.js';

/**
 * Tạo UserSchedule test (daily task schedule)
 */
export async function createUserSchedule(req, res) {
    try {
        const { userId, times, timezone } = req.body;

        if (!userId) {
            return res.status(400).json({ message: 'Missing userId' });
        }

        const schedule = await UserSchedule.create({
            userId,
            times: times || ['08:00'],
            timezone: timezone || 'Asia/Taipei',
            enabled: true,
        });

        return res.json(schedule);
    } catch (err) {
        console.error(err);
        return res.status(500).json({ message: 'Create UserSchedule failed' });
    }
}
