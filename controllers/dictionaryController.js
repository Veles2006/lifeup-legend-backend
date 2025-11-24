import Dictionary from '../models/Dictionary.js';

export const getWord = async (req, res) => {
    try {
        const word = req.params.word.toLowerCase();

        const result = await Dictionary.findOne({ english: word });

        if (!result) {
            return res.status(404).json({
                english: word,
                vietnamese: 'Không tìm thấy',
            });
        }

        res.json(result);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

export const searchWord = async (req, res) => {
    try {
        const q = req.query.q?.toLowerCase() || '';

        const result = await Dictionary.find({
            english: { $regex: `^${q}` }
        }).limit(20);

        res.json(result);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};
