const express = require('express');
const AuthController = require('../controllers/AuthController');
const { validateRegister, validateLogin } = require('../validations/auth.validation');
const authenticateToken = require('../middleware/auth.middleware');
const { authRateLimiter } = require('../middleware/rateLimiter.middleware');

const router = express.Router();

router.post('/register', authRateLimiter, validateRegister, AuthController.register);
router.post('/login', authRateLimiter, validateLogin, AuthController.login);
router.post('/refresh', AuthController.refresh);
router.post('/logout', AuthController.logout);
router.get('/me', authenticateToken, AuthController.me);

module.exports = router;
