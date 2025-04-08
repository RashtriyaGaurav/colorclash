const express = require('express');
const app = express();
const dotenv = require('dotenv').config();
const cookieParser = require('cookie-parser');
const path = require('path');
const index = require('./routes/index')
const authentication = require('./routes/auth')

app.use(express.static(path.join(__dirname,'public')));
app.use(express.json());
app.use(cookieParser());
app.use(express.urlencoded({extended:true}));
app.set('view engine', 'ejs');


app.use('/', index);
app.use('/Auth', authentication);
app.listen(3000);