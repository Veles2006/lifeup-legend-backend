import express from "express";
import playerRoutes from "./playerRoutes.js";
import taskRoutes from "./taskRoutes.js";

const router = express.Router();

router.use("/players", playerRoutes);
router.use("/tasks", taskRoutes);

export default router;
