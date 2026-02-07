import mongoose from 'mongoose';

const subGoalSchema = new mongoose.Schema({
    title: { type: String, required: true },

    estimatedTime: {
        type: Number,
        min: 0.5,
        max: 10,
        required: true,
    },

    remainingTime: {
        type: Number,
        min: 0,
        default: function () {
            return this.estimatedTime;
        },
    },

    taskIds: {
        type: [mongoose.Schema.Types.ObjectId],
        ref: 'Task',
        default: [],
    },

    lastTaskAt: Date,

    retryCount: {
        type: Number,
        default: 0,
    },

    maxRetries: {
        type: Number,
        default: 3,
    },

    pausedUntil: Date, // nếu fail nhiều quá

    difficulty: {
        type: String,
        enum: [
            'mortal',
            'yao',
            'gui',
            'mara',
            'sage',
            'xian',
            'deity',
            'creation',
        ],
        default: 'mortal',
    },

    order: { type: Number, required: true },

    status: {
        type: String,
        enum: ['pending', 'in_progress', 'done', 'blocked'],
        default: 'pending',
    },

    repeatable: {
        type: Boolean,
        default: false,
    },

    lastWorkedAt: Date,
    completedAt: Date,
});

const goalSchema = new mongoose.Schema({
    userId: {
        type: String,
        ref: 'User',
    },
    title: {
        type: String,
        required: true,
    },
    description: {
        type: String,
        required: true,
    },
    subGoal: {
        type: [subGoalSchema],
        default: [],
    },
});

export default mongoose.model('Goal', goalSchema, 'goals');
