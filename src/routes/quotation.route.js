const express = require("express");
const router = express.Router();
const quotationController = require("../controllers/quotation.controller");

router.get("/:projectId/preview", quotationController.previewQuotation);
router.get("/:quotationId", quotationController.getQuotationById);
router.post("/:projectId", quotationController.createQuotation);
router.get("/", quotationController.getAllQuotations);

module.exports = router;
