const jwt = require('jsonwebtoken');
const config = require('../config/config');

const generateAccessToken = (payload) => {
  return jwt.sign(payload, config.jwtAccessSecret, { expiresIn: '15m' });
};

const generateRefreshToken = (payload) => {
  return jwt.sign(payload, config.jwtRefreshSecret, { expiresIn: '7d' });
};

const verifyAccessToken = (token) => {
  return jwt.verify(token, config.jwtAccessSecret);
};

const verifyRefreshToken = (token) => {
  return jwt.verify(token, config.jwtRefreshSecret);
};

module.exports = {
  generateAccessToken,
  generateRefreshToken,
  verifyAccessToken,
  verifyRefreshToken,
};
