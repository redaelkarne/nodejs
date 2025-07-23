const express = require('express');
const router = express.Router();
const { check } = require('express-validator');
const userController = require('../controllers/userController');
const authMiddleware = require('../middleware/auth');

// @route   GET /api/users
// @desc    Get all users
// @access  Admin
router.get(
  '/',
  [authMiddleware.authenticate, authMiddleware.isAdmin],
  userController.getAllUsers
);

// @route   GET /api/users/:id
// @desc    Get user by ID
// @access  Private (Admin or User themselves)
router.get(
  '/:id',
  authMiddleware.authenticate,
  userController.getUserById
);

// @route   PUT /api/users/:id
// @desc    Update user
// @access  Private (Admin or User themselves)
router.put(
  '/:id',
  [
    authMiddleware.authenticate,
    check('firstName', 'First name is required').optional(),
    check('lastName', 'Last name is required').optional(),
    check('department').optional()
  ],
  userController.updateUser
);

// @route   DELETE /api/users/:id
// @desc    Delete user
// @access  Admin
router.delete(
  '/:id',
  [authMiddleware.authenticate, authMiddleware.isAdmin],
  userController.deleteUser
);

// @route   PUT /api/users/:id/change-password
// @desc    Change password
// @access  Private (User themselves)
router.put(
  '/:id/change-password',
  [
    authMiddleware.authenticate,
    check('currentPassword', 'Current password is required').notEmpty(),
    check('newPassword', 'New password must be at least 6 characters').isLength({ min: 6 })
  ],
  userController.changePassword
);

module.exports = router;
