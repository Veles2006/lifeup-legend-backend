import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";

import Player from "./models/Player.js";   // <--- IMPORT PLAYER
import Task from "./models/Task.js";       // <--- IMPORT TASK

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

// ===== KẾT NỐI MONGODB =====
mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => console.log("✅ Kết nối MongoDB thành công"))
  .catch((err) => console.error("❌ Lỗi kết nối MongoDB:", err));

// ===== ROUTES =====
app.get("/", (req, res) => {
  res.send("🎮 LifeUp Legend API đang hoạt động!");
});

// ----- PLAYERS -----

// Lấy danh sách player
app.get("/players", async (req, res) => {
  const players = await Player.find({ type: "player" });
  res.json(players);
});

// Thêm player mới
app.post("/players", async (req, res) => {
  try {
    const player = new Player(req.body);
    await player.save();
    res.status(201).json(player);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Lấy tất cả characters (player + NPC nếu có)
app.get("/characters", async (req, res) => {
  try {
    const characters = await Player.find({});
    res.json(characters);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ----- TASKS -----

// Lấy toàn bộ nhiệm vụ
app.get("/tasks", async (req, res) => {
  try {
    const allTasks = await Task.find({});
    res.json(allTasks);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ===== RUN SERVER =====
const port = process.env.PORT || 10000;
app.listen(port, () => console.log(`🚀 Server chạy tại cổng ${port}`));
