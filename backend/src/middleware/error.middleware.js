/**
   * Centralized Error Handling Middleware
   * Standardizes error outputs for all Express routes.
   */
function errorHandler(err, req, res, next) {
  
  console.error(`[Error Handler] ${err.stack}`);

  const statusCode = err.statusCode || 500;
  let message = err.message || 'Internal Server Error';
  let errors = [];

  // Sequelize Database Errors
  if (err.name === 'SequelizeValidationError' || err.name === 'SequelizeUniqueConstraintError') {
    res.status(400);
    return res.json({
      success: false,
      message: 'Validation failed',
      errors: err.errors.map(e => ({
        field: e.path,
        message: e.message
      }))
    });
  }

  // General fallback
  res.status(statusCode).json({
    success: false,
    message,
    errors: err.errors || []
  });
}

module.exports = errorHandler;
