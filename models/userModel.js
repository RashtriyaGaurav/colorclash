const mongoose = require('mongoose');
mongoose.connect(`${process.env.MONGODB_URI}/colorPrediction`)

const userSchema = mongoose.Schema({
    name: String,
    mobno: Number,
    email: String,
    password: String,
    bids: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'BidCollection2x'
      }
    ],
    isAdmin:{
      type:Boolean,
      default:false
    },
    coins:{
      type:Number,
      default:0
    }
  });
const User = mongoose.model('user', userSchema);
module.exports = User;