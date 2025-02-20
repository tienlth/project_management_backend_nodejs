const express = require("express");
const router = express.Router();
const contractController = require("../controllers/contract.controller");

router.get("/:projectId/preview", contractController.previewContract);
router.get("/:contractId", contractController.getContractById);
router.get("/", contractController.getAllContracts);
router.post("/:projectId/save", contractController.saveContract);

module.exports = router;
