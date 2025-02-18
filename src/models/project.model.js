const mongoose = require("mongoose");

const ProjectSchema = new mongoose.Schema({
  projectName: { type: String, required: true },
  description: { type: String },
  team: [{ userId: { type: mongoose.Schema.Types.ObjectId, ref: "users" }, role: { type: String } }],
  tasks: [{ type: mongoose.Schema.Types.ObjectId, ref: "tasks" }],
  startDate: { type: Date },
  endDate: { type: Date },
  status: { type: String, enum: ["Planning", "In Progress", "Completed"], default: "Planning" }
});

module.exports = mongoose.model("projects", ProjectSchema);
