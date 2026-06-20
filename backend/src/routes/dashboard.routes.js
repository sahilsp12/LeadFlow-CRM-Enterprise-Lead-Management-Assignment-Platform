const express = require('express');
const DashboardController = require('../controllers/DashboardController');
const authenticateToken = require('../middleware/auth.middleware');

const router = express.Router();

router.get('/stats', authenticateToken, DashboardController.getStats);

module.exports = router;
