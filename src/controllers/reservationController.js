const Reservation = require('../models/Reservation');
const Equipment = require('../models/Equipment');
const User = require('../models/User');
const { validationResult } = require('express-validator');
const emailSender = require('../utils/emailSender');

// Get all reservations (filtered by user role)
exports.getAllReservations = async (req, res) => {
  try {
    // Set up query filters
    const filter = {};
    
    // If user is not admin, only show their own reservations
    if (req.user.role !== 'admin') {
      filter.user = req.user._id;
    } else {
      // For admin, filter by user if specified
      if (req.query.userId) {
        filter.user = req.query.userId;
      }
    }
    
    // Filter by equipment if specified
    if (req.query.equipmentId) {
      filter.equipment = req.query.equipmentId;
    }
    
    // Filter by status if specified
    if (req.query.status) {
      filter.status = req.query.status;
    }
    
    // Filter by date range if specified
    if (req.query.startDate && req.query.endDate) {
      filter.$or = [
        // Reservations that start during the period
        {
          startDate: {
            $gte: new Date(req.query.startDate),
            $lte: new Date(req.query.endDate)
          }
        },
        // Reservations that end during the period
        {
          endDate: {
            $gte: new Date(req.query.startDate),
            $lte: new Date(req.query.endDate)
          }
        },
        // Reservations that span the entire period
        {
          startDate: { $lte: new Date(req.query.startDate) },
          endDate: { $gte: new Date(req.query.endDate) }
        }
      ];
    }
    
    // Set up pagination
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    
    // Get reservations with pagination
    const reservations = await Reservation.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate('equipment', 'name serialNumber imageUrl')
      .populate('user', 'firstName lastName email');
    
    // Get total count for pagination
    const total = await Reservation.countDocuments(filter);
    
    res.json({
      reservations,
      pagination: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Get all reservations error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get reservation by ID
exports.getReservationById = async (req, res) => {
  try {
    const reservation = await Reservation.findById(req.params.id)
      .populate('equipment')
      .populate('user', 'firstName lastName email department');
    
    if (!reservation) {
      return res.status(404).json({ message: 'Reservation not found' });
    }
    
    // Check if user is admin or the reservation owner
    if (req.user.role !== 'admin' && reservation.user._id.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to access this reservation' });
    }
    
    res.json({ reservation });
  } catch (error) {
    console.error('Get reservation by ID error:', error);
    
    if (error.kind === 'ObjectId') {
      return res.status(404).json({ message: 'Reservation not found' });
    }
    
    res.status(500).json({ message: 'Server error' });
  }
};

// Create reservation
exports.createReservation = async (req, res) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    
    const { equipmentId, startDate, endDate, purpose } = req.body;
    
    // Parse dates
    const start = new Date(startDate);
    const end = new Date(endDate);
    
    // Validate dates
    if (start >= end) {
      return res.status(400).json({ message: 'End date must be after start date' });
    }
    
    if (start < new Date()) {
      return res.status(400).json({ message: 'Start date cannot be in the past' });
    }
    
    // Check if equipment exists and is available
    const equipment = await Equipment.findById(equipmentId);
    if (!equipment) {
      return res.status(404).json({ message: 'Equipment not found' });
    }
    
    if (equipment.status !== 'available') {
      return res.status(400).json({ message: `Equipment is not available (current status: ${equipment.status})` });
    }
    
    // Check for conflicting reservations
    const conflictingReservations = await Reservation.find({
      equipment: equipmentId,
      status: { $in: ['pending', 'approved'] },
      $or: [
        // New reservation starts during an existing one
        { startDate: { $lte: start }, endDate: { $gte: start } },
        // New reservation ends during an existing one
        { startDate: { $lte: end }, endDate: { $gte: end } },
        // New reservation completely contains an existing one
        { startDate: { $gte: start }, endDate: { $lte: end } }
      ]
    });
    
    if (conflictingReservations.length > 0) {
      return res.status(400).json({ message: 'Equipment is already reserved during this period' });
    }
    
    // Create new reservation
    const reservation = new Reservation({
      equipment: equipmentId,
      user: req.user._id,
      startDate: start,
      endDate: end,
      purpose,
      status: 'pending'
    });
    
    await reservation.save();
    
    // Update equipment status
    equipment.status = 'reserved';
    await equipment.save();
    
    res.status(201).json({
      message: 'Reservation request submitted successfully',
      reservation
    });
  } catch (error) {
    console.error('Create reservation error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Update reservation status (admin only)
exports.updateReservationStatus = async (req, res) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    
    const { status, adminNotes } = req.body;
    
    // Find reservation
    const reservation = await Reservation.findById(req.params.id)
      .populate('equipment')
      .populate('user');
    
    if (!reservation) {
      return res.status(404).json({ message: 'Reservation not found' });
    }
    
    // Update reservation
    reservation.status = status;
    if (adminNotes) {
      reservation.adminNotes = adminNotes;
    }
    
    // If approved, update equipment status
    if (status === 'approved') {
      await Equipment.findByIdAndUpdate(reservation.equipment._id, { status: 'reserved' });
      
      // Send confirmation email
      await emailSender.sendReservationConfirmationEmail(
        reservation,
        reservation.user,
        reservation.equipment
      );
    }
    
    // If rejected, update equipment status back to available
    if (status === 'rejected') {
      await Equipment.findByIdAndUpdate(reservation.equipment._id, { status: 'available' });
      
      // Send rejection email
      await emailSender.sendReservationRejectionEmail(
        reservation,
        reservation.user,
        reservation.equipment,
        adminNotes
      );
    }
    
    await reservation.save();
    
    res.json({
      message: `Reservation ${status}`,
      reservation
    });
  } catch (error) {
    console.error('Update reservation status error:', error);
    
    if (error.kind === 'ObjectId') {
      return res.status(404).json({ message: 'Reservation not found' });
    }
    
    res.status(500).json({ message: 'Server error' });
  }
};

// Return equipment
exports.returnEquipment = async (req, res) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    
    const { returnCondition, userNotes } = req.body;
    
    // Find reservation
    const reservation = await Reservation.findById(req.params.id)
      .populate('equipment')
      .populate('user');
    
    if (!reservation) {
      return res.status(404).json({ message: 'Reservation not found' });
    }
    
    // Check if reservation is approved
    if (reservation.status !== 'approved') {
      return res.status(400).json({ message: `Cannot return equipment for a reservation with status: ${reservation.status}` });
    }
    
    // Check if user is the owner of the reservation or admin
    if (req.user.role !== 'admin' && reservation.user._id.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to return this equipment' });
    }
    
    // Update reservation
    reservation.status = 'returned';
    reservation.returnDate = new Date();
    reservation.returnCondition = returnCondition || 'good';
    if (userNotes) {
      reservation.userNotes = userNotes;
    }
    
    await reservation.save();
    
    // Update equipment status based on return condition
    let newStatus = 'available';
    if (returnCondition === 'damaged') {
      newStatus = 'maintenance';
    }
    
    await Equipment.findByIdAndUpdate(reservation.equipment._id, { status: newStatus });
    
    // Send return confirmation email
    await emailSender.sendReturnConfirmationEmail(
      reservation,
      reservation.user,
      reservation.equipment
    );
    
    res.json({
      message: 'Equipment returned successfully',
      reservation
    });
  } catch (error) {
    console.error('Return equipment error:', error);
    
    if (error.kind === 'ObjectId') {
      return res.status(404).json({ message: 'Reservation not found' });
    }
    
    res.status(500).json({ message: 'Server error' });
  }
};

// Cancel reservation
exports.cancelReservation = async (req, res) => {
  try {
    // Find reservation
    const reservation = await Reservation.findById(req.params.id)
      .populate('equipment');
    
    if (!reservation) {
      return res.status(404).json({ message: 'Reservation not found' });
    }
    
    // Check if reservation is pending or approved
    if (!['pending', 'approved'].includes(reservation.status)) {
      return res.status(400).json({ message: `Cannot cancel a reservation with status: ${reservation.status}` });
    }
    
    // Check if user is the owner of the reservation or admin
    if (req.user.role !== 'admin' && reservation.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to cancel this reservation' });
    }
    
    // Update reservation
    reservation.status = 'cancelled';
    
    await reservation.save();
    
    // Update equipment status
    await Equipment.findByIdAndUpdate(reservation.equipment._id, { status: 'available' });
    
    res.json({
      message: 'Reservation cancelled successfully',
      reservation
    });
  } catch (error) {
    console.error('Cancel reservation error:', error);
    
    if (error.kind === 'ObjectId') {
      return res.status(404).json({ message: 'Reservation not found' });
    }
    
    res.status(500).json({ message: 'Server error' });
  }
};

// Get reservation statistics (admin only)
exports.getStatistics = async (req, res) => {
  try {
    // Get total counts by status
    const statusCounts = await Reservation.aggregate([
      { $group: { _id: '$status', count: { $sum: 1 } } }
    ]);
    
    // Get most requested equipment
    const topEquipment = await Reservation.aggregate([
      { $group: { _id: '$equipment', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 5 },
      {
        $lookup: {
          from: 'equipment',
          localField: '_id',
          foreignField: '_id',
          as: 'equipmentDetails'
        }
      },
      { $unwind: '$equipmentDetails' },
      {
        $project: {
          _id: 1,
          count: 1,
          name: '$equipmentDetails.name',
          serialNumber: '$equipmentDetails.serialNumber'
        }
      }
    ]);
    
    // Get top users
    const topUsers = await Reservation.aggregate([
      { $group: { _id: '$user', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 5 },
      {
        $lookup: {
          from: 'users',
          localField: '_id',
          foreignField: '_id',
          as: 'userDetails'
        }
      },
      { $unwind: '$userDetails' },
      {
        $project: {
          _id: 1,
          count: 1,
          name: { $concat: ['$userDetails.firstName', ' ', '$userDetails.lastName'] },
          email: '$userDetails.email'
        }
      }
    ]);
    
    // Get monthly reservation counts
    const monthlyStats = await Reservation.aggregate([
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' }
          },
          count: { $sum: 1 }
        }
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } }
    ]);
    
    res.json({
      statusCounts: statusCounts.reduce((acc, curr) => {
        acc[curr._id] = curr.count;
        return acc;
      }, {}),
      topEquipment,
      topUsers,
      monthlyStats: monthlyStats.map(stat => ({
        year: stat._id.year,
        month: stat._id.month,
        count: stat.count
      }))
    });
  } catch (error) {
    console.error('Get statistics error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = exports;
