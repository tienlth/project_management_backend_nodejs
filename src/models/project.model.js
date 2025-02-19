const mongoose = require("mongoose");

const ProjectSchema = new mongoose.Schema({
  projectName: { type: String, required: true },
  description: { type: String },
  team: [{ userId: { type: mongoose.Schema.Types.ObjectId, ref: "users" }, role: { type: String } }],
  tasks: [{ type: mongoose.Schema.Types.ObjectId, ref: "tasks" }],
  startDate: { type: Date },
  endDate: { type: Date },
  status: { type: String, enum: ["Planning", "In Progress", "Completed"], default: "Planning" },
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

module.exports = mongoose.model("projects", ProjectSchema);
