import cron from 'node-cron';
import { runRandomSpawn } from '../services/taskService.js';

export function startRandomScheduler() {
    // mỗi 1 tiếng thử random 1 lần
    cron.schedule('0 * * * *', async () => {
        try {
            await runRandomSpawn();
        } catch (e) {
            console.error('Daily scheduler error', e);
        }
    });
}
