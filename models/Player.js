import mongoose from 'mongoose';

const PlayerScheme = new mongoose.Schema(
    {
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            unique: true,
        },

        level: { type: Number, default: 1 },
        exp: { type: Number, default: 0 },
        gold: { type: Number, default: 0 },
        diamond: { type: Number, default: 0 },
        gem: { type: Number, default: 0 },
    },
    { timestamps: true },
);

export default mongoose.model('Player', PlayerScheme, 'players');
