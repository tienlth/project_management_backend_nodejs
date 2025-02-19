const mongoose = require("mongoose");

const TaskSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String },
  status: { type: String, enum: ["Pending", "In Progress", "Completed"], default: "Pending" },
  assignees: [{ type: mongoose.Schema.Types.ObjectId, ref: "users" }],
  priority: { type: String, enum: ["Low", "Medium", "High"], default: "Medium" },
  estimatedHours: { type: Number, required: true },
  startDate: { type: Date },
  endDate: { type: Date },
  project: { type: mongoose.Schema.Types.ObjectId, ref: "projects", required: true },
  progress: { type: Number, default: 0, min: 0, max: 100 },
  documents: [
    {
      url: { type: String, required: true }, 
      name: { type: String }, 
      uploadedBy: { type: mongoose.Schema.Types.ObjectId, ref: "users" }, 
      sharedWith: [{ type: mongoose.Schema.Types.ObjectId, ref: "users" }] 
    }
  ]
});

module.exports = mongoose.model("tasks", TaskSchema);
