const express = require('express');
const router = express.Router();
const userModel = require('../models/userModel');
const { registerUser, loginUser, logoutUser } = require('../controllers/authController');
// const { isLoggedin } = require('../middlewares/isLoggedin');

router.get('/login',function(req,res){
    res.render('Auth/login');
})

router.get('/register',function(req,res){
    res.render('Auth/register');
})

router.get('/info',function(req,res){
    res.render('Auth/info');
})

router.post('/user/register', registerUser);
router.post('/user/login', loginUser);
router.get('/user/logout', logoutUser);

module.exports = router;
