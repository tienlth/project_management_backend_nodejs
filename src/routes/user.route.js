const express = require('express');
const router = express.Router();
const userController = require('../controllers/user.controller');
const authMiddleware = require("../middlewares/authMiddleware");
const authorize = require("../middlewares/roleMiddleware");


router.get('/', userController.getAllUsers);

router.put("/:id/role", authMiddleware, authorize("admin"), userController.updateUserRole);

module.exports = router;
