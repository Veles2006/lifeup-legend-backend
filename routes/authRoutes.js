// routes/authRoutes.js
import express from "express";
import User from "../models/User.js";
import { generateToken } from "../utils/generateToken.js";
import { protect } from "../middleware/authMiddleware.js";
import { register, login, me } from "../controllers/authController.js"

const router = express.Router();

/**
 * POST /auth/register
 * body: { username, email, password }
 */
router.post("/register", register);

/**
 * POST /auth/login
 * body: { emailOrUsername, password }
 */
router.post("/login", login);

/**
 * GET /auth/me
 * header: Authorization: Bearer <token>
 */
router.get("/me", protect, me);

export default router;
