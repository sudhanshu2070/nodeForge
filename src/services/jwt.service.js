const jwt = require('jsonwebtoken');
const ApiError = require('../utils/apiError');

const signJWTToken = (id, sessionVersion) => {
  return jwt.sign({ id, sessionVersion}, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN
  });
};

const verifyJWTToken = (token) => {
  try {
    return jwt.verify(token, process.env.JWT_SECRET);
  } catch (err) {
    throw new ApiError(401, 'Invalid token');
  }
};

module.exports = { signJWTToken, verifyJWTToken };