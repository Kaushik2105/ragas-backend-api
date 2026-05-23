const authService = require('../services/auth.services');
const { sendSuccess, sendError } = require('../utils/response.utils');
const config = require('../config/config');

const refreshCookieOptions = {
  httpOnly: true,
  secure: config.nodeEnv === 'development',
  sameSite: config.nodeEnv === 'development' ? 'none' : 'lax',
  maxAge: 7 * 24 * 60 * 60 * 1000,
};

const register = async (req, res, next) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return sendError(res, 400, 'Name, email, and password are required.');
    }
    if (password.length < 6) {
      return sendError(res, 400, 'Password must be at least 6 characters.');
    }

    const result = await authService.register({ name, email, password });

    // Set refresh token in HTTP-only cookie
    res.cookie('refreshToken', result.refreshToken, refreshCookieOptions);

    return sendSuccess(res, 201, 'Registration successful.', {
      user: result.user,
      accessToken: result.accessToken,
    });
  } catch (error) {
    next(error);
  }
};

const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return sendError(res, 400, 'Email and password are required.');
    }

    const result = await authService.login({ email, password });

    res.cookie('refreshToken', result.refreshToken, refreshCookieOptions);

    return sendSuccess(res, 200, 'Login successful.', {
      user: result.user,
      accessToken: result.accessToken,
    });
  } catch (error) {
    next(error);
  }
};

const refreshToken = async (req, res, next) => {
  try {
    const token = req.cookies.refreshToken || req.body.refreshToken;
    const result = await authService.refreshTokenService(token);

    res.cookie('refreshToken', result.refreshToken, refreshCookieOptions);

    return sendSuccess(res, 200, 'Token refreshed.', {
      accessToken: result.accessToken,
    });
  } catch (error) {
    next(error);
  }
};

const forgotPassword = async (req, res, next) => {
  try {
    const { email } = req.body;
    if (!email) {
      return sendError(res, 400, 'Email is required.');
    }
    const token = await authService.forgotPassword(email);
    return sendSuccess(res, 200, 'If that email exists, a reset link was generated.', { token });
  } catch (error) {
    next(error);
  }
};

const resetPassword = async (req, res, next) => {
  try {
    const { token, password } = req.body;
    if (!token || !password) {
      return sendError(res, 400, 'Token and new password are required.');
    }
    if (password.length < 6) {
      return sendError(res, 400, 'Password must be at least 6 characters.');
    }
    await authService.resetPassword(token, password);
    return sendSuccess(res, 200, 'Password successfully reset.');
  } catch (error) {
    next(error);
  }
};

const logout = async (req, res, next) => {
  try {
    await authService.logout(req.user.id);

    res.clearCookie('refreshToken', {
      httpOnly: true,
      secure: config.nodeEnv === 'production',
      sameSite: config.nodeEnv === 'production' ? 'none' : 'lax',
    });
    return sendSuccess(res, 200, 'Logged out successfully.');
  } catch (error) {
    next(error);
  }
};

module.exports = { register, login, forgotPassword, resetPassword, refreshToken, logout };
