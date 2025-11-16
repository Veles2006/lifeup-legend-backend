import mongoose from "mongoose";

const playerSchema = new mongoose.Schema({
  name: String,
  gender: String,
  age: Number,
  stats: {
    strength: Number,
    intelligence: Number,
    stamina: Number,
    speed: Number,
    charm: Number,
  },
  type: { type: String, default: "player" },
});

// (modelName, schema, collectionName)
export default mongoose.model("Player", playerSchema, "characters");
