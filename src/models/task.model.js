const mongoose = require("mongoose");

const TaskSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String },
  status: { type: String, enum: ["Pending", "In Progress", "Completed"], default: "Pending" },
  assignee: [{ type: mongoose.Schema.Types.ObjectId, ref: "users" }],
  priority: { type: String, enum: ["Low", "Medium", "High"], default: "Medium" },
  startDate: { type: Date },
  endDate: { type: Date },
  project: { type: mongoose.Schema.Types.ObjectId, ref: "projects", required: true }
});

module.exports = mongoose.model("tasks", TaskSchema);
