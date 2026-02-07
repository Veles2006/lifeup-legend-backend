import mongoose from 'mongoose';

const HHMM_REGEX = /^([01]\d|2[0-3]):([0-5]\d)$/;

const dayConfigSchema = new mongoose.Schema(
    {
        day: {
            type: String,
            enum: [
                'Monday',
                'Tuesday',
                'Wednesday',
                'Thursday',
                'Friday',
                'Saturday',
                'Sunday',
            ],
            required: true,
        },
        availableHours: {
            type: Number,
            min: 0,
            max: 24,
            default: 1,
        },
        enabled: {
            type: Boolean,
            default: true,
        },
        energyLevel: {
            type: String,
            enum: ['low', 'normal', 'high'],
            default: 'normal',
        },
    },
    { _id: false },
);

const userScheduleSchema = new mongoose.Schema(
    {
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
            index: true,
        },

        times: {
            type: [String],
            default: ['07:00'],
            validate: {
                validator: function (arr) {
                    if (!Array.isArray(arr)) return false;
                    if (arr.length === 0) return false;
                    if (!arr.every((t) => HHMM_REGEX.test(t))) return false;
                    return new Set(arr).size === arr.length; // không trùng
                },
                message: 'Danh sách mốc giờ không hợp lệ (HH:mm, không trùng)',
            },
        },

        timeGoal: {
            type: String,
            default: '19:00',
            validate: {
                validator: (v) => HHMM_REGEX.test(v),
                message: 'timeGoal phải theo HH:mm',
            }
        },

        dayOfWeek: {
            type: [dayConfigSchema],
            default: () => [
                { day: 'Monday', availableHours: 1 },
                { day: 'Tuesday', availableHours: 1 },
                { day: 'Wednesday', availableHours: 1 },
                { day: 'Thursday', availableHours: 1 },
                { day: 'Friday', availableHours: 1 },
                { day: 'Saturday', availableHours: 1 },
                { day: 'Sunday', availableHours: 1 },
            ],
        },

        timezone: {
            type: String,
            default: 'Asia/Ho_Chi_Minh',
        },

        enabled: {
            type: Boolean,
            default: true,
        },
    },
    { timestamps: true },
);

export default mongoose.model(
    'UserSchedule',
    userScheduleSchema,
    'UserSchedules',
);
