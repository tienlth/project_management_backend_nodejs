const express = require("express");
const router = express.Router();
const taskController = require("../controllers/task.controller");
const upload = require("../middlewares/upload");
const authMiddleware = require("../middlewares/authMiddleware");
const authorize = require("../middlewares/roleMiddleware");

router.get("/user-tasks", taskController.getUserTasks);
router.get("/overdue", taskController.getOverdueTasks);
router.get("/overdue-sorted", taskController.getOverdueTasksSorted);
router.get("/:taskId", taskController.getTaskById);
router.get("/", taskController.getAllTasks);

router.post("/:taskId/upload", authMiddleware, authorize("admin"), upload.single("file"), taskController.uploadTaskDocument);
router.post("/:taskId/share/:documentId", taskController.shareTaskDocument);
router.post("/", taskController.createTask);

router.put("/:taskId", taskController.updateTask);

router.delete("/:taskId/documents/:documentId", authMiddleware, taskController.deleteTaskDocument);
router.delete("/:taskId", taskController.deleteTask);

module.exports = router;
