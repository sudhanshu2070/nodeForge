require('dotenv').config();
require('../config/db');

const User = require('../models/user.model');

async function resetAllSessions() {
  try {
    const result = await User.updateMany(
      {}, // Updating all users
      { $set: { sessionVersion: 1 } },
      { new: false } // don't return docs
    );

    console.log(`Successfully reset sessions for ${result.modifiedCount} users.`);
    console.log(`All users will be logged out on next refresh.`);
    process.exit(0);
  } catch (err) {
    console.error('Error resetting sessions:', err);
    process.exit(1);
  }
}

resetAllSessions();