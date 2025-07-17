const express = require('express');
const router = express.Router();
const { check } = require('express-validator');
const equipmentController = require('../controllers/equipmentController');
const authMiddleware = require('../middleware/auth');
const upload = require('../middleware/upload');

// @route   GET /api/equipment
// @desc    Get all equipment
// @access  Private
router.get(
  '/',
  authMiddleware.authenticate,
  equipmentController.getAllEquipment
);

// @route   GET /api/equipment/categories
// @desc    Get equipment categories
// @access  Private
router.get(
  '/categories',
  authMiddleware.authenticate,
  equipmentController.getCategories
);

// @route   GET /api/equipment/:id
// @desc    Get equipment by ID
// @access  Private
router.get(
  '/:id',
  authMiddleware.authenticate,
  equipmentController.getEquipmentById
);

// @route   POST /api/equipment
// @desc    Create equipment
// @access  Admin
router.post(
  '/',
  [
    authMiddleware.authenticate,
    authMiddleware.isAdmin,
    upload.single('image'),
    check('name', 'Name is required').notEmpty(),
    check('description', 'Description is required').notEmpty(),
    check('serialNumber', 'Serial number is required').notEmpty(),
    check('category', 'Category is required').notEmpty()
  ],
  equipmentController.createEquipment
);

// @route   PUT /api/equipment/:id
// @desc    Update equipment
// @access  Admin
router.put(
  '/:id',
  [
    authMiddleware.authenticate,
    authMiddleware.isAdmin,
    upload.single('image')
  ],
  equipmentController.updateEquipment
);

// @route   DELETE /api/equipment/:id
// @desc    Delete equipment
// @access  Admin
router.delete(
  '/:id',
  [authMiddleware.authenticate, authMiddleware.isAdmin],
  equipmentController.deleteEquipment
);

module.exports = router;
