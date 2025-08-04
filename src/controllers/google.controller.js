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

  // Redirect to dashboard WITHOUT token in URL
  res.redirect(`${process.env.CLIENT_URL}/dashboard`);  
};