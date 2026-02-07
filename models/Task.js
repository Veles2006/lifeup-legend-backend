import mongoose from 'mongoose';

const TaskSchema = new mongoose.Schema(
    {
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            // required: true,
        },
        baseName: {
            type: String,
            default: '',
        },
        name: {
            type: String,
            required: true,
        },
        type: {
            type: String,
            enum: ['manual', 'recurring', 'daily', 'random', 'goal'],
            required: true,
        },
        source: {
            type: String,
            enum: ['manual', 'ai', 'system'],
            default: 'manual',
        },
        description: {
            type: String,
            required: true,
        },
        requirement: {
            type: String,
            enum: [
                'tap_to_complete',
                'tomato',
                'timer_task',
                'counting_app_time',
            ],
            required: true,
        },
        reward: {
            exp: { type: Number, default: 0 },
            gold: { type: Number, default: 0 },
            diamond: { type: Number, default: 0 },
            gem: { type: Number, default: 0 },
            items: [
                {
                    itemId: {
                        type: mongoose.Schema.Types.ObjectId,
                        ref: 'Item',
                        required: true,
                    },
                    quantity: {
                        type: Number,
                        default: 1,
                    },
                },
            ],
        },
        penalty: {
            exp: { type: Number, default: 0 },
            gold: { type: Number, default: 0 },
            diamond: { type: Number, default: 0 },
            gem: { type: Number, default: 0 },
        },
        deadline: {
            type: Date,
        },
        date: {
            type: Date,
            default: Date.now,
        },
        status: {
            type: String,
            enum: [
                'pending',
                'in_progress',
                'completed',
                'failed',
                'expired',
                'retried',
            ],
            default: 'pending',
        },
        retryOf: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Task',
            default: null,
        },
        retryCount: {
            type: Number,
            default: 0,
        },
        goalId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Goal',
            default: null
        },
        subGoalId: {
            type: mongoose.Schema.Types.ObjectId,
            default: null
        },
        progress: {
            current: { type: Number, default: 0 },
            target: { type: Number, min: 1 },
            unit: {
                type: String,
                enum: ['count', 'minutes', 'sessions', 'seconds'],
                default: 'count',
            },
        },
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
        dateKey: { type: String, required: true },
        spawnTime: { type: String },
    },
    { timestamps: true },
);

TaskSchema.pre('save', function (next) {
    if (this.type !== 'daily') {
        this.spawnTime = undefined;
    }
    next();
});

TaskSchema.index(
  { userId: 1, type: 1, dateKey: 1, spawnTime: 1 },
  { unique: true, partialFilterExpression: { type: 'daily' } }
);

export default mongoose.model('Task', TaskSchema, 'tasks');
