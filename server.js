import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

// ===== Kết nối MongoDB Atlas =====
mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => console.log("✅ Kết nối MongoDB thành công"))
  .catch((err) => console.error("❌ Lỗi kết nối MongoDB:", err));

// ===== Định nghĩa Schema =====
const playerSchema = new mongoose.Schema({
  name: String,
  gender: String,
  age: Number,
  stats: {
    strength: Number,
    intelligence: Number,
    stamina: Number,
    speed: Number,
    charm: Number,
  },
  type: { type: String, default: "player" },
});

const Player = mongoose.model("characters", playerSchema, "characters");

// ===== ROUTES =====
app.get("/", (req, res) => {
  res.send("🎮 LifeUp Legend API đang hoạt động!");
});

// Lấy danh sách người chơi
app.get("/players", async (req, res) => {
  const players = await Player.find({ type: "player" });
  res.json(players);
});

// Thêm người chơi mới
app.post("/players", async (req, res) => {
  try {
    const player = new Player(req.body);
    await player.save();
    res.status(201).json(player);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Lấy toàn bộ dữ liệu trong collection "characters"
app.get("/characters", async (req, res) => {
  try {
    const characters = await Player.find({}); // lấy tất cả document trong collection
    res.json(characters);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


// ===== Chạy server =====
const port = process.env.PORT || 10000;
app.listen(port, () => console.log(`🚀 Server chạy tại cổng ${port}`));
