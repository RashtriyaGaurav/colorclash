const express = require('express');
const app = express();
const dotenv = require('dotenv').config();
const cookieParser = require('cookie-parser');
const path = require('path');
const index = require('./routes/index')
const authentication = require('./routes/auth')
const adminPanel = require('./routes/admin');
const Bid = require('./models/bidCollection2x');
const bidResult = require('./models/bidResult');


app.use(express.static(path.join(__dirname, 'public')));
app.use(express.json());
app.use(cookieParser());
app.use(express.urlencoded({ extended: true }));
app.set('view engine', 'ejs');

// Timer Variables
let timerStartTime = Date.now(); // Timer start time (in milliseconds)
const timerDuration = 10 * 60 * 1000; // 10 minutes in milliseconds (can adjust as needed)
let timerInterval; // Interval for checking the timer

async function calculateResult() {
    try {
        // Fetch all bids placed before now
        const bids = await Bid.find();
        console.log(bids)
        let redTotal = 0;
        let blueTotal = 0;

        bids.forEach(bid => {
            if (bid.color === 'red') {
                redTotal += bid.amount;
            } else if (bid.color === 'blue') {
                blueTotal += bid.amount;
            }
        });

        const WinnerColor = redTotal < blueTotal ? 'red' : 'blue';

        await bidResult.create({
            redTotal,
            blueTotal,
            WinnerColor,
            bidUsers:bids
        })

        // ✅ Optional: After result, you can clear all bids for next round
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
    timerStartTime = Date.now();
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
app.get('/get-remaining-time', (req, res) => {
    const remainingTime = getRemainingTime();
    res.json({ remainingTime });
});

// Route to fetch the result data after the timer expires (for logging/other purposes)

app.use('/', index);
app.use('/Auth', authentication);
app.use('/Admin', adminPanel);
app.listen(3000);