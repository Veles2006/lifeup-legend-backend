import admin from '../config/firebase.js';

export async function sendDailyTaskNotification({ title, body, image }) {
    const message = {
        topic: 'daily_tasks',

        // 🔥 QUAN TRỌNG: notification (để app tắt vẫn hiện)
        notification: {
            title,
            body,
            image,
        },

        // (OPTIONAL) data để app xử lý khi mở
        data: {
            type: 'daily_task',
        },

        android: {
            priority: 'high',
        },
    };

    await admin.messaging().send(message);
}
