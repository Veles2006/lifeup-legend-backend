// middleware/authMiddleware.js
import jwt from "jsonwebtoken";
import User from "../models/User.js";

export const protect = async (req, res, next) => {
  try {
    let token;

    // Lấy token từ header: Authorization: Bearer xxx
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith("Bearer ")) {
      token = authHeader.split(" ")[1];
    }

    if (!token) {
      return res.status(401).json({ message: "Không có token, truy cập bị từ chối" });
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Tìm user trong DB (không trả password)
    req.user = await User.findById(decoded.id).select("-password");

    if (!req.user) {
      return res.status(401).json({ message: "User không tồn tại" });
    }

    next();
  } catch (err) {
    console.error(err.message);
    return res.status(401).json({ message: "Token không hợp lệ hoặc đã hết hạn" });
  }
};
