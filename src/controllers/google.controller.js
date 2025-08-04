const passport = require('passport');
const { signToken } = require('../services/jwt.service'); 
const emailService = require('../services/email.service'); 

exports.googleCallback = async (req, res) => {
  const token = signToken(req.user._id);

  // Checking if it's the user's first login
  if (req.user.isFirstLogin) {
    
    // Sending Welcome Email
    await emailService.sendWelcomeEmail(req.user);
    
    // Updating user record to set isFirstLogin to false
    req.user.isFirstLogin = false;
    await req.user.save();
  }

  res.cookie('jwt', token, {
    httpOnly: true,
    secure: false, // Set to true if using HTTPS
    sameSite: 'Lax',
    maxAge: 24 * 60 * 60 * 1000, // 1 day
  });

  // Checking if Google user needs to set password
  if (!req.user.password) {
    // Redirect to setup-password with token in URL
    return res.redirect(`${process.env.CLIENT_URL}/setup-password?token=${token}`);
  }

  // Regular successful login
  res.redirect(`${process.env.CLIENT_URL}/dashboard`);
};