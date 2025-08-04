const jwt = require('jsonwebtoken');
const crypto = require('crypto');
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
    const { usernameOrEmail, password } = req.body;

    const { user } = await authService.login(usernameOrEmail, password);
    
    if (!user) {
      return res.status(401).json({ message: 'Invalid email/user ID or password' });
    }

    if (!user.isEmailVerified) {
      return res.status(403).json({
        status: 'error',
        message: 'Email not verified. Please check your inbox.',
      });
    }

    // Checking if it's the first login
    if (user.isFirstLogin) {

      // Sending the Welcome Email if it's the first login
      await emailService.sendWelcomeEmail(user);

      // Setting isFirstLogin to false after sending the welcome email
      user.isFirstLogin = false;
      await user.save();
    }

    const jwtToken = signToken(user._id);
    res.cookie('jwt', jwtToken, { 
      httpOnly: true,
      secure: false, // Set to true if using HTTPS
      sameSite: 'Lax',
      maxAge: 24 * 60 * 60 * 1000, // 1 day
    });

    return res.status(200).json({
      status: 'success',
      message: 'Logged in successfully',
      token: jwtToken,
      user: {
        userId: user.userId,
        name: user.name,
        email: user.email,
      },
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
    user.isEmailVerified = true;
    
    // Checking if it's the first login
    if (user.isFirstLogin) {

      // Sending the Welcome Email if it's the first login
      await emailService.sendWelcomeEmail(user);

      // Setting isFirstLogin to false after sending the welcome email
      user.isFirstLogin = false;
    }
    
    await user.save();

    const jwtToken = signToken(user._id);
    res.cookie('jwt', jwtToken, { httpOnly: true });

    res.status(200).json({
      message: 'Email verified and logged in.',
      token: jwtToken,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
      },
    });

  } catch (err) {
    next(err);
  }
};

exports.verifyOnRefresh = async (req, res, next) => {
  try {
    const token = req.cookies.jwt;
    if (!token) return res.status(401).json({ message: 'Not authenticated' });

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id).select('-password');

    if (!user) return res.status(404).json({ message: 'User not found' });

    res.status(200).json({ user });
  } catch (err) {
    res.status(401).json({ message: 'Invalid or expired token' });
    next(err);
  }
}; 

exports.logout = (req, res) => {
  res.clearCookie('jwt', { httpOnly: true, secure: false, sameSite: 'Lax' });
  res.status(200).json({ message: 'Logged out successfully' });
}



exports.forgotPassword = async (req, res, next) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(200).json({ 
        status: 'success', 
        message: 'If an account exists, a reset link has been sent' 
      });
    }

    // Generate reset token
    const resetToken = crypto.randomBytes(32).toString('hex');
    const resetPasswordToken = crypto
      .createHash('sha256')
      .update(resetToken)
      .digest('hex');

    // Set token expiry (1 hour)
    user.resetPasswordToken = resetPasswordToken;
    user.resetPasswordExpire = Date.now() + 3600000; // 1 hour
    await user.save();

    // Create reset URL
    const resetUrl = `${process.env.CLIENT_URL}/reset-password/${resetToken}`;

    // Send email
    await emailService.sendPasswordResetEmail(user.email, resetUrl);

    res.status(200).json({
      status: 'success',
      message: 'Password reset link sent to email'
    });
  } catch (err) {
    console.error('Forgot password error:', err);
    res.status(500).json({
      status: 'error',
      message: 'Error sending reset email'
    });
  }
};

exports.resetPassword = async (req, res, next) => {
  try {
    // Get hashed token
    const resetPasswordToken = crypto
      .createHash('sha256')
      .update(req.params.token)
      .digest('hex');

    const user = await User.findOne({
      resetPasswordToken,
      resetPasswordExpire: { $gt: Date.now() }
    });

    if (!user) {
      return res.status(400).json({
        status: 'error',
        message: 'Invalid or expired token'
      });
    }

    // Set new password
    user.password = req.body.password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;
    await user.save();

    // Generate new JWT
    const token = signToken(user._id);
    res.cookie('jwt', token, { 
      httpOnly: true,
      secure: false,
      sameSite: 'Lax',
      maxAge: 24 * 60 * 60 * 1000,
    });

    res.status(200).json({
      status: 'success',
      message: 'Password updated successfully',
      token
    });
  } catch (err) {
    console.error('Reset password error:', err);
    res.status(500).json({
      status: 'error',
      message: 'Error resetting password'
    });
  }
};

exports.setupPassword = async (req, res, next) => {
  try {
    const { password } = req.body;
    const token = req.cookies.jwt;
    
    if (!token) {
      return res.status(401).json({
        status: 'error',
        message: 'Not authenticated'
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id);

    if (!user) {
      return res.status(404).json({
        status: 'error',
        message: 'User not found'
      });
    }

    // Check if user has password (Google users won't have one initially)
    if (user.password) {
      return res.status(400).json({
        status: 'error',
        message: 'Password already set'
      });
    }

    // Set password
    user.password = password;
    await user.save();

    res.status(200).json({
      status: 'success',
      message: 'Password set successfully'
    });
  } catch (err) {
    console.error('Setup password error:', err);
    res.status(500).json({
      status: 'error',
      message: 'Error setting password'
    });
  }
};

exports.checkPasswordStatus = async (req, res) => {
  try {
    const token = req.cookies.jwt;
    if (!token) return res.status(401).json({ message: 'Not authenticated' });

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id);

    if (!user) return res.status(404).json({ message: 'User not found' });

    res.status(200).json({
      hasPassword: !!user.password
    });
  } catch (err) {
    res.status(401).json({ message: 'Invalid or expired token' });
  }
};