const mongoose = require('mongoose');

const bidResultSchema = new mongoose.Schema({
  bidId : String,
  redTotal:String,
  blueTotal:String,
  WinnerColor:String,
  bidUsers:Array,
});

module.exports = mongoose.model('BidResult2x', bidResultSchema);
