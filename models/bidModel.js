const mongoose = require('mongoose');

const bidSchema = new mongoose.Schema({
  resultTime: {
    type: String,
    default: '07:00 PM' // Expected format: HH:MM AM/PM
  }
});

module.exports = mongoose.model('BidCollection2x', bidSchema);
