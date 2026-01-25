import User from "../models/User.js";

export const getUsers = async (req, res) => {
    const users = await User.find({ type: "user" });
    return res.json(users);
};

export const createUser = async (req, res) => {
    try {
        const user = new User(req.body);
        await user.save();
        return res.status(201).json(user);
    } catch (err) {
        return res.status(500).json({ error: err.message });
    }
};

// export const getUser = async (req, res) => {
//     try {
//         const user = await User.find({});
//         res.json(user);
//     } catch (err) {
//         res.status(500).json({ error: err.message });
//     }
// };
