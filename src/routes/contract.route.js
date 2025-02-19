const express = require("express");
const router = express.Router();
const contractController = require("../controllers/contract.controller");

router.get("/:projectId/preview", contractController.previewContract);
router.post("/save", contractController.saveContract);

module.exports = router;
