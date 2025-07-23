const mongoose = require('mongoose');

const reservationSchema = new mongoose.Schema({
  equipment: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Equipment',
    required: true
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  startDate: {
    type: Date,
    required: true
  },
  endDate: {
    type: Date,
    required: true
  },
  purpose: {
    type: String,
    required: true,
    trim: true
  },
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected', 'returned', 'cancelled'],
    default: 'pending'
  },
  returnCondition: {
    type: String,
    enum: ['good', 'damaged', 'lost', ''],
    default: ''
  },
  adminNotes: {
    type: String,
    trim: true
  },
  userNotes: {
    type: String,
    trim: true
  },
  returnDate: {
    type: Date
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Compound index to prevent double bookings
reservationSchema.index({ equipment: 1, startDate: 1, endDate: 1, status: 1 });

const Reservation = mongoose.model('Reservation', reservationSchema);

module.exports = Reservation;
