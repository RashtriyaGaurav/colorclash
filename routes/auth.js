const express = require('express');
const router = express.Router();
const userModel = require('../models/userModel');
const { registerUser, loginUser, logoutUser } = require('../controllers/authController');
const { isLoggedin } = require('../middlewares/isLoggedin');
// const { isLoggedin } = require('../middlewares/isLoggedin');

router.get('/login', function (req, res) {
    res.render('Auth/login');
})

router.get('/register', function (req, res) {
    res.render('Auth/register');
})

router.get('/info', function (req, res) {
    res.render('Auth/info');
})

router.post('/update/user', isLoggedin, async function (req, res) {
    let { name, email, mobno } = req.body;
    let user = req.user;
    await userModel.findOneAndUpdate({_id:user._id},{name,email,mobno},{new:true})
    res.redirect('/Main/profile')
})

router.post('/user/register', registerUser);
router.post('/user/login', loginUser);
router.get('/user/logout', logoutUser);

module.exports = router;
