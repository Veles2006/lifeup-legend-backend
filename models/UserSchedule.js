import mongoose from 'mongoose';

const HHMM_REGEX = /^([01]\d|2[0-3]):([0-5]\d)$/;

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
            required: true,
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

        timezone: {
            type: String,
            default: 'Asia/Ho_Chi_Minh',
        },

        enabled: {
            type: Boolean,
            default: true,
        },
    },
    { timestamps: true }
);

export default mongoose.model(
    'UserSchedule',
    userScheduleSchema,
    'UserSchedules'
);
