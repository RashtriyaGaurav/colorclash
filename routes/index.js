const express = require('express');
const { isLoggedin } = require('../middlewares/isLoggedin');
const router = express.Router();
const userModel = require('../models/userModel');

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
    res.render('Main/profile');
})

module.exports = router;
