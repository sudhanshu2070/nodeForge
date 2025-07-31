const https = require('https');
const fs = require('fs');
const path = require('path');

require('dotenv').config({ path: '/home/ec2-user/nodeForge/.env' });// for ec2 instance deployment
require('dotenv').config();

const express = require('express');
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

// Health check route
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'OK', message: 'Auth service is running.' });
});

// Routes
app.use('/api/auth', require('./routes/auth.routes'));
app.use('/api/auth', require('./routes/google.routes'));

// Start server
if (process.env.NODE_ENV !== 'serverless') {
  const PORT = process.env.PORT || 3000;
  // app.listen(PORT, () => console.log(`Auth service running on port ${PORT}`));
  
  const sslOptions = {
    key: fs.readFileSync(path.join(__dirname, 'ssl/key.pem')),
    cert: fs.readFileSync(path.join(__dirname, 'ssl/cert.pem')),
  };

  https.createServer(sslOptions, app).listen(PORT, () => {
    console.log(`HTTPS server running at :${PORT}`);
  });
}

module.exports = app; // Exporting the app for serverless deployment