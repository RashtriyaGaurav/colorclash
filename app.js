const express = require('express');
const app = express();
const dotenv = require('dotenv').config();
const { isLoggedin } = require('./middlewares/isLoggedin');
const cookieParser = require('cookie-parser');
const path = require('path');
const index = require('./routes/index')
const authentication = require('./routes/auth')
const adminPanel = require('./routes/admin');
const Bid = require('./models/bidCollection2x');
const BidCollection2xCopy = require('./models/bidCollection2xCopy');
const bidResult = require('./models/bidResult');
const userModel = require('./models/userModel');
const moment = require('moment-timezone');
const indiaTime = moment().tz("Asia/Kolkata").toDate();



app.use(express.static(path.join(__dirname, 'public')));
app.use(express.json());
app.use(cookieParser());
app.use(express.urlencoded({ extended: true }));
app.set('view engine', 'ejs');


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


// Timer Variables
let timerStartTime = moment.tz("Asia/Kolkata").valueOf(); // Gets IST timestamp in milliseconds
const timerDuration = 3 * 60 * 1000; // 10 minutes in milliseconds (can adjust as needed)
let timerInterval; // Interval for checking the timer

async function calculateResult() {
    try {
        // Fetch all bids
        const bids = await Bid.find();
        // console.log(bids);

        let redTotal = 0;
        let blueTotal = 0;

        // Calculate totals
        bids.forEach(bid => {
            if (bid.color === 'red') {
                redTotal += bid.amount;
            } else if (bid.color === 'blue') {
                blueTotal += bid.amount;
            }
        });

        const WinnerColor = redTotal < blueTotal ? 'red' : 'blue';

        const winnerUsers = [];

        // Update each bid with result
        for (const bid of bids) {
            const resultStatus = bid.color === WinnerColor ? "You Won" : "Lossed";

            // Update in DB
            await BidCollection2xCopy.findByIdAndUpdate(bid._id, { result: resultStatus });

            if (resultStatus === "You Won") {
                winnerUsers.push(bid.user);
            }
        }

        // Save final result
        await bidResult.create({
            redTotal,
            blueTotal,
            WinnerColor,
            bidUsers: bids,           // original bids without modified result (optional)
            winnerUsers: winnerUsers  // list of winning user IDs
        });

        // Optionally clear all bids after result if you want a fresh round
        await Bid.deleteMany({});

    } catch (error) {
        console.error('Error calculating result:', error);
        return null;
    }
}







// Function to calculate the remaining time
function getRemainingTime() {
    const now = Date.now();
    const remainingTime = Math.max(0, timerStartTime + timerDuration - now);
    return remainingTime;
}

// Function to reset the timer
function resetTimer() {
    let timerStartTime = moment.tz("Asia/Kolkata").valueOf();

    console.log("Timer has been reset.");
}

// Function to check if the timer has expired
let isTimerExpired = false; // new flag

function checkTimer() {
    const remainingTime = getRemainingTime();

    if (remainingTime <= 0 && !isTimerExpired) {
        console.log("Timer expired!");
        calculateResult();
        isTimerExpired = true; // set expired to true

        setTimeout(() => {
            resetTimer();
            isTimerExpired = false; // reset the flag after timer is reset
        }, 5000);
    }
}

// Start the timer when the server is initialized
function startTimerLoop() {
    timerInterval = setInterval(() => {
        checkTimer();
    }, 1000); // Check every second
}

// Call this to start the timer loop when the server starts
startTimerLoop();

// Route to get the remaining time of the timer
function getRemainingTime() {
    const now = moment.tz("Asia/Kolkata").valueOf();
    const remainingTime = Math.max(0, timerStartTime + timerDuration - now);
    return remainingTime;
}


// Route to fetch the result data after the timer expires (for logging/other purposes)

app.use('/', index);
app.use('/Auth', authentication);
app.use('/Admin', adminPanel);
app.listen(3000);