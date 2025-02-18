const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema(
  {
    fullName: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    phone: { type: String, required: true },
    address: { type: String },
    role: { type: String, enum: ["admin", "user"], default: "user" },
    createdAt: { type: Date, default: Date.now }
  },
  { timestamps: true }
);

const User = mongoose.model("Users", UserSchema);

module.exports = User;
