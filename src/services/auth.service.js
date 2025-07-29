const crypto = require('crypto');
const User = require('../models/user.model');

exports.register = async (email, password, name, phone) => {
  // if email already exists
  if (await User.findOne({ email })) {
    throw new Error('Email already exists');
  }

  // if phone already exists
  if (await User.findOne({ phone })) {
    throw new Error('Phone number already exists');
  }

  // Creating the user
  return await User.create({ email, password, name, phone });
};

exports.login = async (email, password) => {
  const user = await User.findOne({ email }).select('+password');
  if (!user || !(await user.correctPassword(password))) {
    throw new Error('Incorrect email or password');
  }
  
  // Generating a secure token
  const verificationToken = crypto.randomBytes(32).toString('hex');

  // Setting token + expiry on user
  user.verificationToken = verificationToken;
  user.verificationTokenExpires = Date.now() + 15 * 60 * 1000; // 15 minutes
  await user.save();

  return { user, verificationToken };
};