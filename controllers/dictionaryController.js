import Dictionary from '../models/Dictionary';

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
