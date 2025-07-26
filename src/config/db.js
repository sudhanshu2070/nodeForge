// const mongoose = require('mongoose');
// require('dotenv').config();

// const connectDB = async () => {
//   try {
//     await mongoose.connect(process.env.MONGODB_URI);
//   } catch (err) {
//     console.error('MongoDB Connection Error:', err);
//     process.exit(1);
//   }
// };

// module.exports = connectDB;

const mongoose = require('mongoose');

// Reuse existing connection in Lambda (warm starts)
let cachedConnection = null;

const connectDB = async () => {
  // Reuse existing connection
  if (cachedConnection) {
    console.log('Reusing existing database connection');
    return cachedConnection;
  }

  // First-time connection
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    throw new Error('MONGODB_URI is missing');
  }

  console.log('Creating new database connection...');

  try {
    const conn = await mongoose.createConnection(uri, {
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 30000,
      maxPoolSize: 10,
    });

    // Cache the connection for reuse
    cachedConnection = conn;
    console.log('Database connected successfully');

    return conn;
  } catch (err) {
    console.error('MongoDB Connection Error:', err);
    // Don't use process.exit(1) — it kills Lambda container
    throw err;
  }
};

module.exports = connectDB;