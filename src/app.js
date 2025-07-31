require('dotenv').config({ path: '/home/ec2-user/nodeForge/.env' });
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

// // Convert AWS buffer body to string (if needed)
// app.use((req, res, next) => {
//   if (Buffer.isBuffer(req.body)) {
//     try {
//       req.body = JSON.parse(req.body.toString('utf8'));
//     } catch (e) {
//       console.error('Invalid JSON body:', e);
//     }
//   }
//   next();
// });

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
  app.listen(PORT, () => console.log(`Auth service running on port ${PORT}`));
}

module.exports = app; // Exporting the app for serverless deployment
