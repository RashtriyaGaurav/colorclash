const userModel = require('../models/userModel');
const bcrypt = require('bcrypt');
const { generateToken } = require('../utils/generateToken');

module.exports.registerUser = async function (req, res) {
    try {
        let { name, mobno, email, password } = req.body;
        bcrypt.genSalt(10, function (err, salt) {
            bcrypt.hash(password, salt, async function (err, hash) {
                if (err) {
                    messageError = err.message
                    res.redirect('/Auth/register', { messageError });
                } else {
                    let user = await userModel.create({ name, mobno, email, password: hash });
                    let token = generateToken(user);
                    res.cookie("token", token);
                    res.redirect('/Main/home');
                }
            });
        });
    } catch (err) {
        messageError = err.message
        res.redirect('/Auth/register', { messageError });
    }
}

module.exports.loginUser = async function (req, res) {
    let { mobno, password } = req.body;
    let user = await userModel.findOne({ mobno: mobno });
    if (!user) { return res.status(400).send("Email or password incorrect!") }
    await bcrypt.compare(password, user.password, async function (err, result) {
        if (result) {
            let token = generateToken(user);
            res.cookie("token", token)
            res.redirect('/Main/home');
        }
        else {
            return res.status(400).send("Email or password incorrect!")
        }
    });
}

module.exports.logoutUser = function (req, res) {
    res.cookie('token', '');
    // req.flash('error', 'Logged Out');
    res.redirect('/')
}