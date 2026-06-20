/**
   * Role Authorization Middleware
   * Restricts endpoint access to specific user roles.
   */
function authorizeRoles(...allowedRoles) {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Unauthorized: User authentication is required.',
        errors: []
      });
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `Forbidden: Access denied. Role '${req.user.role}' lacks sufficient permissions.`,
        errors: []
      });
    }

    next();
  };
}

module.exports = authorizeRoles;
