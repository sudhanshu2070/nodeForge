const User = require('../models/user.model');
const { signToken } = require('./jwt.service');

exports.register = async (email, password, name) => {
  if (await User.findOne({ email })) {
    throw new Error('Email already exists');
  }
  return await User.create({ email, password, name });
};

exports.login = async (email, password) => {
  const user = await User.findOne({ email }).select('+password');
  if (!user || !(await user.correctPassword(password))) {
    throw new Error('Incorrect email or password');
  }
  return signToken(user._id);
};