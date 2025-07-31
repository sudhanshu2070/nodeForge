const passport = require('passport');
const { signToken } = require('../services/jwt.service'); // Importing signToken
const verificationService = require('../services/verification.service');

exports.googleAuth = passport.authenticate('google', {
  scope: ['profile', 'email']
});

exports.googleCallback = async (req, res) => {
  const token = signToken(req.user._id);

  // Sending verification email after Google login
  await verificationService.sendLoginVerification(req.user)

  // res.redirect(`${process.env.CLIENT_URL}?token=${token}`);
  res.redirect(`${process.env.CLIENT_URL}/`);
};
