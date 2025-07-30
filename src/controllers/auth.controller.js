const authService = require('../services/auth.service');
const { signToken } = require('../services/jwt.service');
const User = require('../models/user.model');
const verificationService = require('../services/verification.service');

exports.signup = async (req, res, next) => {

  try {
    const { email, password, name, phone } = req.body;

    // Optionally validate inputs
    if (!email || !password || !name || !phone) {
      return res.status(400).json({
        status: 'error',
        message: 'Missing required fields',
      });
    }

    const user = await authService.register(email, password, name, phone);

    res.status(201).json({ status: 'success', data: { user } });
  } catch (err) {
      console.error('Signup error:', err);
      res.status(500).json({
        status: 'error',
        message: 'Signup failed',
        detail: err.message,
      });
  }
};

exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const { user, verificationToken } = await authService.login(email, password);

    const verificationUrl = `${process.env.CLIENT_URL}/verify?token=${verificationToken}&userId=${user._id}`;

    if (!user.isVerified) {
      await emailService.sendVerificationLink(user.email, verificationUrl);
      return res.status(200).json({
        status: 'pending',
        message: 'Verification link has been sent to your email.',
      });
    }

    const jwtToken = signToken(user._id);
    res.cookie('jwt', jwtToken, { httpOnly: true });

    res.status(200).json({
      status: 'success',
      message: 'Logged in successfully',
      token: jwtToken,
    });
  } catch (err) {
    next(err);
  }
};

exports.verifyToken = async (req, res, next) => {
  try {
    const { token, userId } = req.body;
    const user = await User.findById(userId);

    if (
      !user ||
      user.verificationToken !== token ||
      user.verificationTokenExpires < Date.now()
    ) {
      return res.status(400).json({ message: 'Invalid or expired verification token' });
    }

    // Clearing token and mark user as verified
    user.verificationToken = undefined;
    user.verificationTokenExpires = undefined;
    user.isVerified = true;
    await user.save();

    const jwtToken = signToken(user._id);

    res.cookie('jwt', jwtToken, { httpOnly: true });
    res.status(200).json({ message: 'Login verified successfully', token: jwtToken });
  } catch (err) {
    next(err);
  }
};