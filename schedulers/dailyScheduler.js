import cron from 'node-cron';
import { runDailyTaskCheck } from '../services/taskService.js';

export function startDailyScheduler() {
    cron.schedule('* * * * *', async () => {
        try {
            await runDailyTaskCheck();
        } catch (e) {
            console.error('Daily scheduler error', e);
        }
    });
}
