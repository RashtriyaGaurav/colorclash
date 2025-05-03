const express = require('express');
const app = express();
const dotenv = require('dotenv').config();
const { isLoggedin } = require('./middlewares/isLoggedin');
const cookieParser = require('cookie-parser');
const path = require('path');
const index = require('./routes/index');
const authentication = require('./routes/auth');
const adminPanel = require('./routes/admin');
const Bid = require('./models/bidCollection2x');
const BidCollection2xCopy = require('./models/bidCollection2xCopy');
const bidResult = require('./models/bidResult');
const userModel = require('./models/userModel');
const moment = require('moment-timezone');

app.use(express.static(path.join(__dirname, 'public')));
app.use(express.json());
app.use(cookieParser());
app.use(express.urlencoded({ extended: true }));
app.set('view engine', 'ejs');

// Route to display winners
app.get('/bid/winner', isLoggedin, async function (req, res) {
    const winnerusers = [];

    const winner = await bidResult.find();

    for (const result of winner) {
        for (const userId of result.winnerUsers) {
            const userDetails = await userModel.findById(userId);
            if (userDetails) {
                winnerusers.push(userDetails);
            }
        }
    }

    res.render('main/winners', { winnerusers });
});

// ⏲️ Timer Logic
let timerStartTime = moment.tz("Asia/Kolkata").valueOf(); // IST start time in ms
const timerDuration = 3 * 60 * 1000; // 3 minutes
let timerInterval;
let isTimerExpired = false;

// Calculate remaining time
function getRemainingTime() {
    const now = moment.tz("Asia/Kolkata").valueOf();
    return Math.max(0, timerStartTime + timerDuration - now);
}

// Reset the timer
function resetTimer() {
    timerStartTime = moment.tz("Asia/Kolkata").valueOf();
    console.log("Timer reset at:", moment(timerStartTime).tz("Asia/Kolkata").format("YYYY-MM-DD HH:mm:ss"));
}

// Check if timer expired
function checkTimer() {
    const remainingTime = getRemainingTime();

    if (remainingTime <= 0 && !isTimerExpired) {
        console.log("Timer expired!");
        calculateResult();
        isTimerExpired = true;

        // Reset timer after a short delay
        setTimeout(() => {
            resetTimer();
            isTimerExpired = false;
        }, 5000);
    }
}

// Timer loop
function startTimerLoop() {
    timerInterval = setInterval(checkTimer, 1000);
}
startTimerLoop();

// 💡 Core Logic to calculate results
async function calculateResult() {
    try {
        const bids = await Bid.find();

        let redTotal = 0;
        let blueTotal = 0;

        bids.forEach(bid => {
            if (bid.color === 'red') redTotal += bid.amount;
            else if (bid.color === 'blue') blueTotal += bid.amount;
        });

        const WinnerColor = redTotal < blueTotal ? 'red' : 'blue';
        const winnerUsers = [];

        for (const bid of bids) {
            const resultStatus = bid.color === WinnerColor ? "You Won" : "Lossed";

            await BidCollection2xCopy.findByIdAndUpdate(bid._id, { result: resultStatus });

            if (resultStatus === "You Won") {
                winnerUsers.push(bid.user);
            }
        }

        await bidResult.create({
            redTotal,
            blueTotal,
            WinnerColor,
            bidUsers: bids,
            winnerUsers
        });

        await Bid.deleteMany({});
    } catch (error) {
        console.error('Error calculating result:', error);
    }
}

// Routes
app.use('/', index);
app.use('/Auth', authentication);
app.use('/Admin', adminPanel);

// Start Server
app.listen(3000, () => {
    console.log("Server is running on http://localhost:3000");
});
