const { Op } = require('sequelize');
const { User, SignupOtp } = require('../models');
const { hashPassword, comparePassword } = require('../utils/bcrypt.utils');
const { generateAccessToken, generateRefreshToken, verifyRefreshToken } = require('../utils/jwt.utils');
const { sendRegistrationOtpEmail } = require('./email.services');
const crypto = require('crypto');

const OTP_EXPIRY_MS = 10 * 60 * 1000;
const VERIFIED_EXPIRY_MS = 15 * 60 * 1000;
const OTP_REQUEST_COOLDOWN_MS = 60 * 1000;
const MAX_OTP_ATTEMPTS = 5;

const normalizeEmail = (email) => String(email || '').trim().toLowerCase();
const hashValue = (value) => crypto.createHash('sha256').update(String(value)).digest('hex');
const generateOtp = () => crypto.randomInt(100000, 1000000).toString();

const requestRegistrationOtp = async ({ name, email }) => {
  const normalizedEmail = normalizeEmail(email);
  const trimmedName = String(name || '').trim();

  const existingUser = await User.findOne({ where: { email: normalizedEmail } });
  if (existingUser) {
    throw Object.assign(new Error('Email already registered.'), { statusCode: 409 });
  }

  await SignupOtp.destroy({
    where: {
      expiresAt: { [Op.lt]: new Date() },
    },
  });

  const existingOtp = await SignupOtp.findOne({ where: { email: normalizedEmail } });
  if (existingOtp && Date.now() - existingOtp.lastSentAt.getTime() < OTP_REQUEST_COOLDOWN_MS) {
    throw Object.assign(new Error('Please wait before requesting another OTP.'), { statusCode: 429 });
  }

  const otp = generateOtp();
  const payload = {
    name: trimmedName,
    email: normalizedEmail,
    otpHash: hashValue(otp),
    expiresAt: new Date(Date.now() + OTP_EXPIRY_MS),
    attempts: 0,
    verifiedAt: null,
    verificationTokenHash: null,
    verificationTokenExpiresAt: null,
    lastSentAt: new Date(),
  };

  if (existingOtp) {
    await existingOtp.update(payload);
  } else {
    await SignupOtp.create(payload);
  }

  try {
    await sendRegistrationOtpEmail({ email: normalizedEmail, name: trimmedName, otp });
  } catch (error) {
    await SignupOtp.destroy({ where: { email: normalizedEmail, otpHash: payload.otpHash } });
    throw error;
  }

  return { email: normalizedEmail, expiresInMinutes: 10 };
};

const verifyRegistrationOtp = async ({ email, otp }) => {
  const normalizedEmail = normalizeEmail(email);
  const signupOtp = await SignupOtp.findOne({ where: { email: normalizedEmail } });

  if (!signupOtp) {
    throw Object.assign(new Error('No OTP request found for this email.'), { statusCode: 400 });
  }
  if (signupOtp.expiresAt < new Date()) {
    await signupOtp.destroy();
    throw Object.assign(new Error('OTP expired. Please request a new one.'), { statusCode: 400 });
  }
  if (signupOtp.attempts >= MAX_OTP_ATTEMPTS) {
    await signupOtp.destroy();
    throw Object.assign(new Error('Too many incorrect attempts. Please request a new OTP.'), { statusCode: 429 });
  }
  if (signupOtp.otpHash !== hashValue(otp)) {
    signupOtp.attempts += 1;
    await signupOtp.save();
    throw Object.assign(new Error('Invalid OTP.'), { statusCode: 400 });
  }

  const verificationToken = crypto.randomBytes(32).toString('hex');
  signupOtp.verifiedAt = new Date();
  signupOtp.verificationTokenHash = hashValue(verificationToken);
  signupOtp.verificationTokenExpiresAt = new Date(Date.now() + VERIFIED_EXPIRY_MS);
  await signupOtp.save();

  return { verificationToken };
};

const register = async ({ email, password, verificationToken }) => {
  const normalizedEmail = normalizeEmail(email);
  const signupOtp = await SignupOtp.findOne({ where: { email: normalizedEmail } });

  if (
    !signupOtp ||
    !signupOtp.verifiedAt ||
    !signupOtp.verificationTokenHash ||
    !signupOtp.verificationTokenExpiresAt ||
    !verificationToken ||
    signupOtp.verificationTokenHash !== hashValue(verificationToken) ||
    signupOtp.verificationTokenExpiresAt < new Date()
  ) {
    throw Object.assign(new Error('Please verify your email before creating an account.'), { statusCode: 400 });
  }

  const existingUser = await User.findOne({ where: { email: normalizedEmail } });
  if (existingUser) {
    await signupOtp.destroy();
    throw Object.assign(new Error('Email already registered.'), { statusCode: 409 });
  }

  const hashedPassword = await hashPassword(password);
  const user = await User.create({
    name: signupOtp.name,
    email: normalizedEmail,
    password: hashedPassword,
    role: 'user',
  });

  const tokenPayload = { id: user.id, email: user.email, role: user.role };
  const accessToken = generateAccessToken(tokenPayload);
  const refreshToken = generateRefreshToken(tokenPayload);

  user.refreshToken = refreshToken;
  await user.save();
  await signupOtp.destroy();

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
  const user = await User.findOne({ where: { email: normalizeEmail(email) } });
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
  const user = await User.findOne({ where: { email: normalizeEmail(email) } });
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

module.exports = {
  requestRegistrationOtp,
  verifyRegistrationOtp,
  register,
  login,
  forgotPassword,
  resetPassword,
  refreshTokenService,
  logout,
};
