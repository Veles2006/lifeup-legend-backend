import mongoose from 'mongoose';

const UserPreferenceScheme = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
    },
    goals: {
        type: [String],
        default: [],
    },
    availableTime: {
        type: Number,
        default: 30, // phút
    },
    style: {
        type: String,
        enum: ['chill', 'balanced', 'hardcore', 'focus'],
        default: 'balanced',
    },
    fixedRequirement: {
        type: String,
        enum: ['tap_to_complete', 'tomato', 'counting_app_time', null],
        default: null
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
    extraItemsCount: {
        mortal: { type: Number, default: 1 },
        yao: { type: Number, default: 2 },
        gui: { type: Number, default: 3 },
        mara: { type: Number, default: 4 },
        sage: { type: Number, default: 5 },
        xian: { type: Number, default: 6 },
        deity: { type: Number, default: 7 },
        creation: { type: Number, default: 8 },
    },
});

export default mongoose.model(
    'UserPreference',
    UserPreferenceScheme,
    'UserPreferences'
);
