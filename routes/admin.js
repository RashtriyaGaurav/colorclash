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
      
      const userBidData = [];
  
      for (let bid of collection) {
        const user = await userModel.findById(bid.user); // Assuming `bid.user` is an ObjectId
  
        if (user) {
          userBidData.push({
            bidId: bid._id,
            color: bid.color,
            amount: bid.amount, // If your schema has this
            userId: user._id,
            userName: user.name,
            userEmail: user.email,
          });
        }
      }

      userBidData.forEach()
  
      res.render('admin/Bid2xCollection', { collection: userBidData });
    } catch (err) {
      console.error('Error:', err);
      res.status(500).send("Internal Server Error");
    }
  });
  



module.exports = router;
