const { body, validationResult } = require('express-validator');

const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: errors.array().map(err => ({
        field: err.path,
        message: err.msg
      }))
    });
  }
  next();
};

const validateCreateLead = [
  body('name')
    .trim()
    .notEmpty()
    .withMessage('Lead name is required')
    .isLength({ max: 100 })
    .withMessage('Name must not exceed 100 characters'),
  body('email')
    .optional({ checkFalsy: true })
    .trim()
    .isEmail()
    .withMessage('Must be a valid email address'),
  body('phone')
    .optional({ checkFalsy: true })
    .trim()
    .isLength({ max: 20 })
    .withMessage('Phone number must not exceed 20 characters'),
  body('source')
    .optional()
    .trim()
    .isLength({ max: 50 })
    .withMessage('Source must not exceed 50 characters'),
  body('status')
    .optional()
    .isIn(['New', 'Contacted', 'Qualified', 'Lost', 'Closed'])
    .withMessage('Status must be New, Contacted, Qualified, Lost, or Closed'),
  body('assignedTo')
    .optional({ nullable: true, checkFalsy: true })
    .isUUID(4)
    .withMessage('Assigned agent ID must be a valid UUID'),
  body('notes')
    .optional()
    .trim(),
  handleValidationErrors
];

const validateUpdateLead = [
  body('name')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('Lead name cannot be empty')
    .isLength({ max: 100 })
    .withMessage('Name must not exceed 100 characters'),
  body('email')
    .optional({ nullable: true, checkFalsy: true })
    .trim()
    .isEmail()
    .withMessage('Must be a valid email address'),
  body('phone')
    .optional({ nullable: true, checkFalsy: true })
    .trim()
    .isLength({ max: 20 })
    .withMessage('Phone number must not exceed 20 characters'),
  body('source')
    .optional()
    .trim()
    .isLength({ max: 50 })
    .withMessage('Source must not exceed 50 characters'),
  body('status')
    .optional()
    .isIn(['New', 'Contacted', 'Qualified', 'Lost', 'Closed'])
    .withMessage('Status must be New, Contacted, Qualified, Lost, or Closed'),
  body('assignedTo')
    .optional({ nullable: true, checkFalsy: true })
    .isUUID(4)
    .withMessage('Assigned agent ID must be a valid UUID'),
  body('notes')
    .optional()
    .trim(),
  handleValidationErrors
];

module.exports = {
  validateCreateLead,
  validateUpdateLead
};
