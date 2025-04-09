// models/Bid.js
const mongoose = require('mongoose');

const bidSchema = new mongoose.Schema({
  color: {
    type: String,
    required: true,
    enum: ['red', 'blue'],
  },
  amount: {
    type: Number,
    required: true,
    min: 1,
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'user',
    required: true
  },
  time: {
    type: Date,
    default: Date.now
  },
  // ✅ Recommended resultTime as a Date
  resultTime: {
    type:String,
    default: '07:00 PM'
  }

});


module.exports = mongoose.model('BidCollection2x', bidSchema);
