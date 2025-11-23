import mongoose from 'mongoose';

const dictionarySchema = new mongoose.Schema({
    english: { type: String, index: true }, // để search nhanh
    vietnamese: String,
});

// collection name = dictionary
export default mongoose.model('Dictionary', dictionarySchema, 'dictionary');
