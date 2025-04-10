const express = require('express');
const { isLoggedin } = require('../middlewares/isLoggedin');
const router = express.Router();
const userModel = require('../models/userModel');
const mongoose = require('mongoose');
const BidCollection2x = require('../models/bidCollection2x');

router.get('/',isLoggedin,function(req,res){
    let user = req.user
    res.render('Main/home',{user});
})

router.get('/Main/home',isLoggedin,function(req,res){
    let user = req.user
    res.render('Main/home',{user});
})

router.get('/Main/wallet',isLoggedin,function(req,res){
    res.render('Main/wallet');
})

router.get('/Main/profile',isLoggedin,function(req,res){
  let user = req.user
    res.render('Main/profile',{user});
})

router.get('/Main/orders', isLoggedin, async function (req, res) {
  try {
    let user = req.user;
    let orders = user.bids; // This is an array of ObjectIds or order IDs
    console.log(orders)

    // Fetch all orders matching these IDs
    let userOrder = await BidCollection2x.find({ _id: { $in: orders } });

    console.log("Order IDs:"+ orders);
    console.log("User Order Details:"+ userOrder);

    res.render('Main/orders', { userOrder }); // Send to frontend
  } catch (err) {
    console.error("Error fetching orders:", err);
    res.status(500).send("Something went wrong");
  }
});

router.get('/bid/bid2x',isLoggedin,function(req,res){
    res.render('bid/bid2x',{user:req.user});;
})

// POST /bid/submit-bid/:userid

router.post('/bid/submit-bid/:userid', isLoggedin, async (req, res) => {
  const { color, amount } = req.body;
  const userId = req.params.userid;

  // Validate inputs
  if (!color || !amount || isNaN(amount)) {
    return res.status(400).json({ error: 'Invalid data' });
  }

  // Validate ObjectId
  if (!mongoose.Types.ObjectId.isValid(userId)) {
    return res.status(400).json({ error: 'Invalid user ID format' });
  }

  try {
    // Create and save the bid
    const bid = new BidCollection2x({
      color,
      amount: Number(amount),
      user: new mongoose.Types.ObjectId(userId), // ✅ Fix here
    });

    const savedBid = await bid.save();

    // Push bid._id to user's bids array
    await userModel.findByIdAndUpdate(
      userId,
      { $push: { bids: savedBid._id } },
      { new: true }
    );

    res.status(200).json({ message: '✅ Bid saved', bidId: savedBid._id });
  } catch (error) {
    console.error('❌ Error saving bid:', error);
    res.status(500).json({ error: 'Failed to save bid' });
  }
});
  
  



module.exports = router;
