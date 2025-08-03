const crypto = require('crypto');
const User = require('../models/user.model');
const { nextTick } = require('process');

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

exports.login = async (emailOrUserId, password) => {
  try {
    console.log('Login attempt for:', emailOrUserId);
    const user = await User.findOne({
      $or: [
        { email: emailOrUserId.toLowerCase() },
        { userId: emailOrUserId.toUpperCase() },
      ]
    }).select('+password');

    if (!user) {
      throw new Error('User not found');
    }

    const isCorrectPassword = await user.correctPassword(password);
    if (!isCorrectPassword) {
      throw new Error("Password doesn't match");
    }

    return { user };
  } catch (err) {
    // Re-throwing the error so the controller can handle it
    throw err;
  }
};
