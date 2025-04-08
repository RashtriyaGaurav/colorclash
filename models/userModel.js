const mongoose = require('mongoose');
mongoose.connect(`${process.env.MONGODB_URI}/colorPrediction`)

const userSchema = mongoose.Schema({
    name: String,
    mobno: Number,
    email: String,
    password: String,
})

const User = mongoose.model('user', userSchema);
module.exports = User;