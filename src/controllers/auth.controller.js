const authService = require('../services/auth.service');
const { signToken } = require('../services/jwt.service');
const User = require('../models/user.model');
const emailService = require('../services/email.service');

exports.signup = async (req, res, next) => {
  try {
    const { email, password, name, phone } = req.body;

    if (!email || !password || !name || !phone) {
      return res.status(400).json({
        status: 'error',
        message: 'Missing required fields',
      });
    }

    // User registration (handles duplicate check and saving)
    const { user, verificationToken } = await authService.register(email, password, name, phone);

    const verificationUrl = `${process.env.CLIENT_URL}/verify?token=${verificationToken}&userId=${user._id}`;
    await emailService.sendVerificationLink(user.email, verificationUrl);

    res.status(201).json({
      status: 'pending',
      message: 'Registration successful. Please verify your email.',
    });
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
    const { user } = await authService.login(email, password);

    if (!user.isVerified) {
      return res.status(403).json({
        status: 'error',
        message: 'Email not verified. Please check your inbox.',
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

    // Clearing token and verify user
    user.verificationToken = undefined;
    user.verificationTokenExpires = undefined;
    user.isVerified = true;
    await user.save();

    const jwtToken = signToken(user._id);
    res.cookie('jwt', jwtToken, { httpOnly: true });

    res.status(200).json({ message: 'Email verified and logged in.', token: jwtToken });
  } catch (err) {
    next(err);
  }
};