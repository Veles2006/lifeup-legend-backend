import Task from "../models/Task.js";

export const getTasks = async (req, res) => {
    try {
        const allTasks = await Task.find({});
        res.json(allTasks);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

export const updateTaskStatus = async (req, res) => {
    try {
        const { status } = req.body;

        if (!["hoàn thành", "chưa hoàn thành"].includes(status)) {
            return res.status(400).json({ error: "Trạng thái không hợp lệ" });
        }

        const updatedTask = await Task.findByIdAndUpdate(
            req.params.id,
            { status },
            { new: true }
        );

        if (!updatedTask) {
            return res.status(404).json({ error: "Không tìm thấy nhiệm vụ" });
        }

        res.json(updatedTask);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

export const deleteTask = async (req, res) => {
    try {
        const deleted = await Task.findByIdAndDelete(req.params.id);

        if (!deleted) {
            return res.status(404).json({ error: "Không tìm thấy nhiệm vụ" });
        }

        res.json({ message: "🗑️ Đã xóa nhiệm vụ thành công", deleted });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};
