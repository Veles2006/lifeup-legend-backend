import UserSchedule from '../models/UserSchedule.js';
import Task from '../models/Task.js';
import User from '../models/User.js';
import { calculateDailyTaskLogic } from './taskAI.service.js';
import { convertToUserTime, formatHHMM, formatYYYYMMDD } from '../utils/time.js';
import { startOfToday } from '../utils/time.js';
import { endOfToday } from '../utils/time.js';

export async function runDailyTaskCheck() {
    const now = new Date();
    const schedules = await UserSchedule.find({ enabled: true });

    for (const schedule of schedules) {
        const userTime = convertToUserTime(now, schedule.timezone);
        const currentHHMM = formatHHMM(userTime);

        if (!schedule.times.includes(currentHHMM)) continue;

        // 🔒 CHỐT: đã spawn hôm nay chưa?
        const alreadySpawned = await Task.exists({
            userId: schedule.userId,
            type: 'daily',
            spawnTime: currentHHMM,
            date: {
                $gte: startOfToday(userTime),
                $lte: endOfToday(userTime),
            },
        });

        if (alreadySpawned) continue;

        await spawnDailyTask(schedule.userId, currentHHMM, userTime);
    }
}

async function spawnDailyTask(userId, currentHHMM, userTime) {
    const taskData = await calculateDailyTaskLogic(userId);
    const dateKey = formatYYYYMMDD(userTime);


    await Task.create({
        userId,
        ...taskData,
        type: 'daily',
        source: 'ai',
        status: 'pending',
        date: userTime,
        dateKey,
        deadline: endOfToday(userTime),
        spawnTime: currentHHMM,
    });
}

const RANDOM_SPAWN_CHANCE = 0.15; // 15%
const MAX_RANDOM_ACTIVE = 1;

export async function runRandomSpawn() {
    const users = await User.find({}); // hoặc chỉ user active

    for (const user of users) {
        // 1️⃣ Giới hạn số random task đang tồn tại
        const activeRandomCount = await Task.countDocuments({
            userId: user._id,
            type: 'random',
            status: { $in: ['pending', 'in_progress'] },
        });

        if (activeRandomCount >= MAX_RANDOM_ACTIVE) continue;

        // 2️⃣ Roll random
        if (Math.random() > RANDOM_SPAWN_CHANCE) continue;

        // 3️⃣ Spawn task
        await spawnRandomTask(user._id);
    }
}

async function spawnRandomTask(userId) {
    const taskData = await generateTaskByAI(userId);

    await Task.create({
        userId,
        ...taskData,
        type: 'random',
        source: 'system',
        status: 'pending',
    });
}
