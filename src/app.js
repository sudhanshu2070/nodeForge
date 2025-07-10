require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const passport = require('passport');
const cors = require('cors');
const cookieParser = require('cookie-parser');

// DB Connection
const connectDB = require('./config/db');
connectDB();

// Passport config
require('./config/passport');

const app = express();

// Middleware
app.use(cors({ origin: process.env.CLIENT_URL, credentials: true }));
app.use(cookieParser());
app.use(express.json());
app.use(passport.initialize());
// app.use(passport.session());

// Routes
app.use('/api/auth', require('./routes/auth.routes'));
app.use('/api/auth', require('./routes/google.routes'));

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Auth service running on port ${PORT}`));