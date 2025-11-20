import express from "express";
import { getTasks, updateTaskStatus, deleteTask } from "../controllers/taskController.js";

const router = express.Router();

router.get("/", getTasks);
router.put("/:id/status", updateTaskStatus);
router.delete("/:id", deleteTask);

export default router;
