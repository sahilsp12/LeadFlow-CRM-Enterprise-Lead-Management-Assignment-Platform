const express = require('express');
const LeadController = require('../controllers/LeadController');
const { validateCreateLead, validateUpdateLead } = require('../validations/lead.validation');
const authenticateToken = require('../middleware/auth.middleware');
const authorizeRoles = require('../middleware/role.middleware');

const router = express.Router();

// All lead routes require authentication
router.use(authenticateToken);

router.get('/', LeadController.listLeads);

// Suggestion API: Admin & Manager only. Put before `/:id` to prevent Express from parsing "suggest" as an ID
router.get('/suggest', authorizeRoles('ADMIN', 'MANAGER'), LeadController.suggestLead);

router.get('/:id', LeadController.getLeadById);

router.post('/', authorizeRoles('ADMIN', 'MANAGER'), validateCreateLead, LeadController.createLead);

router.put('/:id', validateUpdateLead, LeadController.updateLead);

router.delete('/:id', authorizeRoles('ADMIN', 'MANAGER'), LeadController.deleteLead);

module.exports = router;
