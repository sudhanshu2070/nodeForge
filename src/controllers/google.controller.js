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

  // Sending token back in URL so frontend can store/use it
  res.redirect(`${process.env.CLIENT_URL}/verify?token=${token}&userId=${req.user._id}`);
};