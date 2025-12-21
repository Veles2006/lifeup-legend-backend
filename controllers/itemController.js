import Item from '../models/Item.js';

export const getAllItems = async (req, res) => {
    try {
        const userId = req.user._id;

        const items = await Item.find({ userId });

        res.json(items);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

export const getItemById = async (req, res) => {
    try {
        const item = await Item.findById(req.params.id)
            .populate('keyInfo.blockId', 'appName packageName blockType');

        if (!item) {
            return res.status(404).json({ error: 'Không tìm thấy item' });
        }

        res.json(item);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};


export const createItem = async (req, res) => {
    try {
        const userId = req.user._id;

        const item = new Item({
            ...req.body,
            userId: userId,
        });

        await item.save();

        res.status(201).json(item);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

export const updateItem = async (req, res) => {
    try {
        const updated = await Item.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
        });

        if (!updated) {
            return res.status(404).json({ error: 'Không tìm thấy item' });
        }

        res.json(updated);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

export const deleteItem = async (req, res) => {
    try {
        const deleted = await Item.findByIdAndDelete(req.params.id);

        if (!deleted) {
            return res.status(404).json({ error: 'Không tìm thấy item' });
        }

        res.json({ message: '🗑️ Đã xoá item thành công', deleted });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};
