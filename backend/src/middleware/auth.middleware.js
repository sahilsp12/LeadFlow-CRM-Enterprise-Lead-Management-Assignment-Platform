const AuthService = require('../services/AuthService');

function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  
  // Header format: 'Bearer TOKEN'
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'Access token is required. Authorization header missing or malformed.',
      errors: []
    });
  }

  const user = AuthService.verifyAccessToken(token);
  if (!user) {
    return res.status(401).json({
      success: false,
      message: 'Access token is invalid or expired.',
      errors: []
    });
  }

  req.user = user;
  next();
}

module.exports = authenticateToken;
