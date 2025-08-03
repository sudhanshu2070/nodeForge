const passport = require('passport');
const { signToken } = require('../services/jwt.service'); // Importing signToken

exports.googleCallback = async (req, res) => {
  const token = signToken(req.user._id);

  // Sending token back in URL so frontend can store/use it
  res.redirect(`${process.env.CLIENT_URL}/verify?token=${token}&userId=${req.user._id}`);
};