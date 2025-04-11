const express = require('express');
const router = express.Router();
const userModel = require('../models/userModel')
const Bid2xCollection = require('../models/bidCollection2x');
const { isLoggedin } = require('../middlewares/isLoggedin');
const { isAdmin } = require('../middlewares/isAdmin');

router.get('/', isLoggedin, isAdmin, function (req, res) {
    res.render('admin/panel');
})

router.get('/Bid2xCollection', isLoggedin, isAdmin, async function (req, res) {
  try {
    const collection = await Bid2xCollection.find();

    const redBids = [];
    const blueBids = [];
    let redTotal = 0;
    let blueTotal = 0;

    for (let bid of collection) {
      const user = await userModel.findById(bid.user); // Assuming bid.user is ObjectId

      if (user) {
        const bidData = {
          bidId: bid._id,
          color: bid.color,
          amount: bid.amount,
          createdAt: bid.createdAt,
          userId: user._id,
          userName: user.name,
          userEmail: user.email,
        };

        if (bid.color === 'red') {
          redBids.push(bidData);
          redTotal += bid.amount;
        } else if (bid.color === 'blue') {
          blueBids.push(bidData);
          blueTotal += bid.amount;
        }
      }
    }

    res.render('admin/Bid2xCollection', {
      redBids,
      blueBids,
      redTotal,
      blueTotal
    });
  } catch (err) {
    console.error('Error:', err);
    res.status(500).send("Internal Server Error");
  }
});



module.exports = router;