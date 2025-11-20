// import express from 'express';
// import mongoose from 'mongoose';
// import cors from 'cors';
// import dotenv from 'dotenv';

// import Player from './models/Player.js'; // <--- IMPORT PLAYER
// import Task from './models/Task.js'; // <--- IMPORT TASK

// dotenv.config();

// const app = express();
// app.use(cors());
// app.use(express.json());

// // ===== KẾT NỐI MONGODB =====
// mongoose
//     .connect(process.env.MONGODB_URI)
//     .then(() => console.log('✅ Kết nối MongoDB thành công'))
//     .catch((err) => console.error('❌ Lỗi kết nối MongoDB:', err));

// // ===== ROUTES =====
// app.get('/', (req, res) => {
//     res.send('🎮 LifeUp Legend API đang hoạt động!');
// });

// // ----- PLAYERS -----

// // Lấy danh sách player
// app.get('/players', async (req, res) => {
//     const players = await Player.find({ type: 'player' });
//     res.json(players);
// });

// // Thêm player mới
// app.post('/players', async (req, res) => {
//     try {
//         const player = new Player(req.body);
//         await player.save();
//         res.status(201).json(player);
//     } catch (err) {
//         res.status(500).json({ error: err.message });
//     }
// });

// // Lấy tất cả characters (player + NPC nếu có)
// app.get('/characters', async (req, res) => {
//     try {
//         const characters = await Player.find({});
//         res.json(characters);
//     } catch (err) {
//         res.status(500).json({ error: err.message });
//     }
// });

// // ----- TASKS -----

// // Lấy toàn bộ nhiệm vụ
// app.get('/tasks', async (req, res) => {
//     try {
//         const allTasks = await Task.find({});
//         res.json(allTasks);
//     } catch (err) {
//         res.status(500).json({ error: err.message });
//     }
// });

// // Cập nhật trạng thái nhiệm vụ
// app.put('/tasks/:id/status', async (req, res) => {
//     try {
//         const { status } = req.body;

//         // Validate đơn giản
//         if (!['hoàn thành', 'chưa hoàn thành'].includes(status)) {
//             return res.status(400).json({ error: 'Trạng thái không hợp lệ' });
//         }

//         const updatedTask = await Task.findByIdAndUpdate(
//             req.params.id,
//             { status },
//             { new: true }
//         );

//         if (!updatedTask) {
//             return res.status(404).json({ error: 'Không tìm thấy nhiệm vụ' });
//         }

//         res.json(updatedTask);
//     } catch (err) {
//         res.status(500).json({ error: err.message });
//     }
// });

// // Xóa nhiệm vụ theo ID
// app.delete('/tasks/:id', async (req, res) => {
//     try {
//         const deleted = await Task.findByIdAndDelete(req.params.id);

//         if (!deleted) {
//             return res.status(404).json({ error: 'Không tìm thấy nhiệm vụ' });
//         }

//         res.json({ message: '🗑️ Đã xóa nhiệm vụ thành công', deleted });
//     } catch (err) {
//         res.status(500).json({ error: err.message });
//     }
// });

// // ===== RUN SERVER =====
// const port = process.env.PORT || 10000;
// app.listen(port, () => console.log(`🚀 Server chạy tại cổng ${port}`));


import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import connectDB from "./config/db.js";
import routes from "./routes/index.js";

dotenv.config();
const app = express();

app.use(cors());
app.use(express.json());

// Kết nối DB
connectDB();

app.get("/", (req, res) => {
    res.send("🎮 LifeUp Legend API đang hoạt động!");
});

// Gắn tất cả route
app.use("/", routes);

// Run server
const port = process.env.PORT || 10000;
app.listen(port, () => console.log(`🚀 Server chạy tại cổng ${port}`));