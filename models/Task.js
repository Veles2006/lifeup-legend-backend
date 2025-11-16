import mongoose from "mongoose";

const TaskSchema = new mongoose.Schema({
  name: String,
  type: String,
  short_desc: String,
  full_desc: String,
  requirement: String,
  reward: String,
  penalty: String,
  deadline: String,
  date: String,
  status: String,
  difficulty: String,
});

export default mongoose.model("Task", TaskSchema, "tasks");
