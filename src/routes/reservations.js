const express = require('express');
const router = express.Router();
const { check } = require('express-validator');
const reservationController = require('../controllers/reservationController');
const authMiddleware = require('../middleware/auth');

// @route   GET /api/reservations
// @desc    Get all reservations (filtered by user role)
// @access  Private
router.get(
  '/',
  authMiddleware.authenticate,
  reservationController.getAllReservations
);

// @route   GET /api/reservations/statistics
// @desc    Get reservation statistics
// @access  Admin
router.get(
  '/statistics',
  [authMiddleware.authenticate, authMiddleware.isAdmin],
  reservationController.getStatistics
);

// @route   GET /api/reservations/:id
// @desc    Get reservation by ID
// @access  Private (Admin or User themselves)
router.get(
  '/:id',
  authMiddleware.authenticate,
  reservationController.getReservationById
);

// @route   POST /api/reservations
// @desc    Create a new reservation
// @access  Private
router.post(
  '/',
  [
    authMiddleware.authenticate,
    check('equipmentId', 'Equipment ID is required').notEmpty(),
    check('startDate', 'Start date is required').isISO8601(),
    check('endDate', 'End date is required').isISO8601(),
    check('purpose', 'Purpose is required').notEmpty()
  ],
  reservationController.createReservation
);

// @route   PUT /api/reservations/:id/status
// @desc    Update reservation status
// @access  Admin
router.put(
  '/:id/status',
  [
    authMiddleware.authenticate,
    authMiddleware.isAdmin,
    check('status', 'Status is required').isIn(['pending', 'approved', 'rejected'])
  ],
  reservationController.updateReservationStatus
);

// @route   PUT /api/reservations/:id/return
// @desc    Return equipment
// @access  Private (Admin or User themselves)
router.put(
  '/:id/return',
  [
    authMiddleware.authenticate,
    check('returnCondition', 'Return condition is required').isIn(['good', 'damaged', 'lost'])
  ],
  reservationController.returnEquipment
);

// @route   PUT /api/reservations/:id/cancel
// @desc    Cancel reservation
// @access  Private (Admin or User themselves)
router.put(
  '/:id/cancel',
  authMiddleware.authenticate,
  reservationController.cancelReservation
);

module.exports = router;
