const requiredEnvVars = [
  'SENDGRID_API_KEY',
  'SENDGRID_FROM_EMAIL',
  'NODE_ENV',
  'PORT',
  'JWT_SECRET',
  'JWT_EXPIRES_IN',
  'CLIENT_URL',
  'GOOGLE_CLIENT_ID',
  'GOOGLE_CLIENT_SECRET',
  'GOOGLE_CALLBACK_URL',
  'MONGODB_URI',
  'DB_USER',
  'DB_PASSWORD',
  'RATE_LIMIT_WINDOW_MS',
  'RATE_LIMIT_MAX',
];

module.exports = function validateEnv() {

  requiredEnvVars.forEach(key => {
    if (!process.env[key] || process.env[key].trim() === '') {
      console.error(`Missing required environment variable: ${key}`);
      console.error('Please check your .env file.');
      process.exit(1); // Exit the app
    }
  });
  console.log('All required environment variables are set.');
};