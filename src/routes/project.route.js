const express = require("express");
const router = express.Router();
const projectController = require("../controllers/project.controller");
const upload = require("../middlewares/upload");
const authMiddleware = require("../middlewares/authMiddleware");
const authorize = require("../middlewares/roleMiddleware");

router.get("/user-projects", projectController.getUserProjects);
router.get("/overdue", projectController.getOverdueProjects);
router.get("/overdue-sorted", projectController.getProjectsSortedByOverdueTime);
router.get("/:projectId", projectController.getProjectById);
router.get("/", projectController.getAllProjects);

router.post("/:projectId/upload", upload.single("file"), projectController.uploadProjectDocument);
router.post("/:projectId/share/:documentId", projectController.shareProjectDocument);
router.post("/", projectController.createProject);

router.put("/:projectId", projectController.updateProject);

router.delete("/:projectId/documents/:documentId", authMiddleware, authorize("admin"), projectController.deleteProjectDocument);
router.delete("/:projectId", projectController.deleteProject);

module.exports = router;