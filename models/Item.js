import mongoose from "mongoose";

const effectSchema = new mongoose.Schema({
  type: { type: String, required: true }, 
  value: { type: Number, default: 0 },
  target: { type: String, default: "self" },
  duration: { type: Number, default: 0 }
});

const itemSchema = new mongoose.Schema({
  name: { type: String, required: true },

  // rank 1–10
  rank: { type: Number, min: 1, max: 10, default: 1 },

  // loại item
  category: {
    type: String,
    enum: [
      "consumable",
      "weapon",
      "armor",
      "key",
      "gift",
      "quest",
      "currency",
      "misc"
    ],
    default: "misc"
  },

  // hiệu ứng (chỉ có nếu là consumable / buff)
  effects: { type: [effectSchema], default: [] },

  // dữ liệu đặc thù theo từng category
  metadata: { type: Object, default: {} },

  description: { type: String, default: "" },
  icon: { type: String, default: "" }
});

export default mongoose.model("Item", itemSchema, "items");
