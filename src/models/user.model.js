const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: {
    type: String,
    enum: ["admin", "project_manager", "team_leader", "developer", "qa_qc", "client", "support"],
    default: "client"
  }
}, { timestamps: true });

module.exports = mongoose.model("users", UserSchema);
