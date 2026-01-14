import mongoose from 'mongoose';

export const ITEM_TIER = [
    'white',
    'gray',
    'green',
    'blue',
    'purple',
    'yellow',
    'red',
    'black',
];

const effectSchema = new mongoose.Schema({
    type: { type: String, required: true },
    value: { type: Number, default: 0 },
    target: { type: String, default: 'self' },
    duration: { type: Number, default: 0 },
});

const itemSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        // required: true,
    },
    name: { type: String, required: true },

    tier: {
        type: String,
        enum: ITEM_TIER,
        required: true,
        index: true,
    },

    // rank 1–8
    rank: { type: Number, min: 1, max: 8, default: 1 },

    // loại item
    category: {
        type: String,
        enum: [
            'consumable',
            'weapon',
            'armor',
            'key',
            'master_key',
            'gift',
            'quest',
            'currency',
            'misc',
        ],
        default: 'misc',
    },

    keyInfo: {
        blockId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Block',
            default: null,
        },
        isMaster: {
            type: Boolean,
            default: false,
        },
        app: {
            package: {
                type: String,
                default: '',
            },
            name: {
                type: String,
                default: '',
            },
        }
    },

    // hiệu ứng (chỉ có nếu là consumable / buff)
    effects: { type: [effectSchema], default: [] },

    // dữ liệu đặc thù theo từng category
    metadata: { type: Object, default: {} },

    description: { type: String, default: '' },
    icon: { type: String, default: 'https://res.cloudinary.com/dr1vfmngy/image/upload/v1768395172/Default_Image_weztpa.png' },
});

export default mongoose.model('Item', itemSchema, 'items');
