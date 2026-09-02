const { body } = require('express-validator');
const { validate } = require('../utils/validation');

const validateRegister = [
  body('name').trim().notEmpty().withMessage('Name required'),
  body('email').trim().notEmpty().isEmail().withMessage('Invalid email'),
  body('password').notEmpty().isLength({ min: 6 }).withMessage('Min 6 characters'),
  body('role').optional().isIn(['student', 'librarian']).withMessage('Invalid role'),
  validate
];

const validateLogin = [
  body('email').trim().notEmpty().isEmail().withMessage('Invalid email'),
  body('password').notEmpty().withMessage('Password required'),
  validate
];

const validateBook = [
  body('title').trim().notEmpty().withMessage('Title required'),
  body('author').trim().notEmpty().withMessage('Author required'),
  body('isbn').trim().notEmpty().withMessage('ISBN required'),
  body('category').trim().notEmpty().withMessage('Category required'),
  body('quantity').notEmpty().isInt({ min: 0 }).withMessage('Invalid quantity'),
  validate
];

const validateUpdateRole = [
  body('role').notEmpty().isIn(['student', 'librarian']).withMessage('Invalid role'),
  validate
];

module.exports = {
  validateRegister,
  validateLogin,
  validateBook,
  validateUpdateRole
};

