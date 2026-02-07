import UserPreference from '../models/UserPreference.js';
import Item from '../models/Item.js';
import openai from '../config/ai.js';

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



async function generateTaskByAI(goal, availableTime) {
    const timeText = formatDuration(availableTime);

    const prompt = `
You are a life gamification task writer.

Your job is ONLY to write the task content.
DO NOT decide difficulty, rewards, penalties, rules, or requirements.

User goal:
- ${goal}

User available time:
- ${timeText}

Generate ONE task in JSON format:

{
  "name": string,
  "description": string
}

Rules:
- Task must be realistic and actionable in real life
- Task MUST fit within the user's available time
- Task should clearly relate to the user's goal
- Write the content in VIETNAMESE
- Do NOT include rewards, penalties, difficulty, rules, or requirements
`;

    const res = await openai.chat.completions.create({
        model: 'gpt-4.1-mini',
        messages: [{ role: 'user', content: prompt }],
        response_format: { type: 'json_object' },
    });

    return JSON.parse(res.choices[0].message.content);
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

function decideRequirement(pref) {
    const allowed = [
        'tap_to_complete',
        'tomato',
        'timer_task',
        'counting_app_time',
    ];

    if (allowed.includes(pref?.fixedRequirement)) {
        return pref.fixedRequirement; // 🔒 CỐ ĐỊNH
    }

    return pickByWeight([
        { key: 'tap_to_complete', weight: 45 },
        { key: 'tomato', weight: 25 },
        { key: 'timer_task', weight: 20 },
        { key: 'counting_app_time', weight: 10 },
    ]).key;
}

function buildProgress(requirement, pref) {
    switch (requirement) {
        case 'tap_to_complete':
            return { current: 0, target: 1, unit: 'count' };

        case 'tomato':
            return {
                current: 0,
                target: Math.ceil(
                    pref.availableTime / (pref.pomodoroLength || 25),
                ),
                unit: 'sessions',
            };

        case 'timer_task':
            return {
                current: 0,
                target: pref.availableTime,
                unit: 'seconds',
            };

        case 'counting_app_time':
            return {
                current: 0,
                target: pref.availableTime,
                unit: 'seconds',
            };

        default:
            return { current: 0, target: 1, unit: 'count' };
    }
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

function decideAvailableTime(availableTime, difficulty) {
    const multiplierMap = {
        mortal: 1,
        yao: 2,
        gui: 3,
        mara: 4,
        sage: 5,
        xian: 6,
        deity: 7,
        creation: 8,
    };

    const multiplier = multiplierMap[difficulty] ?? 1;
    const result = availableTime * multiplier;

    return result >= 28800 ? 28800 : result;
}

export function formatDuration(seconds) {
    if (typeof seconds !== 'number' || seconds <= 0) {
        return '0 phút';
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

function randomGoal(goals) {
    if (!Array.isArray(goals) || goals.length === 0) return '';
    return goals[Math.floor(Math.random() * goals.length)];
}


// Hàm chính để tạo một task tự động hoàn chỉnh
export async function calculateDailyTaskLogic(userId) {
    const pref = await UserPreference.findOne({ userId });
    if (!pref) throw new Error('Missing user preference');

    // 1️⃣ Randomly decide difficulty based on weights

    const difficulty = pref?.difficulty ?? pickByWeight(DIFFICULTY_POOL).key;

    const availableTime = decideAvailableTime(pref.availableTime, difficulty);

    const requirement = decideRequirement(pref);

    const goal = randomGoal(pref.goals) || 'Phát triển bản thân';

    const nameAndDescription = await generateTaskByAI(
        goal,
        availableTime
    );

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
                    useKeysFallback = true;
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
    const allowedKeys = ALLOWED_KEYS_COUNT[difficulty];
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

    // 5️⃣ Determine penalty (if any) for failing the task
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
    const penalty = PENALTY_TABLE[difficulty] || {};

    const progress = buildProgress(requirement, pref);

    return {
        ...nameAndDescription,
        difficulty,
        requirement,
        progress,
        reward,
        penalty,
    };
}

// Các hàm không dùng tới nhưng có tiềm năng

// function buildKeyDrop(rank) {
//     const idx = RANK_KEY_INDEX[rank];

//     const lowKey = KEY_TIERS[idx];
//     const highKey = KEY_TIERS[Math.min(idx + 1, KEY_TIERS.length - 1)];

//     return [
//         { id: `${lowKey}_key`, weight: 75 }, // 3 phần
//         { id: `${highKey}_key`, weight: 25 }, // 1 phần
//     ];
// }