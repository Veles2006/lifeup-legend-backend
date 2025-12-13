import mongoose from 'mongoose';

// const conditionScheme = new mongoose.Schema({

// })

// const packageScheme = new mongoose.Schema({
//     appName: { type: String, require: true },
//     package: { type: String, require: true },
//     status: { type: String, },
//     condition: {
//         time: String,

//     },
// })

const blockScheme = new mongoose.Schema(
    {
        idUser: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
        appName: String,
        packageName: String,
        type: {
            type: String,
            enum: ['permanent', 'scheduled', 'timer'],
            default: 'permanent',
        },
        type: [{ start: String, end: String }],
        default: [],
        expiresAt: Date,
    },
    { timestamps: true }
);

export default mongoose.model('Block', blockScheme, 'block');
