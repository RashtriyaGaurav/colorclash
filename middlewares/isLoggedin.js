const jwt = require('jsonwebtoken');
const userModel = require('../models/userModel');

module.exports.isLoggedin = async function (req, res, next) {
    try {
        const token = req.cookies?.token;
        if (!token) {
            return res.redirect('/Auth/info');
        }
        let decoded;
        try {
            decoded = jwt.verify(token, process.env.JWT_KEY);
        } catch (error) {
            console.error("JWT Verification Error:", error.message);
            return res.redirect('/Auth/info');
        }
        let user = await userModel.findOne({ email: decoded.email }).select('-password');
        if (!user) {
            return res.redirect('/Auth/info');
        }
        req.user = user;
        next();
    } catch (error) {
        console.error("Middleware Error:", error.message);
        return res.redirect('/Auth/info');
    }
};
