const express = require('express');
const LogController = require('../controllers/LogController');
const authenticateToken = require('../middleware/auth.middleware');
const authorizeRoles = require('../middleware/role.middleware');

const router = express.Router();

router.use(authenticateToken);

// System-wide log access: Admin only
router.get('/', authorizeRoles('ADMIN'), LogController.listLogs);

// Lead-specific log access: Auth (security check done inside the controller)
router.get('/lead/:leadId', LogController.listLeadLogs);

module.exports = router;
