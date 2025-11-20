import Player from "../models/Player.js";

export const getPlayers = async (req, res) => {
    const players = await Player.find({ type: "player" });
    res.json(players);
};

export const createPlayer = async (req, res) => {
    try {
        const player = new Player(req.body);
        await player.save();
        res.status(201).json(player);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

export const getCharacters = async (req, res) => {
    try {
        const characters = await Player.find({});
        res.json(characters);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};
