import mongoose from 'mongoose';

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

    // rank 1–10
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
    },

    // hiệu ứng (chỉ có nếu là consumable / buff)
    effects: { type: [effectSchema], default: [] },

    // dữ liệu đặc thù theo từng category
    metadata: { type: Object, default: {} },

    description: { type: String, default: '' },
    icon: { type: String, default: '' },
});

export default mongoose.model('Item', itemSchema, 'items');
