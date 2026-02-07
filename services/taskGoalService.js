import openai from '../config/ai.js';
import Goal from '../models/Goal.js';
import Item from '../models/Item.js';
import Task from '../models/Task.js';
import UserPreference from '../models/UserPreference.js';
import UserSchedule from '../models/UserSchedule.js';
import { convertToUserTime } from '../utils/time.js';

const DIFFICULTY_POOL = [
    { key: 'mortal', weight: 75 },
    { key: 'yao', weight: 12 },
    { key: 'gui', weight: 6 },
    { key: 'mara', weight: 4 },
    { key: 'sage', weight: 2 },
    { key: 'xian', weight: 0.8 },
    { key: 'deity', weight: 0.15 },
    { key: 'creation', weight: 0.05 },
];

const KEY_TIERS = [
    'white', // 0
    'gray', // 1
    'green', // 2
    'blue', // 3
    'purple', // 4
    'yellow', // 5
    'red', // 6
    'black', // 7
];

const RANK_KEY_INDEX = {
    mortal: 0,
    yao: 1,
    gui: 2,
    mara: 3,
    sage: 4,
    xian: 5,
    deity: 6,
    creation: 7,
};

const PENALTY_TABLE = {
    mortal: { exp: 5 },
    yao: { exp: 10, gold: 5 },
    gui: { exp: 15 },
    mara: { exp: 25, gold: 10 },
    sage: { exp: 40 },
    xian: { exp: 60 },
    deity: { exp: 100 },
    creation: { exp: 150 },
};

const REWARD_TABLE = {
    mortal: {
        exp: { min: 10, max: 20 },
        gold: { min: 10, max: 20 },
        // items: buildKeyDrop('mortal'), // white + gray
    },

    yao: {
        exp: { min: 20, max: 35 },
        gold: { min: 20, max: 35 },
        // items: buildKeyDrop('yao'), // gray + green
    },

    gui: {
        exp: { min: 20, max: 35 },
        gold: { min: 20, max: 35 },
        // items: buildKeyDrop('gui'), // green + blue
    },

    mara: {
        exp: { min: 20, max: 35 },
        gold: { min: 20, max: 35 },
        // items: buildKeyDrop('mara'), // blue + purple
    },

    sage: {
        exp: { min: 20, max: 35 },
        gold: { min: 20, max: 35 },
        // items: buildKeyDrop('sage'), // purple + yellow
    },

    xian: {
        exp: { min: 20, max: 35 },
        gold: { min: 20, max: 35 },
        // items: buildKeyDrop('xian'), // yellow + red
    },

    deity: {
        exp: { min: 20, max: 35 },
        gold: { min: 20, max: 35 },
        // items: buildKeyDrop('deity'), // red + black
    },

    creation: {
        exp: { min: 30, max: 50 },
        gold: { min: 30, max: 50 },
        // items: buildKeyDrop('creation'), // red + black
    },
};

const ALLOWED_KEYS_COUNT = {
    mortal: 2,
    yao: 2,
    gui: 2,
    mara: 2,
    sage: 3,
    xian: 3,
    deity: 4,
    creation: 3,
};

function generatePenalty(difficulty) {
    return PENALTY_TABLE[difficulty] || {};
}

function pickByWeight(pool) {
    const totalWeight = pool.reduce((sum, item) => sum + item.weight, 0);
    let r = Math.random() * totalWeight;
    for (const item of pool) {
        if (r < item.weight) return item;
        r -= item.weight;
    }
}

function randomWithDecay(min, max) {
    const decay = 0.85;
    let value = max;
    let chance = 1;
    for (let i = max; i >= min; i--) {
        if (Math.random() < chance) {
            value = i;
        }
        chance *= decay;
    }
    return value;
}

async function getItemsForTier(tierIndex, quantity = 1) {
    if (tierIndex < 0) {
        return [];
    }
    const tierName = KEY_TIERS[tierIndex];
    let items = await Item.find({
        tier: tierName,
        category: { $nin: ['key', 'master_key'] },
    });
    if (!items || items.length === 0) {
        return getItemsForTier(tierIndex - 1, quantity * 3);
    }

    const result = [];
    for (let i = 0; i < quantity; i++) {
        const randomIndex = Math.floor(Math.random() * items.length);
        result.push(items[randomIndex]);
    }
    return result;
}

export function formatDuration(seconds) {
    if (typeof seconds !== 'number' || seconds <= 0) {
        return '0 giờ';
    }

    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;

    const parts = [];

    if (h > 0) parts.push(`${h} giờ`);
    if (m > 0) parts.push(`${m} phút`);
    if (s > 0 && h === 0) parts.push(`${s} giây`);
    // ⬆️ thường không cần ghi giây nếu đã có giờ

    return parts.join(' ');
}

async function getRandomKeyByTier(userId, tier) {
    const result = await Item.aggregate([
        {
            $match: {
                userId,
                category: 'key',
                tier,
            },
        },
        { $sample: { size: 1 } },
    ]);

    return result[0] || null;
}

async function generateTaskGoalByAI(title, availableHours, difficulty) {
    const difficultyLabel =
        difficulty.charAt(0).toUpperCase() + difficulty.slice(1);

    // const timeText = formatDuration(availableHours);

    const prompt = `
You are a TASK CONTENT GENERATION system.

IMPORTANT RULES:
- You ONLY write or rewrite task name and task description.
- DO NOT create logic, requirements, rewards, penalties, or rules.
- DO NOT interpret or explain the meaning of difficulty.
- Difficulty is ONLY a DISPLAY LABEL.
- DO NOT mention any system, AI, or internal rules.

INPUT INFORMATION:
- Original goal: "${title}"
- Estimated time required: ${availableHours}hours
- Difficulty label: ${difficultyLabel}

OUTPUT REQUIREMENTS:
1. Task name:
   - Based on the original goal
   - Rewrite it to sound like a natural daily task title
   - Short and clear

2. Task description:
   - Must mention this is a ${difficultyLabel} difficulty task
   - Must mention it takes about ${availableHours}hours to complete
   - Focus only on what the user should do

FINAL OUTPUT:
- Return ONLY a valid JSON object
- The content MUST be written in VIETNAMESE
- Do NOT include any explanation or extra text

JSON FORMAT:
{
  "name": string,
  "description": string
}
    `.trim();

    const res = await openai.chat.completions.create({
        model: 'gpt-4.1-mini',
        messages: [{ role: 'user', content: prompt }],
        response_format: { type: 'json_object' },
        temperature: 0.4,
    });

    const content = JSON.parse(res.choices[0].message.content);

    if (!content.name || !content.description) {
        throw new Error(
            'AI trả về task không hợp lệ (thiếu name hoặc description)',
        );
    }

    return content;
}

async function decideTask(userId, availableHours, userTime, pref) {
    let residualTime = availableHours;
    let data = [];
    const goal = await Goal.findOne({ userId });
    if (!goal) {
        console.error('[decideTask] Goal not found', {
            userId,
            availableHours,
            userTime,
        });

        return []; // vẫn trả array để không phá flow
    }

    const subGoals = [...goal.subGoal]
        .filter(
            (g) =>
                ['in_progress', 'pending'].includes(g.status) &&
                Array.isArray(g.taskIds),
        )
        .sort((a, b) => a.order - b.order);
    const taskRefs = subGoals.flatMap((g) =>
        g.taskIds.map((id) => ({
            subGoalId: g._id,
            taskId: id,
        })),
    );

    const taskIds = taskRefs.map((t) => t.taskId);
    const tasks = await Task.find({
        _id: { $in: taskIds },
    });
    const tasksExpired = tasks.filter(
        (t) =>
            t.deadline < userTime &&
            t.retryOf === null &&
            t.progress.unit === 'seconds',
    );

    const taskToSubGoal = new Map();
    const subGoalMap = new Map();

    for (const ref of taskRefs) {
        taskToSubGoal.set(ref.taskId.toString(), ref.subGoalId);
    }

    for (const g of subGoals) {
        subGoalMap.set(g._id.toString(), g);
    }

    async function updateGoal(userId, goal, subGoal, remainingTime) {
        try {
            if (Array.isArray(subGoal.taskIds) && subGoal.taskIds.length <= 0) {
                remainingTime = subGoal.estimatedTime - remainingTime
            }
            
            await Goal.updateOne(
                {
                    userId,
                    _id: goal._id,
                    'subGoal._id': subGoal._id,
                },
                {
                    $set: {
                        'subGoal.$.remainingTime': remainingTime,
                        'subGoal.$.lastWorkedAt': new Date(),
                    },
                    $inc: {
                        'subGoal.$.retryCount': 1,
                    },
                },
            );
        } catch (err) {
            console.error('[updateGoal] failed', {
                userId,
                goalId: goal._id,
                subGoalId: subGoal._id,
                err,
            });
            throw err; // QUAN TRỌNG
        }
    }

    async function dataProcessing(
        baseName,
        name,
        description,
        difficulty,
        time,
        pref,
        subGoalId,
    ) {
        const reward = await generateReward(userId, difficulty, pref);
        return {
            taskData: {
                baseName,
                name,
                description,
                difficulty,
                progress: {
                    current: 0,
                    target: time * 60 * 60,
                    unit: 'seconds',
                },
                reward,
                penalty: generatePenalty(difficulty),
            },
            goalData: {
                goalId: goal._id,
                subGoalId,
            },
        };
    }

    function buildRetryName(baseName, retryCount, locale = 'en') {
        if (locale === 'vi') {
            return `${baseName} <Thử lại lần ${retryCount}>`;
        }
        return `${baseName} <Retry attempt ${retryCount}>`;
    }

    if (Array.isArray(tasksExpired) && tasksExpired.length > 0) {
        const targetTimes = tasksExpired.map(
            (t) => t.progress.target / 60 / 60,
        );
        const sumTargetTimes = targetTimes.reduce((sum, t) => sum + t, 0);
        if (availableHours === sumTargetTimes) {
            for (let idx = 0; idx < targetTimes.length; idx++) {
                const time = targetTimes[idx];
                const task = tasksExpired[idx];
                const subGoalId = taskToSubGoal.get(task._id.toString());
                const subGoal = subGoalMap.get(subGoalId.toString());
                const baseName = task.retryOf ? task.baseName : task.name;

                const reward = await generateReward(
                    userId,
                    task.difficulty,
                    pref,
                );

                data.push({
                    taskData: {
                        baseName,
                        name: buildRetryName(baseName, task.retryCount + 1),
                        description: task.description,
                        difficulty: task.difficulty,
                        progress: {
                            current: 0,
                            target: time * 60 * 60,
                            unit: 'seconds',
                        },
                        reward,
                        penalty: generatePenalty(task.difficulty),
                    },
                    goalData: {
                        goalId: goal._id,
                        subGoalId,
                    },
                });
            }
        } else if (availableHours < sumTargetTimes) {
            let countTime = availableHours;
            let realTargerTimes = [];
            let remainingTimes = [];

            for (let i = 0; i < targetTimes.length; i++) {
                if (countTime - targetTimes[i] >= 0 && countTime > 0) {
                    realTargerTimes.push(targetTimes[i]);
                    countTime -= targetTimes[i];
                    remainingTimes.push(0);
                } else {
                    realTargerTimes.push(countTime);
                    remainingTimes.push(targetTimes[i] - countTime);
                    countTime = 0;
                }
            }

            for (let idx = 0; idx < realTargerTimes.length; idx++) {
                const time = realTargerTimes[idx];
                const task = tasksExpired[idx];
                const subGoalId = taskToSubGoal.get(task._id.toString());
                const subGoal = subGoalMap.get(subGoalId.toString());
                const baseName = task.retryOf ? task.baseName : task.name;

                const reward = await generateReward(
                    userId,
                    task.difficulty,
                    pref,
                );

                data.push({
                    taskData: {
                        baseName,
                        name: buildRetryName(baseName, task.retryCount + 1),
                        description: task.description,
                        difficulty: task.difficulty,
                        progress: {
                            current: 0,
                            target: time * 60 * 60,
                            unit: 'seconds',
                        },
                        reward,
                        penalty: generatePenalty(task.difficulty),
                    },
                    goalData: {
                        goalId: goal._id,
                        subGoalId,
                    },
                });
                await updateGoal(userId, goal, subGoal, realTargerTimes[idx]);
            }
        } else {
            residualTime -= sumTargetTimes;
            for (let idx = 0; idx < targetTimes.length; idx++) {
                const time = targetTimes[idx];
                const task = tasksExpired[idx];
                const subGoalId = taskToSubGoal.get(task._id.toString());
                const subGoal = subGoalMap.get(subGoalId.toString());
                const baseName = task.retryOf ? task.baseName : task.name;
                const reward = await generateReward(
                    userId,
                    task.difficulty,
                    pref,
                );
                data.push({
                    taskData: {
                        baseName,
                        name: buildRetryName(baseName, task.retryCount + 1),
                        description: task.description,
                        difficulty: task.difficulty,
                        progress: {
                            current: 0,
                            target: time * 60 * 60,
                            unit: 'seconds',
                        },
                        reward,
                        penalty: generatePenalty(task.difficulty),
                    },
                    goalData: {
                        goalId: goal._id,
                        subGoalId: subGoalId,
                    },
                });
            }
        }
    }

    if (!residualTime) return data;
    const subGoalsHaveRemaining = [...subGoals]
        .filter((g) => g.remainingTime > 0)
        .sort((a, b) => a.order - b.order);

    for (const g of subGoalsHaveRemaining) {
        let time;

        if (residualTime <= 0) break;
        if (residualTime - g.remainingTime >= 0) {
            time = g.remainingTime;
            residualTime -= g.remainingTime;
            const { name, description } = await generateTaskGoalByAI(
                g.title,
                time,
                g.difficulty,
            );
            const dataProcessed = await dataProcessing(
                g.title,
                name,
                description,
                g.difficulty,
                time,
                pref,
                g._id,
            );
            data.push(dataProcessed);
            await updateGoal(userId, goal, g, 0)
        } else {
            time = residualTime;
            const remainingTime = Math.max(0, g.remainingTime - time)
            residualTime = 0;
            const { name, description } = await generateTaskGoalByAI(
                g.title,
                time,
                g.difficulty,
            );
            const dataProcessed = await dataProcessing(
                g.title,
                name,
                description,
                g.difficulty,
                time,
                pref,
                g._id,
            );
            data.push(dataProcessed);
            await updateGoal(userId, goal, g, remainingTime)
        }
    }

    return data;
}

async function generateReward(userId, difficulty, pref) {
    // Tạo vật phẩm
    const rewardConfig = REWARD_TABLE[difficulty] || {
        exp: { min: 0, max: 0 },
        gold: { min: 0, max: 0 },
    };
    const reward = {
        exp: randomWithDecay(rewardConfig.exp.min, rewardConfig.exp.max),
        gold: randomWithDecay(rewardConfig.gold.min, rewardConfig.gold.max),
        items: [],
    };

    const defaultExtraCount = pref?.extraItemsCount?.[difficulty];
    const maxItems =
        defaultExtraCount !== undefined
            ? defaultExtraCount
            : RANK_KEY_INDEX[difficulty] !== undefined
              ? RANK_KEY_INDEX[difficulty] < KEY_TIERS.length - 1
                  ? RANK_KEY_INDEX[difficulty] + 1
                  : KEY_TIERS.length
              : 1;

    const allowedItemCount = Math.max(1, maxItems);

    const weights = [];
    for (let count = 1; count <= allowedItemCount; count++) {
        weights.push({ count, weight: allowedItemCount - count + 1 });
    }
    const dropCount = pickByWeight(weights).count;
    const rankIndex = RANK_KEY_INDEX[difficulty];
    let itemsList = [];

    let primaryItems = await getItemsForTier(rankIndex, 1);

    itemsList.push(...primaryItems);

    if (dropCount > 1) {
        let chanceSameTier = 0.5; // 50% chance for second item to be same tier as task
        for (let i = 2; i <= dropCount; i++) {
            let tierToFetch = rankIndex;
            if (difficulty !== 'creation') {
                if (Math.random() >= chanceSameTier) {
                    // Decide to drop a lower-tier item instead of same-tier
                    tierToFetch = rankIndex > 0 ? rankIndex - 1 : rankIndex;
                }
            }
            chanceSameTier *= 0.5; // decrease chance for next item
            const extraItems = await getItemsForTier(tierToFetch, 1);
            if (extraItems.length === 0) {
                // Fallback: if no item at chosen tier, get 3 from next lower tier
                const fallbackItems = await getItemsForTier(tierToFetch - 1, 3);
                if (fallbackItems.length === 0) {
                    // If even that fails, switch to keys fallback
                    let useKeysFallback = true;
                    break;
                } else {
                    itemsList.push(...fallbackItems);
                }
            } else {
                itemsList.push(...extraItems);
            }
        }
    }

    const missingSlots = dropCount - itemsList.length;

    const keyItems = [];

    for (let i = 0; i < missingSlots; i++) {
        const tierIdx =
            difficulty === 'creation'
                ? RANK_KEY_INDEX.creation
                : Math.random() < 0.25
                  ? Math.min(rankIndex + 1, 7)
                  : rankIndex;

        const tierName = KEY_TIERS[tierIdx];
        const k = await getRandomKeyByTier(userId, tierName);

        keyItems.push(
            k
                ? { itemId: k._id, quantity: 1 }
                : { itemId: `${tierName}_key`, quantity: 1 },
        );
    }

    // Tạo vật phẩm key
    const keys = [];
    const rankTierName = KEY_TIERS[rankIndex];

    const mainKey = await getRandomKeyByTier(userId, rankTierName);
    keys.push(
        mainKey
            ? { itemId: mainKey._id, quantity: 1 }
            : { itemId: `${rankTierName}_key`, quantity: 1 },
    );

    // Tạo thêm key phụ
    const allowedKeys = ALLOWED_KEYS_COUNT[difficulty] ?? 1;
    const keyWeights = [];

    for (let i = 1; i <= allowedKeys; i++) {
        keyWeights.push({ count: i, weight: allowedKeys - i + 1 });
    }

    const extraKeyCount = pickByWeight(keyWeights).count - 1;

    for (let i = 0; i < extraKeyCount; i++) {
        const tierIdx =
            difficulty === 'creation'
                ? RANK_KEY_INDEX.creation
                : Math.random() < 0.25
                  ? Math.min(rankIndex + 1, 7)
                  : rankIndex;

        const tierName = KEY_TIERS[tierIdx];
        const k = await getRandomKeyByTier(userId, tierName);
        keys.push(
            k
                ? { itemId: k._id, quantity: 1 }
                : { itemId: `${tierName}_key`, quantity: 1 },
        );
    }

    const finalRewardItems =
        itemsList.length === 0
            ? [...keys, ...keyItems]
            : [...keys, ...itemsList];

    // Consolidate the itemsList into reward.items with proper id and quantity
    const rewardItemsMap = {}; // map itemId (or item _id if real item docs) to quantity and reference
    for (const it of finalRewardItems) {
        // Determine an identifier for the item (if it's a mongoose document or plain object)
        let itemIdentifier;
        if (it._id) {
            // Real Item document
            itemIdentifier = it._id.toString();
        } else if (it.itemId) {
            // Plain object with itemId (likely a key string)
            itemIdentifier = it.itemId;
        } else {
            // Fallback: use tier or name if available
            itemIdentifier = it.tier ? `${it.tier}_item` : 'unknown_item';
        }

        if (!rewardItemsMap[itemIdentifier]) {
            // Initialize entry
            rewardItemsMap[itemIdentifier] = { item: it, quantity: 0 };
        }
        rewardItemsMap[itemIdentifier].quantity += 1;
    }

    // Convert map to reward.items array
    reward.items = Object.entries(rewardItemsMap).map(([id, entry]) => {
        if (entry.item._id)
            return { itemId: entry.item._id, quantity: entry.quantity };
        if (entry.item.itemId)
            return { itemId: entry.item.itemId, quantity: entry.quantity };
        return { itemId: id, quantity: entry.quantity }; // fallback đúng
    });

    return reward;
}

export async function generateTaskGoal(userId, availableHours, userTime) {
    const pref = await UserPreference.findOne({ userId });
    const userSchedule = await UserSchedule.findOne({ userId });
    if (!pref) throw new Error('Missing user preference');
    const data = await decideTask(userId, availableHours, userTime, pref);
    return data;
}
