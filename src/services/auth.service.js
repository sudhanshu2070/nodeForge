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
  const user = await User.create({ email, password, name, phone });

  // Generating verification token
  const verificationToken = crypto.randomBytes(32).toString('hex');
  user.verificationToken = verificationToken;
  user.verificationTokenExpires = Date.now() + 60 * 60 * 1000; // 1 hour
  await user.save();

  return { user, verificationToken };
};

exports.login = async (email, password) => {
  const user = await User.findOne({ email }).select('+password');

  if (!user || !(await user.correctPassword(password))) {
    throw new Error('Invalid email or password');
  }

  return { user };
};