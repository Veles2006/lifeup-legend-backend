import UserSchedule from '../models/UserSchedule.js';
import Task from '../models/Task.js';
import User from '../models/User.js';
import { calculateDailyTaskLogic } from './taskAI.service.js';
import {
    convertToUserTime,
    formatHHMM,
    formatYYYYMMDD,
} from '../utils/time.js';
import { startOfToday } from '../utils/time.js';
import { endOfToday } from '../utils/time.js';
import { sendDailyTaskNotification } from './notificationService.js';
import { generateTaskGoal } from './taskGoalService.js';
import Goal from '../models/Goal.js';

const DAY_MAP = [
    'Sunday',
    'Monday',
    'Tuesday',
    'Wednesday',
    'Thursday',
    'Friday',
    'Saturday',
];

const IMAGE_URL = [
    'https://i.pinimg.com/736x/9c/91/4b/9c914b5cfab2210c579183d5d7956c98.jpg',
    'https://i.pinimg.com/736x/9d/1e/16/9d1e1665355084b5b2ba5b2100769e73.jpg',
    'https://i.pinimg.com/736x/cb/c1/82/cbc1823811d5c02278d7ab23b195141e.jpg',
];

export async function runDailyTaskCheck() {
    const now = new Date();
    const schedules = await UserSchedule.find({ enabled: true });

    for (const schedule of schedules) {
        const userTime = convertToUserTime(now, schedule.timezone);
        const currentHHMM = formatHHMM(userTime);

        if (schedule.times.includes(currentHHMM)) {
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

        if (schedule.timeGoal === currentHHMM) {
            const dayConfig = schedule.dayOfWeek.find(
                (d) => d.day === DAY_MAP[userTime.getDay()],
            );
            if (!dayConfig || !dayConfig.enabled) continue;
            const availableHours = dayConfig.availableHours;

            await spawnDailyTaskGoal(
                schedule.userId,
                currentHHMM,
                userTime,
                availableHours,
            );
        }
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

    // Test
    await sendDailyTaskNotification({
        title: taskData.name,
        body: taskData.description.slice(0, 120),
        image: 'https://i.pinimg.com/1200x/88/9b/56/889b564954981b5715e70b7a0592a21f.jpg',
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

async function spawnDailyTaskGoal(
    userId,
    currentHHMM,
    userTime,
    availableHours,
) {
    const data = await generateTaskGoal(userId, availableHours, userTime);

    // 1️⃣ Check data có hợp lệ không
    if (!Array.isArray(data)) {
        console.error('[generateTaskGoal] Invalid return type', {
            userId,
            type: typeof data,
            value: data,
        });
        return; // thoát luôn, không làm gì tiếp
    }

    // 2️⃣ Không có task nào để tạo
    if (data.length === 0) {
        console.info('[generateTaskGoal] No tasks generated', {
            userId,
            availableHours,
            userTime,
        });
        return;
    }

    const dateKey = formatYYYYMMDD(userTime);

    // 3️⃣ Loop an toàn
    for (const entry of data) {
        if (!entry?.taskData || !entry?.goalData) {
            console.warn('[generateTaskGoal] Invalid task entry skipped', {
                userId,
                entry,
            });
            continue; // bỏ qua phần tử lỗi
        }

        const { taskData, goalData } = entry;

        try {
            const task = await Task.create({
                userId,
                ...taskData,
                type: 'goal',
                source: 'ai',
                status: 'pending',
                requirement: 'timer_task',
                date: userTime,
                dateKey,
                goalId: goalData.goalId,
                subGoalId: goalData.subGoalId,
                deadline: endOfToday(userTime),
            });

            await Goal.updateOne(
                {
                    userId,
                    _id: goalData.goalId,
                    'subGoal._id': goalData.subGoalId,
                },
                {
                    $push: {
                        'subGoal.$.taskIds': task._id,
                    },
                },
            );
        } catch (err) {
            console.error(
                '[generateTaskGoal] Failed to create task or update goal',
                {
                    userId,
                    taskData,
                    goalData,
                    err,
                },
            );
            // không throw để các task khác vẫn chạy
        }
    }

    const image = IMAGE_URL[Math.floor(Math.random() * IMAGE_URL.length)];

    // Test
    await sendDailyTaskNotification({
        title: 'Nhiệm vụ cho mục tiêu của bạn đã được khởi tạo',
        body: 'Đây là nội dung của nhiệm vụ đó vui lòng đọc kỹ ------------------- chỉ có thế thôi',
        image,
    });
}
