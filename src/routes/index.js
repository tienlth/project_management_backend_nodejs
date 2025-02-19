const express = require('express');
const router = express.Router();

const authRoutes = require('./auth.route');
const userRoutes = require('./user.route');
const projectRoutes = require('./project.route');
const taskRoutes = require('./task.route');
const quotationRoutes = require('./quotation.route');

router.use('/auth', authRoutes);
router.use('/users', userRoutes);
router.use('/projects', projectRoutes);
router.use('/tasks', taskRoutes);
router.use('/quotations', quotationRoutes);

module.exports = router;
