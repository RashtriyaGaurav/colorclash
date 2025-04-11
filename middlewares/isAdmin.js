const jwt = require('jsonwebtoken');
const userModel = require('../models/userModel');

module.exports.isAdmin = async function (req, res, next) {
    try {
        const token = req.cookies.token; // Get JWT from cookies

        if (!token) {
            return res.redirect('/users/login'); // Redirect if no token found
        }

        // Verify token
        const decoded = jwt.verify(token, process.env.JWT_KEY);

        // Find user in database
        const user = await userModel.findOne({ email: decoded.email }).select('-password');

        if (!user) {
            return res.redirect('/users/login'); // Redirect if user is not found
        }

        // Check if user is an admin
        if (!user.isAdmin) {
            return res.redirect('/'); // Redirect non-admin users to home
        }

        // Attach user data to request
        req.user = user;
        next(); // Allow access to next middleware/route
    } catch (error) {
        console.error("JWT Verification Error:", error.message);
        return res.redirect('/users/login');
    }
};
