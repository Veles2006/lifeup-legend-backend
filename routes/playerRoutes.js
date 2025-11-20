import express from "express";
import { getPlayers, createPlayer, getCharacters } from "../controllers/playerController.js";

const router = express.Router();

router.get("/", getPlayers);
router.post("/", createPlayer);
router.get("/all", getCharacters);

export default router;
