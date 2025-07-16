const crypto = require('crypto');
const User = require('../models/user.model');

exports.register = async (email, password, name) => {
  if (await User.findOne({ email })) {
    throw new Error('Email already exists');
  }
  return await User.create({ email, password, name });
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