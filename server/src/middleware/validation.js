const { body, param, query, validationResult } = require('express-validator');

// Helper function to check validation results
const checkValidation = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: errors.array(),
    });
  }
  next();
};

// User validation rules
const validateRegister = [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email'),
  body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters long'),
  body('displayName')
    .isLength({ min: 2, max: 50 })
    .withMessage('Display name must be between 2 and 50 characters'),
  body('university')
    .optional()
    .isLength({ max: 100 })
    .withMessage('University name must not exceed 100 characters'),
  checkValidation,
];

const validateLogin = [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email'),
  body('password')
    .notEmpty()
    .withMessage('Password is required'),
  checkValidation,
];

// Post validation rules
const validateCreatePost = [
  body('title')
    .isLength({ min: 5, max: 200 })
    .withMessage('Title must be between 5 and 200 characters'),
  body('content')
    .isLength({ min: 10, max: 10000 })
    .withMessage('Content must be between 10 and 10000 characters'),
  body('category')
    .isIn(['Visa', 'Housing', 'Academic', 'Jobs', 'Social', 'General'])
    .withMessage('Invalid category'),
  body('university')
    .optional()
    .isLength({ max: 100 })
    .withMessage('University name must not exceed 100 characters'),
  body('semester')
    .optional()
    .isIn(['Fall', 'Spring', 'Summer'])
    .withMessage('Invalid semester'),
  body('year')
    .optional()
    .isNumeric()
    .isLength({ min: 4, max: 4 })
    .withMessage('Year must be a 4-digit number'),
  body('tags')
    .optional()
    .isArray()
    .withMessage('Tags must be an array'),
  body('tags.*')
    .optional()
    .isLength({ min: 1, max: 50 })
    .withMessage('Each tag must be between 1 and 50 characters'),
  checkValidation,
];

const validateUpdatePost = [
  param('id').isUUID().withMessage('Invalid post ID'),
  body('title')
    .optional()
    .isLength({ min: 5, max: 200 })
    .withMessage('Title must be between 5 and 200 characters'),
  body('content')
    .optional()
    .isLength({ min: 10, max: 10000 })
    .withMessage('Content must be between 10 and 10000 characters'),
  body('category')
    .optional()
    .isIn(['Visa', 'Housing', 'Academic', 'Jobs', 'Social', 'General'])
    .withMessage('Invalid category'),
  checkValidation,
];

// Reply validation rules
const validateCreateReply = [
  param('postId').isUUID().withMessage('Invalid post ID'),
  body('content')
    .isLength({ min: 1, max: 5000 })
    .withMessage('Content must be between 1 and 5000 characters'),
  body('parentReplyId')
    .optional()
    .isUUID()
    .withMessage('Invalid parent reply ID'),
  checkValidation,
];

// Chat validation rules
const validateCreateChat = [
  body('name')
    .isLength({ min: 2, max: 100 })
    .withMessage('Chat name must be between 2 and 100 characters'),
  body('description')
    .optional()
    .isLength({ max: 500 })
    .withMessage('Description must not exceed 500 characters'),
  body('category')
    .isIn(['Academic', 'Visa', 'Housing', 'Jobs', 'Social', 'Sports', 'Tech', 'Research'])
    .withMessage('Invalid category'),
  body('university')
    .optional()
    .isLength({ max: 100 })
    .withMessage('University name must not exceed 100 characters'),
  body('semester')
    .optional()
    .isIn(['Fall', 'Spring', 'Summer'])
    .withMessage('Invalid semester'),
  body('year')
    .optional()
    .isNumeric()
    .isLength({ min: 4, max: 4 })
    .withMessage('Year must be a 4-digit number'),
  checkValidation,
];

// Message validation rules
const validateSendMessage = [
  param('chatId').isUUID().withMessage('Invalid chat ID'),
  body('content')
    .isLength({ min: 1, max: 2000 })
    .withMessage('Message content must be between 1 and 2000 characters'),
  body('messageType')
    .optional()
    .isIn(['text', 'image', 'file'])
    .withMessage('Invalid message type'),
  body('replyToId')
    .optional()
    .isUUID()
    .withMessage('Invalid reply message ID'),
  checkValidation,
];

// Visa case validation rules
const validateCreateVisaCase = [
  body('caseNumber')
    .optional()
    .isLength({ min: 8, max: 50 })
    .withMessage('Case number must be between 8 and 50 characters'),
  body('visaType')
    .isIn(['F-1', 'H-1B', 'OPT', 'STEM-OPT', 'CPT', 'J-1', 'L-1', 'O-1', 'Other'])
    .withMessage('Invalid visa type'),
  body('currentStatus')
    .notEmpty()
    .withMessage('Current status is required'),
  body('priority')
    .optional()
    .isIn(['standard', 'premium'])
    .withMessage('Invalid priority'),
  body('applicationDate')
    .isISO8601()
    .withMessage('Invalid application date'),
  checkValidation,
];

// Query validation
const validatePagination = [
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Page must be a positive integer'),
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Limit must be between 1 and 100'),
  checkValidation,
];

const validateSearch = [
  query('q')
    .optional()
    .isLength({ min: 1, max: 100 })
    .withMessage('Search query must be between 1 and 100 characters'),
  query('category')
    .optional()
    .isIn(['Visa', 'Housing', 'Academic', 'Jobs', 'Social', 'General'])
    .withMessage('Invalid category'),
  query('university')
    .optional()
    .isLength({ max: 100 })
    .withMessage('University name must not exceed 100 characters'),
  checkValidation,
];

// UUID parameter validation
const validateUUID = (paramName) => [
  param(paramName).isUUID().withMessage(`Invalid ${paramName}`),
  checkValidation,
];

module.exports = {
  validateRegister,
  validateLogin,
  validateCreatePost,
  validateUpdatePost,
  validateCreateReply,
  validateCreateChat,
  validateSendMessage,
  validateCreateVisaCase,
  validatePagination,
  validateSearch,
  validateUUID,
  checkValidation,
};
