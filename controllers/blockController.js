import mongoose from 'mongoose';
import Block from '../models/Block.js';
import Item from '../models/Item.js';

const eightKeys = [
    {
        color: 'White',
        time: 10,
        // icon: 'https://i.pinimg.com/736x/eb/eb/4b/ebeb4b384565c76804fe4dd45898ecc3.jpg',
        icon: 'https://res.cloudinary.com/dr1vfmngy/image/upload/v1768395172/White_Key_fs4x3d.png',
    },
    {
        color: 'Gray',
        time: 30,
        // icon: 'https://i.pinimg.com/1200x/cc/6f/71/cc6f71ac0bef33ec288b4fe93775f832.jpg',
        icon: 'https://res.cloudinary.com/dr1vfmngy/image/upload/v1768395173/Grey_Key_hxsmp8.png',
    },
    {
        color: 'Green',
        time: 60,
        // icon: 'https://i.pinimg.com/1200x/1a/88/bd/1a88bda6914751b9b76d344c023b8b70.jpg',
        icon: 'https://res.cloudinary.com/dr1vfmngy/image/upload/v1768395175/Green_Key_i4qy1f.png',
    },
    {
        color: 'Blue',
        time: 120,
        // icon: 'https://i.pinimg.com/736x/c7/bd/dd/c7bdddc4b415aea0bd0065f2b99930f7.jpg',
        icon: 'https://res.cloudinary.com/dr1vfmngy/image/upload/v1768395177/Blue_Key_iz833u.png',
    },
    {
        color: 'Purple',
        time: 240,
        // icon: 'https://i.pinimg.com/736x/c1/0f/0c/c10f0c18069bfe7e13ee3b1b495ff403.jpg',
        icon: 'https://res.cloudinary.com/dr1vfmngy/image/upload/v1768395177/Purple_Key_ut5upu.png',
    },
    {
        color: 'Yellow',
        time: 480,
        // icon: 'https://i.pinimg.com/1200x/76/ee/20/76ee20ed1ce384617ad5c1c6bd2f8f63.jpg',
        icon: 'https://res.cloudinary.com/dr1vfmngy/image/upload/v1768395175/Yellow_Key_wafbi8.png',
    },
    {
        color: 'Red',
        time: 1440,
        // icon: 'https://i.pinimg.com/736x/1b/a1/89/1ba18935ad6c68c96baf550800628078.jpg',
        icon: 'https://res.cloudinary.com/dr1vfmngy/image/upload/v1768395174/Red_Key_jswszm.png',
    },
    {
        color: 'Black',
        time: 10080,
        // icon: 'https://wimg.rule34.xxx//samples/1714/sample_3379845b5e31cc00a1939a7428a44655.jpg?15807336',
        icon: 'https://res.cloudinary.com/dr1vfmngy/image/upload/v1768395179/Black_Key_wbevgd.png',
    },
];

export const getAllBlockeds = async (req, res) => {
    try {
        const userId = req.user._id;
        const allBlocks = await Block.find({ userId });

        res.status(200).json(allBlocks);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

const createKeys = async ({ userId, appName, blockId }) => {
    const items = eightKeys.map((key, index) => ({
        userId,
        name: `${key.color} Key [ ${appName} ]`,
        rank: index + 1,
        tier: key.color.toLocaleLowerCase(),
        category: 'key',
        keyInfo: {
            blockId: blockId,
        },
        description: `Chìa khoá mở ${appName} trong ${key.time} phút.`,
        icon: key.icon,
    }));

    await Item.insertMany(items);
};

export const createBlock = async (req, res) => {
    try {
        const userId = req.user._id;
        const { appName, packageName } = req.body;

        if (!appName || !packageName) {
            return res
                .status(400)
                .json({ error: 'appName và packageName là bắt buộc' });
        }

        const block = new Block({
            ...req.body,
            userId: userId,
        });

        await block.save();

        await createKeys({
            userId,
            appName,
            blockId: block._id,
        });

        res.status(201).json(block);
    } catch (err) {
        if ((err.code === 11000)) {
            return res.status(400).json({
                message: 'Block với packageName này đã tồn tại!',
            });
        }

        res.status(500).json({ error: err.message });
    }
};
