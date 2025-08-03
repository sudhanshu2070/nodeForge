require('dotenv').config({ path: '/home/ec2-user/nodeForge/.env' });// for ec2 instance deployment

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

const allowedOrigins = [
  process.env.CLIENT_URL,
  'https://pwps.online',
  'https://api.pwps.online'
];

// Middleware
app.use(cors({
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true
}));

app.use(cookieParser());

app.use(express.json());
app.use(passport.initialize());
// app.use(passport.session());

// for nginx on ec2 instance
app.get('/', (req, res) => {
  res.status(200).json({
    service: 'Authentication API',
    status: 'Running',
    version: '1.0.0',
    docs: `${process.env.CLIENT_URL}/api-docs` // Optional
  });
});

// Health check route
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'OK', message: 'Auth service is running.' });
});

// Routes
app.use('/api/auth', require('./routes/auth.routes'));
app.use('/api/auth', require('./routes/google.routes'));

// 404 Handler
app.use((req, res, next) => {
  res.status(404).json({ error: 'Endpoint not found' });
});

// Error Handler
app.use((err, req, res, next) => {
  console.error(err);  // Log the error for debugging
  const statusCode = err.statusCode || 500;  // Default to 500 if no status code is set
  res.status(statusCode).json({
    message: err.message || 'Something went wrong',
  });
});

// Start server
if (process.env.NODE_ENV !== 'serverless') {
  const PORT = process.env.PORT || 3000;
  app.listen(PORT, () => console.log(`Auth service running on port ${PORT}`));
}

module.exports = app; // Exporting the app for serverless deployment