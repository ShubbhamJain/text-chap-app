require("dotenv").config();
const express = require('express');
const logger = require('morgan');
const cors = require('cors');
const helmet = require('helmet');

const newUserRouter = require('./routes/newUser');
const userRouter = require('./routes/user');

const app = express();

require('./config/db');

app.use(helmet());
app.disable("x-powered-by");
app.use(cors());
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use('/newUser', newUserRouter);
app.use('/user', userRouter);

module.exports = app;