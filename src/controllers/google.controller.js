const passport = require('passport');
const { signToken } = require('../services/jwt.service'); // Importing signToken

exports.googleAuth = passport.authenticate('google', {
  scope: ['profile', 'email']
});

exports.googleCallback = (req, res) => {
  const token = signToken(req.user._id);
  res.redirect(`${process.env.CLIENT_URL}?token=${token}`);
};