const Equipment = require('../models/Equipment');
const Reservation = require('../models/Reservation');
const { validationResult } = require('express-validator');
const fs = require('fs');
const path = require('path');

// Get all equipment
exports.getAllEquipment = async (req, res) => {
  try {
    // Set up query filters
    const filter = {};
    
    // Filter by status if provided
    if (req.query.status) {
      filter.status = req.query.status;
    }
    
    // Filter by category if provided
    if (req.query.category) {
      filter.category = req.query.category;
    }
    
    // Search by name or description
    if (req.query.search) {
      filter.$or = [
        { name: { $regex: req.query.search, $options: 'i' } },
        { description: { $regex: req.query.search, $options: 'i' } },
        { serialNumber: { $regex: req.query.search, $options: 'i' } }
      ];
    }
    
    // Set up pagination
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    
    // Get equipment with pagination
    const equipment = await Equipment.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate('addedBy', 'firstName lastName');
    
    // Get total count for pagination
    const total = await Equipment.countDocuments(filter);
    
    res.json({
      equipment,
      pagination: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Get all equipment error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get equipment by ID
exports.getEquipmentById = async (req, res) => {
  try {
    const equipment = await Equipment.findById(req.params.id)
      .populate('addedBy', 'firstName lastName');
    
    if (!equipment) {
      return res.status(404).json({ message: 'Equipment not found' });
    }
    
    res.json({ equipment });
  } catch (error) {
    console.error('Get equipment by ID error:', error);
    
    if (error.kind === 'ObjectId') {
      return res.status(404).json({ message: 'Equipment not found' });
    }
    
    res.status(500).json({ message: 'Server error' });
  }
};

// Create equipment (admin only)
exports.createEquipment = async (req, res) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    
    const {
      name,
      description,
      serialNumber,
      category,
      location,
      condition
    } = req.body;
    
    // Check if equipment with same serial number already exists
    const existingEquipment = await Equipment.findOne({ serialNumber });
    if (existingEquipment) {
      return res.status(400).json({ message: 'Equipment with this serial number already exists' });
    }
    
    // Create new equipment
    const equipment = new Equipment({
      name,
      description,
      serialNumber,
      category,
      location,
      condition: condition || 'good',
      addedBy: req.user._id
    });
    
    // If there's an image file
    if (req.file) {
      equipment.imageUrl = `/uploads/${req.file.filename}`;
    }
    
    await equipment.save();
    
    res.status(201).json({
      message: 'Equipment created successfully',
      equipment
    });
  } catch (error) {
    console.error('Create equipment error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Update equipment (admin only)
exports.updateEquipment = async (req, res) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    
    const {
      name,
      description,
      serialNumber,
      category,
      location,
      condition,
      status
    } = req.body;
    
    // Find equipment by ID
    const equipment = await Equipment.findById(req.params.id);
    
    if (!equipment) {
      return res.status(404).json({ message: 'Equipment not found' });
    }
    
    // Check if serial number exists on another equipment
    if (serialNumber && serialNumber !== equipment.serialNumber) {
      const existingEquipment = await Equipment.findOne({ serialNumber });
      if (existingEquipment) {
        return res.status(400).json({ message: 'Equipment with this serial number already exists' });
      }
    }
    
    // Update fields
    if (name) equipment.name = name;
    if (description) equipment.description = description;
    if (serialNumber) equipment.serialNumber = serialNumber;
    if (category) equipment.category = category;
    if (location) equipment.location = location;
    if (condition) equipment.condition = condition;
    if (status) equipment.status = status;
    
    // If there's a new image file
    if (req.file) {
      // Delete old image if it exists
      if (equipment.imageUrl && equipment.imageUrl !== 'default-equipment.jpg') {
        const oldImagePath = path.join(__dirname, '../../uploads', path.basename(equipment.imageUrl));
        if (fs.existsSync(oldImagePath)) {
          fs.unlinkSync(oldImagePath);
        }
      }
      
      equipment.imageUrl = `/uploads/${req.file.filename}`;
    }
    
    await equipment.save();
    
    res.json({
      message: 'Equipment updated successfully',
      equipment
    });
  } catch (error) {
    console.error('Update equipment error:', error);
    
    if (error.kind === 'ObjectId') {
      return res.status(404).json({ message: 'Equipment not found' });
    }
    
    res.status(500).json({ message: 'Server error' });
  }
};

// Delete equipment (admin only)
exports.deleteEquipment = async (req, res) => {
  try {
    // Find equipment
    const equipment = await Equipment.findById(req.params.id);
    
    if (!equipment) {
      return res.status(404).json({ message: 'Equipment not found' });
    }
    
    // Check if equipment is currently reserved
    const activeReservations = await Reservation.find({
      equipment: req.params.id,
      status: { $in: ['pending', 'approved'] }
    });
    
    if (activeReservations.length > 0) {
      return res.status(400).json({
        message: 'Cannot delete equipment with active reservations'
      });
    }
    
    // Delete image if exists
    if (equipment.imageUrl && equipment.imageUrl !== 'default-equipment.jpg') {
      const imagePath = path.join(__dirname, '../../uploads', path.basename(equipment.imageUrl));
      if (fs.existsSync(imagePath)) {
        fs.unlinkSync(imagePath);
      }
    }
    
    // Delete equipment
    await Equipment.findByIdAndDelete(req.params.id);
    
    res.json({ message: 'Equipment deleted successfully' });
  } catch (error) {
    console.error('Delete equipment error:', error);
    
    if (error.kind === 'ObjectId') {
      return res.status(404).json({ message: 'Equipment not found' });
    }
    
    res.status(500).json({ message: 'Server error' });
  }
};

// Get equipment categories
exports.getCategories = async (req, res) => {
  try {
    // Aggregate to get unique categories
    const categories = await Equipment.aggregate([
      { $group: { _id: '$category' } },
      { $sort: { _id: 1 } }
    ]);
    
    res.json({
      categories: categories.map(cat => cat._id)
    });
  } catch (error) {
    console.error('Get categories error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = exports;
