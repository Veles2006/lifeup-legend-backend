// routes/authRoutes.js
import express from "express";
import User from "../models/User.js";
import { generateToken } from "../utils/generateToken.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

/**
 * POST /auth/register
 * body: { username, email, password }
 */
router.post("/register", async (req, res) => {
  try {
    const { username, email, password } = req.body;

    // Check thiếu field
    if (!username || !email || !password) {
      return res.status(400).json({ message: "Vui lòng nhập đầy đủ thông tin" });
    }

    // Check email hoặc username đã tồn tại
    const existingUser = await User.findOne({
      $or: [{ email }, { username }],
    });

    if (existingUser) {
      return res.status(400).json({ message: "Email hoặc username đã được sử dụng" });
    }

    // Tạo user
    const newUser = await User.create({ username, email, password });

    // Tạo token
    const token = generateToken(newUser._id);

    res.status(201).json({
      message: "Đăng ký thành công",
      user: {
        id: newUser._id,
        username: newUser.username,
        email: newUser.email,
      },
      token,
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: "Lỗi server" });
  }
});

/**
 * POST /auth/login
 * body: { emailOrUsername, password }
 */
router.post("/login", async (req, res) => {
  try {
    const { emailOrUsername, password } = req.body;

    if (!emailOrUsername || !password) {
      return res.status(400).json({ message: "Thiếu email/username hoặc mật khẩu" });
    }

    // Tìm theo email hoặc username
    const user = await User.findOne({
      $or: [{ email: emailOrUsername }, { username: emailOrUsername }],
    });

    if (!user) {
      return res.status(400).json({ message: "Sai tài khoản hoặc mật khẩu" });
    }

    const isMatch = await user.comparePassword(password);

    if (!isMatch) {
      return res.status(400).json({ message: "Sai tài khoản hoặc mật khẩu" });
    }

    const token = generateToken(user._id);

    res.json({
      message: "Đăng nhập thành công",
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
      },
      token,
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: "Lỗi server" });
  }
});

/**
 * GET /api/auth/me
 * header: Authorization: Bearer <token>
 */
router.get("/me", protect, async (req, res) => {
  res.json({
    user: req.user,
  });
});

export default router;
