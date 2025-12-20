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

const timeRangeSchema = new mongoose.Schema(
    {
        start: { type: String, required: true }, // "08:00"
        end: { type: String, required: true }, // "22:00"
    },
    { _id: false }
);

const blockSchema = new mongoose.Schema(
    {
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            // required: true,
        },

        appName: {
            type: String,
            required: true,
        },

        packageName: {
            type: String,
            required: true,
        },

        blockType: {
            type: String,
            enum: ['permanent', 'scheduled', 'timer'],
            default: 'permanent',
        },

        // chỉ dùng cho scheduled
        schedules: {
            type: [timeRangeSchema],
            default: [],
        },

        // chỉ dùng cho timer
        expiresAt: {
            type: Date,
            default: null,
        },

        penaltyMinutes: {
            type: Number,
            default: 0,
            min: 0,
        },

        isActive: {
            type: Boolean,
            default: true,
        },
    },
    { timestamps: true }
);

blockSchema.pre("save", function (next) {
    if (this.blockType === "scheduled" && this.schedules.length === 0) {
        return next(new Error("Scheduled block must have schedules"));
    }

    if (this.blockType === "timer" && !this.expiresAt) {
        return next(new Error("Timer block must have expiresAt"));
    }

    next();
});

blockSchema.index(
    { useId: 1, packageName: 1},
    { unique: true }
)

export default mongoose.model('Block', blockSchema, 'blocks');
