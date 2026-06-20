const express = require('express');
const authRoutes = require('./auth.routes');
const leadRoutes = require('./lead.routes');
const userRoutes = require('./user.routes');
const logRoutes = require('./log.routes');
const dashboardRoutes = require('./dashboard.routes');

const router = express.Router();

router.use('/auth', authRoutes);
router.use('/leads', leadRoutes);
router.use('/users', userRoutes);
router.use('/logs', logRoutes);
router.use('/dashboard', dashboardRoutes);

module.exports = router;
