import express from "express";
import { updateTaskStatus, deleteTask, getTasksById } from "../controllers/taskController.js";
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get("/", protect, getTasksById);
router.post("/:id/status", updateTaskStatus);
router.delete("/:id", deleteTask);

export default router;
