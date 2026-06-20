const express = require('express');
const UserController = require('../controllers/UserController');
const authenticateToken = require('../middleware/auth.middleware');
const authorizeRoles = require('../middleware/role.middleware');

const router = express.Router();

// Mount authentication token check globally on user routes
router.use(authenticateToken);

// Allow both Admins and Managers to query the directory (Managers need this to lookup Agents)
router.get('/', authorizeRoles('ADMIN', 'MANAGER'), UserController.listUsers);

// Mutating CRUD operations remain strictly restricted to Admins
router.post('/', authorizeRoles('ADMIN'), UserController.createUser);
router.put('/:id', authorizeRoles('ADMIN'), UserController.updateUser);
router.delete('/:id', authorizeRoles('ADMIN'), UserController.deleteUser);

module.exports = router;
