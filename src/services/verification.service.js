const crypto = require('crypto');
const emailService = require('./email.service');
const User = require('../models/user.model');

exports.sendLoginVerification = async (user) => {
  const verificationToken = crypto.randomBytes(32).toString('hex');

  user.verificationToken = verificationToken;
  user.verificationTokenExpires = Date.now() + 15 * 60 * 1000; // 15 minutes
  await user.save();

  const verificationUrl = `${process.env.CLIENT_URL}/verify?token=${verificationToken}&userId=${user._id}`;

  await emailService.sendVerificationLink(user.email, verificationUrl);
};