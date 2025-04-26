const express = require('express');
const { isLoggedin } = require('../middlewares/isLoggedin');
const router = express.Router();
const userModel = require('../models/userModel');
const mongoose = require('mongoose');
const BidCollection2x = require('../models/bidCollection2x');
const BidCollection2xCopy = require('../models/bidCollection2xCopy');
const bidResult = require('../models/bidResult');
const bidCollection2xCopy = require('../models/bidCollection2xCopy');

router.get('/', isLoggedin, function (req, res) {
  let user = req.user
  res.render('Main/home', { user });
})

router.get('/Main/home', isLoggedin, function (req, res) {
  let user = req.user
  res.render('Main/home', { user });
})

router.get('/Main/wallet', isLoggedin, function (req, res) {
  res.render('Main/wallet');
})

router.get('/Main/profile', isLoggedin, function (req, res) {
  let user = req.user
  res.render('Main/profile', { user });
})

router.get('/Main/orders', isLoggedin, async function (req, res) {
  try {
    let user = req.user;
    let orders = user.bids; // This is an array of ObjectIds or order IDs

    // Fetch all orders matching these IDs
    let userOrder = await bidCollection2xCopy.find({ _id: { $in: orders } });
    // let resultOrder = await bidResult.find();


    res.render('Main/orders', { userOrder}); // Send to frontend
  } catch (err) {

    res.status(500).send("Something went wrong");
  }
});

router.get('/bid/bid2x', isLoggedin, function (req, res) {
  res.render('bid/bid2x', { user: req.user });;
})

// POST /bid/submit-bid/:userid
router.post('/bid/submit-bid/:userid', isLoggedin, async (req, res) => {
  const { color, amount } = req.body;
  const userId = req.params.userid;

  // Validate ObjectId
  if (!mongoose.Types.ObjectId.isValid(userId)) {
    return res.status(400).json({ error: 'Invalid user ID format' });
  }

  // Validate input data
  if (!color || !amount || isNaN(amount) || Number(amount) <= 0) {
    return res.status(400).json({ error: 'Invalid bid data' });
  }

  try {
    const user = await userModel.findById(userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Check coin balance
    if (user.coins < amount) {
      return res.status(400).json({ error: 'Not enough coins to place bid' });
    }

    // Deduct coins
    user.coins -= Number(amount);
    await user.save();

    // Create and save the bid
    const bid = new BidCollection2x({
      color,
      amount: Number(amount),
      user: user._id
    });

   await bidCollection2xCopy.create(bid);

    const savedBid = await bid.save();

    // Link bid to user
    await userModel.findByIdAndUpdate(
      userId,
      { $push: { bids: savedBid._id } }
    );

    res.status(200).json({
      message: '✅ Bid saved and coins deducted',
      bidId: savedBid._id,
      remainingCoins: user.coins
    });

  } catch (error) {
    console.error('❌ Error saving bid:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});







module.exports = router;
