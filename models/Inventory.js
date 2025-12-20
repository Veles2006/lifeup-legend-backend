import mongoose from 'mongoose';

const inventorySchema = new mongoose.Schema(
    {
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            // required: true,
        },
        itemId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Item',
            // required: true,
        },
        quantity: {
            type: Number,
            default: 1,
        },
    },
    { timestamps: true }
);

export default mongoose.model('Inventory', inventorySchema, 'inventories');
