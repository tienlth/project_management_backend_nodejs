const express = require("express");
const router = express.Router();
const reminderController = require("../controllers/reminder.controller");
const authMiddleware = require("../middlewares/authMiddleware");
const authorize = require("../middlewares/roleMiddleware");

router.get("/", authMiddleware, authorize, reminderController.getUserReminders);

router.post("/", authMiddleware, authorize, reminderController.createReminder);

router.delete("/:taskId", authMiddleware, authorize, reminderController.deleteReminder);

module.exports = router;
