if (process.env.NODE_ENV === 'prod') {
  require('dotenv').config({ path: '/home/ec2-user/nodeForge/.env' });
} else {
  require('dotenv').config(); // Uses .env in root
}

require('./utils/validateEnv')();

const express = require('express');
const passport = require('passport');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const helmet = require('helmet'); // Security headers
const rateLimit = require('express-rate-limit'); // Rate limiting

// DB Connection
const connectDB = require('./config/db');
connectDB();

// Passport config
require('./config/passport');

const app = express();


// Trust proxy (important when behind Nginx or load balancer)
app.set('trust proxy', 1); // Enables rate limiter to use X-Forwarded-For

const allowedOrigins = [
  process.env.CLIENT_URL,
  'https://pwps.online',
  'https://api.pwps.online',
  'https://api.pwps.online/api',
];

// Security Middleware: Helmet
app.use(helmet({
  contentSecurityPolicy: false, // Disable if you don't use CSP yet
  crossOriginEmbedderPolicy: false,
  crossOriginResourcePolicy: { policy: 'same-site' },
}));

app.use(cors({
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
    console.warn(`CORS blocked: ${origin}`);
    callback(new Error('Not allowed by CORS'));
  },
  credentials: true
}));

app.use(cookieParser());
express.json({ limit: '10kb' }); // Limit JSON body size to 10kb

// Rate Limiting
const authLimiter = rateLimit({

  windowMs: process.env.RATE_LIMIT_WINDOW_MS || 15 * 60 * 1000, // 15 minutes
  max: process.env.RATE_LIMIT_MAX || 100, // Limit each IP to 100 requests per windowMs

  message: {
    status: 'error',
    message: 'Too many requests from this IP, please try again after 15 minutes.'
  },

  standardHeaders: true, // Return rate limit info in headers (RateLimit-*)
  legacyHeaders: false,  // Disable X-RateLimit-*, etc.
  skipSuccessfulRequests: false,

  skip: (req) => {
    // Optional: Skip rate limiting for certain IPs (e.g. internal)
    // if (req.ip === '127.0.0.1') return true;
    return false;
  }
});

// Applying rate limiter **only** to sensitive auth routes
app.use('/api/auth/login', authLimiter);
app.use('/api/auth/forgot-password', authLimiter);
app.use('/api/auth/reset-password', authLimiter);
app.use('/api/auth/verify', authLimiter); // if using POST to verify

app.use(passport.initialize());
// app.use(passport.session());

// for nginx on ec2 instance
app.get('/', (req, res) => {
  res.status(200).json({
    service: 'Authentication API',
    status: 'Running',
    version: '1.0.0',
    docs: `${process.env.CLIENT_URL}/api-docs` || 'NA'
  });
});

// Health check route
app.get('/health', (req, res) => {
  res.status(200).json({ 
    status: 'OK', 
    message: 'Auth service is running.',
    timestamp: new Date().toISOString(),
    env: process.env.NODE_ENV || 'ec2' 
  });
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
  console.error('[Global Error]', err.stack || err.message); // Logging the error stack trace

  // Handle CORS errors
  if (err.message.includes('CORS')) {
    return res.status(403).json({
      status: 'error',
      message: 'Access denied due to CORS policy.'
    });
  }
  
  const statusCode = err.statusCode || 500;  // Default to 500 if no status code is set
  res.status(statusCode).json({
    status: 'error',
    message: err.message || 'Something went wrong',
  });
});

// Start server
if (process.env.NODE_ENV !== 'serverless') {
  const PORT = process.env.PORT || 3000;

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Auth service running on port ${PORT}`);
    console.log(`Allowed origins: ${allowedOrigins.join(', ')}`);
  });
}

module.exports = app; // Exporting the app for serverless deployment