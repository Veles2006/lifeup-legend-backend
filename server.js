import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import connectDB from './config/db.js';
import routes from './routes/index.js';
import { startDailyScheduler } from './schedulers/dailyScheduler.js';
import { startRandomScheduler } from './schedulers/randomScheduler.js';

dotenv.config();
const app = express();

app.use(cors());
app.use(express.json());

// Kết nối DB
connectDB();

startDailyScheduler();
// startRandomScheduler();

app.get('/', (req, res) => {
    res.send('🎮 LifeUp Legend API đang hoạt động!');
});

// Gắn tất cả route
app.use('/', routes);

// Run server
const port = process.env.PORT || 10000;
app.listen(port, () => console.log(`🚀 Server chạy tại cổng ${port}`));
