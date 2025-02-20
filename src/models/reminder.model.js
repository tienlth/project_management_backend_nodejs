const mongoose = require("mongoose");

const ReminderSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "users", required: true },
  project: { type: mongoose.Schema.Types.ObjectId, ref: "projects", default: null },
  task: { type: mongoose.Schema.Types.ObjectId, ref: "tasks", default: null }, 
}, { timestamps: true });

module.exports = mongoose.model("reminders", ReminderSchema);