const express = require('express');
const router = express.Router();
const userModel = require('../models/userModel')
const Bid2xCollection = require('../models/bidCollection2x');
const { isLoggedin } = require('../middlewares/isLoggedin');
const { isAdmin } = require('../middlewares/isAdmin');
const csp = require('../middlewares/csp');

router.use(csp);

router.get('/', isLoggedin, isAdmin, function (req, res) {
    res.render('admin/panel');
})

router.get('/Bid2xCollection', isLoggedin, isAdmin, async function (req, res) {
  try {
    const collection = await Bid2xCollection.find().populate('user');
    
    const { redBids, blueBids } = collection.reduce((acc, bid) => {
      if (!bid.user) return acc; // Skip if no user
      
      const bidData = {
        bidId: bid._id,
        color: bid.color,
        amount: bid.amount,
        createdAt: bid.createdAt,
        userId: bid.user._id,
        userName: bid.user.name,
        userEmail: bid.user.email,
      };

      if (bid.color === 'red') {
        acc.redBids.push(bidData);
        acc.redTotal += bid.amount;
      } else if (bid.color === 'blue') {
        acc.blueBids.push(bidData);
        acc.blueTotal += bid.amount;
      }
      
      return acc;
    }, { 
      redBids: [], 
      blueBids: [], 
      redTotal: 0, 
      blueTotal: 0 
    });

    res.render('admin/Bid2xCollection', {
      redBids,
      blueBids,
      redTotal,
      blueTotal
    });
  } catch (err) {
    console.error('Error:', err);
    res.status(500).render('error', {
      message: "Internal Server Error",
      error: process.env.NODE_ENV === 'development' ? err : {}
    });
  }
});

module.exports = router;