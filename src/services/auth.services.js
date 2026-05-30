const { User } = require('../models');
const { hashPassword, comparePassword } = require('../utils/bcrypt.utils');
const { generateAccessToken, generateRefreshToken, verifyRefreshToken } = require('../utils/jwt.utils');
const crypto = require('crypto');

const register = async ({ name, email, password }) => {
  const existingUser = await User.findOne({ where: { email } });
  if (existingUser) {
    throw Object.assign(new Error('Email already registered.'), { statusCode: 409 });
  }

  const hashedPassword = await hashPassword(password);
  const user = await User.create({
    name,
    email,
    password: hashedPassword,
    role: 'user',
  });

  const tokenPayload = { id: user.id, email: user.email, role: user.role };
  const accessToken = generateAccessToken(tokenPayload);
  const refreshToken = generateRefreshToken(tokenPayload);

  user.refreshToken = refreshToken;
  await user.save();

  return {
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      profilePic: user.profilePic,
    },
    accessToken,
    refreshToken,
  };
};

const login = async ({ email, password }) => {
  const user = await User.findOne({ where: { email } });
  if (!user) {
    throw Object.assign(new Error('Invalid email or password.'), { statusCode: 401 });
  }

  if (!user.isActive) {
    throw Object.assign(new Error('Account has been deactivated.'), { statusCode: 403 });
  }

  const isMatch = await comparePassword(password, user.password);
  if (!isMatch) {
    throw Object.assign(new Error('Invalid email or password.'), { statusCode: 401 });
  }

  const tokenPayload = { id: user.id, email: user.email, role: user.role };
  const accessToken = generateAccessToken(tokenPayload);
  const refreshToken = generateRefreshToken(tokenPayload);

  user.refreshToken = refreshToken;
  await user.save();

  return {
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      profilePic: user.profilePic,
    },
    accessToken,
    refreshToken,
  };
};

const refreshTokenService = async (token) => {
  if (!token) {
    throw Object.assign(new Error('Refresh token required.'), { statusCode: 401 });
  }

  const decoded = verifyRefreshToken(token);
  const user = await User.findByPk(decoded.id);

  if (!user || user.refreshToken !== token) {
    throw Object.assign(new Error('Invalid refresh token.'), { statusCode: 401 });
  }

  if (!user.isActive) {
    throw Object.assign(new Error('Account has been deactivated.'), { statusCode: 403 });
  }

  const tokenPayload = { id: user.id, email: user.email, role: user.role };
  const accessToken = generateAccessToken(tokenPayload);
  const newRefreshToken = generateRefreshToken(tokenPayload);

  user.refreshToken = newRefreshToken;
  await user.save();

  return { accessToken, refreshToken: newRefreshToken };
};

const forgotPassword = async (email) => {
  const user = await User.findOne({ where: { email } });
  if (!user) return null; // Silently ignore to prevent email enumeration
  
  const resetToken = crypto.randomBytes(32).toString('hex');
  user.resetToken = resetToken;
  user.resetTokenExpiry = new Date(Date.now() + 3600000); // 1 hour
  await user.save();
  return {
    token: resetToken,
    name: user.name,
    email: user.email,
  };
};

const resetPassword = async (token, newPassword) => {
  const user = await User.findOne({
    where: { resetToken: token }
  });
  
  if (!user || user.resetTokenExpiry < new Date()) {
    throw Object.assign(new Error('Invalid or expired reset token.'), { statusCode: 400 });
  }

  const hashedPassword = await hashPassword(newPassword);
  user.password = hashedPassword;
  user.resetToken = null;
  user.resetTokenExpiry = null;
  await user.save();
};

const logout = async (userId) => {
  const user = await User.findByPk(userId);
  if (user) {
    user.refreshToken = null;
    await user.save();
  }
};

module.exports = { register, login, forgotPassword, resetPassword, refreshTokenService, logout };
