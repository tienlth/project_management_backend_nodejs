const express = require("express");
const router = express.Router();
const projectController = require("../controllers/project.controller");

router.get("/:projectId", projectController.getProjectById);
router.get("/", projectController.getAllProjects);

router.post("/", projectController.createProject);

router.put("/:projectId", projectController.updateProject);

router.delete("/:projectId", projectController.deleteProject);

module.exports = router;